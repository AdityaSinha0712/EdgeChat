import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateWebWorkerMLCEngine,
  type WebWorkerMLCEngine,
  type InitProgressReport,
  type ChatCompletionChunk,
} from '@mlc-ai/web-llm';
import { checkWebGPU } from '../lib/webgpu';
import { AVAILABLE_MODELS } from '../lib/models';
import { ModelPicker } from './ModelPicker';
import { TypingIndicator } from './TypingIndicator';
import { Composer } from './Composer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { EngineStatus, LoadProgress } from '../store/useEngine';

interface PaneMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface PaneState {
  messages: PaneMessage[];
  status: EngineStatus;
  loadProgress: LoadProgress;
  isGenerating: boolean;
  modelId: string;
}

interface CompareViewProps {
  modelA: string;
  modelB: string;
  onSetModelA: (id: string) => void;
  onSetModelB: (id: string) => void;
  systemPrompt: string;
}

/**
 * Side-by-side model comparison view.
 *
 * Creates two independent WebWorkerMLCEngine instances and streams
 * responses from both models simultaneously for the same prompt.
 */
export function CompareView({
  modelA,
  modelB,
  onSetModelA,
  onSetModelB,
  systemPrompt,
}: CompareViewProps) {
  const engineARef = useRef<WebWorkerMLCEngine | null>(null);
  const engineBRef = useRef<WebWorkerMLCEngine | null>(null);
  const workerARef = useRef<Worker | null>(null);
  const workerBRef = useRef<Worker | null>(null);

  const [paneA, setPaneA] = useState<PaneState>({
    messages: [],
    status: 'idle',
    loadProgress: { progress: 0, text: '' },
    isGenerating: false,
    modelId: modelA,
  });

  const [paneB, setPaneB] = useState<PaneState>({
    messages: [],
    status: 'idle',
    loadProgress: { progress: 0, text: '' },
    isGenerating: false,
    modelId: modelB,
  });

  const bottomRefA = useRef<HTMLDivElement>(null);
  const bottomRefB = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRefA.current?.scrollIntoView({ behavior: 'smooth' });
  }, [paneA.messages]);
  useEffect(() => {
    bottomRefB.current?.scrollIntoView({ behavior: 'smooth' });
  }, [paneB.messages]);

  const initEngine = useCallback(
    async (
      pane: 'A' | 'B',
      targetModelId: string,
    ): Promise<WebWorkerMLCEngine | null> => {
      const setPane = pane === 'A' ? setPaneA : setPaneB;
      const engineRef = pane === 'A' ? engineARef : engineBRef;
      const workerRef = pane === 'A' ? workerARef : workerBRef;

      setPane((p) => ({
        ...p,
        status: 'checking-gpu',
        loadProgress: { progress: 0, text: 'Checking WebGPU…' },
      }));

      const gpuCheck = await checkWebGPU();
      if (!gpuCheck.supported) {
        setPane((p) => ({ ...p, status: 'unsupported' }));
        return null;
      }

      // Tear down previous
      if (engineRef.current) {
        try { await engineRef.current.unload(); } catch { /* */ }
        engineRef.current = null;
      }
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      setPane((p) => ({
        ...p,
        status: 'loading',
        loadProgress: { progress: 0, text: 'Initializing…' },
      }));

      try {
        const worker = new Worker(
          new URL('../workers/llmWorker.ts', import.meta.url),
          { type: 'module' },
        );
        workerRef.current = worker;

        const engine = await CreateWebWorkerMLCEngine(
          worker,
          targetModelId,
          {
            initProgressCallback: (report: InitProgressReport) => {
              setPane((p) => ({
                ...p,
                loadProgress: { progress: report.progress, text: report.text },
              }));
            },
          },
        );

        engineRef.current = engine;
        setPane((p) => ({
          ...p,
          status: 'ready',
          modelId: targetModelId,
          loadProgress: { progress: 1, text: 'Ready' },
        }));
        return engine;
      } catch {
        setPane((p) => ({ ...p, status: 'error' }));
        return null;
      }
    },
    [],
  );

  const handleSend = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMsgId = uuidv4();
      const userMsg: PaneMessage = { id: userMsgId, role: 'user', content: trimmed };

      // Add user message to both panes
      setPaneA((p) => ({ ...p, messages: [...p.messages, userMsg] }));
      setPaneB((p) => ({ ...p, messages: [...p.messages, userMsg] }));

      // Stream from both engines in parallel
      const streamPane = async (
        pane: 'A' | 'B',
        targetModelId: string,
      ) => {
        const engineRef = pane === 'A' ? engineARef : engineBRef;
        const setPane = pane === 'A' ? setPaneA : setPaneB;

        let engine = engineRef.current;
        if (!engine || (pane === 'A' ? paneA : paneB).status !== 'ready') {
          engine = await initEngine(pane, targetModelId);
        }
        if (!engine) return;

        setPane((p) => ({ ...p, isGenerating: true }));

        const assistantMsgId = uuidv4();
        const assistantMsg: PaneMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
        };
        setPane((p) => ({
          ...p,
          messages: [...p.messages, assistantMsg],
        }));

        try {
          // Build chat history
          const chatHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
            { role: 'system', content: systemPrompt },
          ];

          // Get current messages (before adding the empty assistant placeholder)
          const currentPaneState = pane === 'A' ? paneA : paneB;
          for (const m of currentPaneState.messages) {
            chatHistory.push({ role: m.role, content: m.content });
          }
          chatHistory.push({ role: 'user', content: trimmed });

          const stream = await engine.chat.completions.create({
            messages: chatHistory,
            stream: true,
            temperature: 0.7,
            max_tokens: 2048,
          });

          let fullContent = '';
          for await (const chunk of stream as AsyncIterable<ChatCompletionChunk>) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              const captured = fullContent;
              setPane((p) => ({
                ...p,
                messages: p.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: captured } : m,
                ),
              }));
            }
          }
        } catch (err) {
          const errorContent =
            err instanceof Error
              ? `⚠️ Error: ${err.message}`
              : '⚠️ Generation failed';
          setPane((p) => ({
            ...p,
            messages: p.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, content: errorContent } : m,
            ),
          }));
        } finally {
          setPane((p) => ({ ...p, isGenerating: false, status: 'ready' }));
        }
      };

      // Fire both simultaneously
      void streamPane('A', modelA);
      void streamPane('B', modelB);
    },
    [modelA, modelB, paneA, paneB, initEngine, systemPrompt],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      engineARef.current?.unload();
      engineBRef.current?.unload();
      workerARef.current?.terminate();
      workerBRef.current?.terminate();
    };
  }, []);

  const composerDisabled = paneA.isGenerating || paneB.isGenerating;

  const modelALabel =
    AVAILABLE_MODELS.find((m) => m.id === modelA)?.label ?? 'Model A';
  const modelBLabel =
    AVAILABLE_MODELS.find((m) => m.id === modelB)?.label ?? 'Model B';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Split panes */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Pane A */}
        <div className="flex min-h-0 flex-1 flex-col border-b border-neutral-800/60 md:border-b-0 md:border-r">
          {/* Pane header */}
          <div className="flex items-center justify-between border-b border-neutral-800/40 bg-neutral-900/30 px-3 py-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-cyan-400/70">
              Model A
            </span>
            <ModelPicker
              currentModelId={paneA.modelId}
              engineStatus={paneA.status}
              onSelect={(id) => {
                onSetModelA(id);
                void initEngine('A', id);
              }}
            />
          </div>

          {/* Pane content */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            {paneA.status === 'loading' || paneA.status === 'checking-gpu' ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-neutral-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-cyan-400" />
                <span>{paneA.loadProgress.text}</span>
                <span className="text-xs tabular-nums">{Math.round(paneA.loadProgress.progress * 100)}%</span>
              </div>
            ) : (
              <div className="p-2">
                {paneA.messages.length === 0 && (
                  <div className="flex h-32 items-center justify-center text-xs text-neutral-600">
                    Send a message to compare {modelALabel}
                  </div>
                )}
                {paneA.messages.map((msg) => (
                  <CompareMessage key={msg.id} message={msg} />
                ))}
                {paneA.isGenerating &&
                  paneA.messages.length > 0 &&
                  paneA.messages[paneA.messages.length - 1].content === '' && (
                    <TypingIndicator />
                  )}
                <div ref={bottomRefA} />
              </div>
            )}
          </div>
        </div>

        {/* Pane B */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-neutral-800/40 bg-neutral-900/30 px-3 py-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-teal-400/70">
              Model B
            </span>
            <ModelPicker
              currentModelId={paneB.modelId}
              engineStatus={paneB.status}
              onSelect={(id) => {
                onSetModelB(id);
                void initEngine('B', id);
              }}
            />
          </div>

          <div className="flex-1 overflow-y-auto scroll-smooth">
            {paneB.status === 'loading' || paneB.status === 'checking-gpu' ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-neutral-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-teal-400" />
                <span>{paneB.loadProgress.text}</span>
                <span className="text-xs tabular-nums">{Math.round(paneB.loadProgress.progress * 100)}%</span>
              </div>
            ) : (
              <div className="p-2">
                {paneB.messages.length === 0 && (
                  <div className="flex h-32 items-center justify-center text-xs text-neutral-600">
                    Send a message to compare {modelBLabel}
                  </div>
                )}
                {paneB.messages.map((msg) => (
                  <CompareMessage key={msg.id} message={msg} />
                ))}
                {paneB.isGenerating &&
                  paneB.messages.length > 0 &&
                  paneB.messages[paneB.messages.length - 1].content === '' && (
                    <TypingIndicator />
                  )}
                <div ref={bottomRefB} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shared composer */}
      <Composer onSend={handleSend} disabled={composerDisabled} />
    </div>
  );
}

/**
 * Compact message bubble for compare view.
 */
function CompareMessage({ message }: { message: PaneMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-2 px-2 py-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
          isUser
            ? 'bg-cyan-500/20 text-cyan-300'
            : 'bg-teal-500/20 text-teal-300'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-cyan-600 text-white'
            : 'rounded-tl-sm bg-neutral-800/80 text-neutral-200 ring-1 ring-white/5'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose-chat text-xs">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
