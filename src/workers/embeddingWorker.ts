/**
 * Web Worker for running the embedding model via @huggingface/transformers.
 *
 * Loads the all-MiniLM-L6-v2 model (384-dim embeddings, ~23 MB)
 * and exposes a postMessage API for batch embedding.
 *
 * Messages:
 *   IN:  { type: 'embed', texts: string[] }
 *   OUT: { type: 'result', embeddings: number[][] }
 *   OUT: { type: 'status', status: 'loading' | 'ready' | 'error', message?: string }
 */

import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';

let extractor: FeatureExtractionPipeline | null = null;

async function loadModel(): Promise<void> {
  self.postMessage({ type: 'status', status: 'loading' });

  try {
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        // Use WASM backend for broad compatibility
        device: 'wasm',
      },
    );
    self.postMessage({ type: 'status', status: 'ready' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load embedding model';
    self.postMessage({ type: 'status', status: 'error', message });
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, texts } = event.data;

  if (type === 'load') {
    await loadModel();
    return;
  }

  if (type === 'embed') {
    if (!extractor) {
      // Auto-load if not yet loaded
      await loadModel();
    }

    if (!extractor) {
      self.postMessage({
        type: 'error',
        message: 'Embedding model not available',
      });
      return;
    }

    try {
      // Process in small batches to avoid memory issues
      const batchSize = 8;
      const allEmbeddings: number[][] = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const output = await extractor(batch, {
          pooling: 'mean',
          normalize: true,
        });

        // Convert Tensor output to array of arrays
        const data = output.tolist() as number[][];
        allEmbeddings.push(...data);

        // Report progress
        self.postMessage({
          type: 'progress',
          current: Math.min(i + batchSize, texts.length),
          total: texts.length,
        });
      }

      self.postMessage({
        type: 'result',
        embeddings: allEmbeddings,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Embedding failed';
      self.postMessage({ type: 'error', message });
    }
  }
};
