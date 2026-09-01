/**
 * Web Worker that hosts the WebLLM MLCEngine.
 *
 * All inference runs off the main thread. The main thread communicates
 * via the WebWorkerMLCEngine client, which handles postMessage serialization.
 */
import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm';

const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
