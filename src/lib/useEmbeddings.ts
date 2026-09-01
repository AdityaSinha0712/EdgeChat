import { useCallback, useEffect, useRef, useState } from 'react';

export type EmbeddingStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Hook wrapping the embedding Web Worker.
 *
 * Lazy-loads the worker and embedding model on first use.
 * Provides `embed()` for batch text embedding and `status` for UI feedback.
 */
export function useEmbeddings() {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<EmbeddingStatus>('idle');
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // Create worker lazily
  const getWorker = useCallback((): Worker => {
    if (!workerRef.current) {
      const worker = new Worker(
        new URL('../workers/embeddingWorker.ts', import.meta.url),
        { type: 'module' },
      );
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent) => {
        const { type } = event.data;
        if (type === 'status') {
          setStatus(event.data.status);
        }
      };
    }
    return workerRef.current;
  }, []);

  /**
   * Initialize the embedding model.
   * Call this proactively to pre-load, or it will auto-load on first embed().
   */
  const init = useCallback(async (): Promise<void> => {
    const worker = getWorker();
    return new Promise<void>((resolve, reject) => {
      const handler = (event: MessageEvent) => {
        if (event.data.type === 'status') {
          setStatus(event.data.status);
          if (event.data.status === 'ready') {
            worker.removeEventListener('message', handler);
            resolve();
          } else if (event.data.status === 'error') {
            worker.removeEventListener('message', handler);
            reject(new Error(event.data.message));
          }
        }
      };
      worker.addEventListener('message', handler);
      worker.postMessage({ type: 'load' });
    });
  }, [getWorker]);

  /**
   * Embed an array of texts, returning their vector embeddings.
   * Auto-loads the model if not already loaded.
   */
  const embed = useCallback(
    async (texts: string[]): Promise<number[][]> => {
      if (texts.length === 0) return [];

      const worker = getWorker();

      // Auto-init if idle
      if (status === 'idle') {
        await init();
      }

      return new Promise<number[][]>((resolve, reject) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'result') {
            worker.removeEventListener('message', handler);
            setProgress(null);
            resolve(event.data.embeddings);
          } else if (event.data.type === 'error') {
            worker.removeEventListener('message', handler);
            setProgress(null);
            reject(new Error(event.data.message));
          } else if (event.data.type === 'progress') {
            setProgress({
              current: event.data.current,
              total: event.data.total,
            });
          } else if (event.data.type === 'status') {
            setStatus(event.data.status);
          }
        };

        worker.addEventListener('message', handler);
        worker.postMessage({ type: 'embed', texts });
      });
    },
    [getWorker, status, init],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return {
    status,
    progress,
    embed,
    init,
  };
}
