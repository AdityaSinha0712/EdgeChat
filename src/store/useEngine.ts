import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CreateWebWorkerMLCEngine,
  type WebWorkerMLCEngine,
  type InitProgressReport,
  type ChatCompletionChunk,
} from '@mlc-ai/web-llm';
import { checkWebGPU } from '../lib/webgpu';
import { DEFAULT_MODEL_ID } from '../lib/models';

// ── Types ──────────────────────────────────────────────────────

export type EngineStatus =
  | 'idle'
  | 'checking-gpu'
  | 'loading'
  | 'ready'
  | 'generating'
  | 'error'
  | 'unsupported';

export interface LoadProgress {
  /** 0-1 */
  progress: number;
  text: string;
}

export interface EngineState {
  status: EngineStatus;
  loadProgress: LoadProgress;
  errorMessage: string | null;
  modelId: string;
}

// ── Hook ───────────────────────────────────────────────────────

export function useEngine() {
  const engineRef = useRef<WebWorkerMLCEngine | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const [status, setStatus] = useState<EngineStatus>('idle');
  const [loadProgress, setLoadProgress] = useState<LoadProgress>({
    progress: 0,
    text: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);

  /**
   * Initialize the engine with the given model.
   * Performs WebGPU check → creates worker → loads model with progress.
   * Returns `true` if the engine loaded successfully.
   */
  const initEngine = useCallback(
    async (selectedModelId?: string): Promise<boolean> => {
      const targetModel = selectedModelId ?? modelId;

      // ── WebGPU check ───────────────────────────────────────
      setStatus('checking-gpu');
      setErrorMessage(null);
      setLoadProgress({ progress: 0, text: 'Checking WebGPU support…' });

      const gpuCheck = await checkWebGPU();
      if (!gpuCheck.supported) {
        setStatus('unsupported');
        setErrorMessage(gpuCheck.reason ?? 'WebGPU is not supported.');
        return false;
      }

      // ── Tear down previous engine if switching models ──────
      if (engineRef.current) {
        try {
          await engineRef.current.unload();
        } catch {
          // swallow — old engine may already be dead
        }
        engineRef.current = null;
      }
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      // ── Create worker + engine ─────────────────────────────
      setStatus('loading');
      setLoadProgress({ progress: 0, text: 'Initializing model…' });

      try {
        const worker = new Worker(
          new URL('../workers/llmWorker.ts', import.meta.url),
          { type: 'module' },
        );
        workerRef.current = worker;

        const progressCallback = (report: InitProgressReport) => {
          let text = report.text;
          if (text.includes('Fetching param cache')) {
            text = text.replace(
              'Fetching param cache',
              'Loading cached model weights into VRAM',
            );
          } else if (text.includes('Loading model from cache')) {
            text = text.replace(
              'Loading model from cache',
              'Loading cached model from local storage',
            );
          }
          setLoadProgress({
            progress: report.progress,
            text,
          });
        };

        const engine = await CreateWebWorkerMLCEngine(worker, targetModel, {
          initProgressCallback: progressCallback,
        });

        engineRef.current = engine;
        setModelId(targetModel);
        setStatus('ready');
        setLoadProgress({ progress: 1, text: 'Model loaded' });
        return true;
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load model.',
        );
        return false;
      }
    },
    [modelId],
  );

  /**
   * Stream a chat completion. Yields content deltas as they arrive.
   * The caller is responsible for building the full message from chunks.
   */
  const streamCompletion = useCallback(async function* (
    chatHistory: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>,
  ): AsyncGenerator<string, void, unknown> {
    const engine = engineRef.current;
    if (!engine) {
      throw new Error('Engine not initialized');
    }

    setStatus('generating');

    try {
      const stream = await engine.chat.completions.create({
        messages: chatHistory,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      });

      for await (const chunk of stream as AsyncIterable<ChatCompletionChunk>) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          yield delta;
        }
      }
    } finally {
      setStatus('ready');
    }
  }, []);

  /**
   * Interrupt an in-progress generation.
   */
  const interruptGeneration = useCallback(() => {
    engineRef.current?.interruptGenerate();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.unload();
      workerRef.current?.terminate();
    };
  }, []);

  return {
    status,
    loadProgress,
    errorMessage,
    modelId,
    initEngine,
    streamCompletion,
    interruptGeneration,
  };
}
