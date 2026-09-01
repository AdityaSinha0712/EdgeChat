/**
 * Web Worker for running Local Whisper Speech Recognition via @huggingface/transformers.
 *
 * Loads the onnx-community/whisper-tiny.en model (~39 MB)
 * and exposes a postMessage API for audio transcription.
 *
 * Messages:
 *   IN:  { type: 'load' }
 *   IN:  { type: 'transcribe', audio: Float32Array }
 *   OUT: { type: 'status', status: 'loading' | 'ready' | 'error', message?: string }
 *   OUT: { type: 'result', text: string }
 *   OUT: { type: 'error', message: string }
 */

import { pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let lastLoadError: string | null = null;

async function loadModel(): Promise<void> {
  self.postMessage({ type: 'status', status: 'loading' });

  try {
    transcriber = (await pipeline(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny.en',
      {
        device: 'wasm',
      },
    )) as AutomaticSpeechRecognitionPipeline;
    self.postMessage({ type: 'status', status: 'ready' });
    lastLoadError = null;
  } catch (err) {
    console.warn('[speechWorker] Failed with onnx-community, retrying Xenova fallback:', err);
    try {
      transcriber = (await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        {
          device: 'wasm',
        },
      )) as AutomaticSpeechRecognitionPipeline;
      self.postMessage({ type: 'status', status: 'ready' });
      lastLoadError = null;
    } catch (fallbackErr) {
      const message =
        fallbackErr instanceof Error
          ? fallbackErr.message
          : 'Failed to load local speech recognition model';
      lastLoadError = message;
      self.postMessage({ type: 'status', status: 'error', message });
    }
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, audio } = event.data;

  if (type === 'load') {
    await loadModel();
    return;
  }

  if (type === 'transcribe') {
    if (!transcriber) {
      await loadModel();
    }

    if (!transcriber) {
      self.postMessage({
        type: 'error',
        message: lastLoadError
          ? `Speech model failed to load: ${lastLoadError}`
          : 'Speech model failed to load. Check your internet connection — the Whisper model (~39 MB) must be downloaded on first use.',
      });
      return;
    }

    try {
      const output = await transcriber(audio, {
        return_timestamps: false,
        chunk_length_s: 30,
        stride_length_s: 5,
      });

      let text = '';
      if (Array.isArray(output)) {
        text = output.map((o) => o.text).join(' ').trim();
      } else if (typeof output === 'object' && output !== null && 'text' in output) {
        text = (output as { text: string }).text.trim();
      }

      self.postMessage({
        type: 'result',
        text,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Transcription failed';
      self.postMessage({ type: 'error', message });
    }
  }
};
