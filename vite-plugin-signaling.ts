/**
 * Vite plugin that embeds a y-webrtc signaling server on the dev server.
 *
 * This eliminates the need for the unreliable public signaling servers
 * (wss://signaling.yjs.dev, Heroku, etc.) during local development.
 *
 * The signaling server implements the y-webrtc signaling protocol:
 *   - { type: 'subscribe', topics: string[] }
 *   - { type: 'unsubscribe', topics: string[] }
 *   - { type: 'publish', topic: string, ... }
 *   - { type: 'ping' } → { type: 'pong' }
 *
 * Mounted at path `/ws-signaling` on the Vite dev server's HTTP server,
 * so the client connects to `ws://localhost:<port>/ws-signaling`.
 */

import { WebSocketServer, type WebSocket } from 'ws';
import type { Plugin } from 'vite';

export function yWebrtcSignaling(): Plugin {
  return {
    name: 'y-webrtc-signaling',
    configureServer(server) {
      // Map of topic → Set of subscribed connections
      const topics = new Map<string, Set<WebSocket>>();

      const wss = new WebSocketServer({ noServer: true });

      wss.on('connection', (conn: WebSocket) => {
        const subscribedTopics = new Set<string>();

        conn.on('message', (data: Buffer, isBinary: boolean) => {
          // y-webrtc sends JSON text frames for signaling messages.
          // We must forward them as TEXT frames so the receiving browser's
          // JSON.parse(event.data) works correctly.
          if (isBinary) {
            return; // y-webrtc signaling doesn't use binary frames
          }

          const messageStr = data.toString('utf-8');

          let msg: {
            type: string;
            topics?: string[];
            topic?: string;
            [key: string]: unknown;
          };
          try {
            msg = JSON.parse(messageStr);
          } catch {
            return; // Not valid JSON, ignore
          }

          if (msg.type === 'subscribe' && Array.isArray(msg.topics)) {
            for (const topicName of msg.topics) {
              subscribedTopics.add(topicName);
              if (!topics.has(topicName)) {
                topics.set(topicName, new Set());
              }
              topics.get(topicName)!.add(conn);
            }
          } else if (msg.type === 'unsubscribe' && Array.isArray(msg.topics)) {
            for (const topicName of msg.topics) {
              subscribedTopics.delete(topicName);
              topics.get(topicName)?.delete(conn);
              if (topics.get(topicName)?.size === 0) {
                topics.delete(topicName);
              }
            }
          } else if (msg.type === 'publish' && typeof msg.topic === 'string') {
            const receivers = topics.get(msg.topic);
            if (receivers) {
              // CRITICAL: Forward as a TEXT string, not a binary Buffer.
              // The browser's WebSocket receives text frames as strings
              // (event.data), which y-webrtc then JSON.parse()s.
              // Sending a Buffer would create a binary frame → Blob on the
              // client → JSON.parse(Blob) fails silently.
              for (const receiver of receivers) {
                if (receiver !== conn && receiver.readyState === 1 /* OPEN */) {
                  receiver.send(messageStr);
                }
              }
            }
          } else if (msg.type === 'ping') {
            conn.send(JSON.stringify({ type: 'pong' }));
          }
        });

        conn.on('close', () => {
          for (const topicName of subscribedTopics) {
            topics.get(topicName)?.delete(conn);
            if (topics.get(topicName)?.size === 0) {
              topics.delete(topicName);
            }
          }
          subscribedTopics.clear();
        });
      });

      // Intercept HTTP upgrade requests on the /ws-signaling path
      server.httpServer?.on('upgrade', (request, socket, head) => {
        if (request.url === '/ws-signaling') {
          wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            wss.emit('connection', ws, request);
          });
        }
        // Other upgrade requests (Vite HMR, etc.) are left untouched
      });

      console.log(
        '  ➜  y-webrtc signaling server mounted at /ws-signaling',
      );
    },
  };
}
