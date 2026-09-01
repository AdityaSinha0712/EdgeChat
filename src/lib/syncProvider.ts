import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import type { Message } from './db';

/**
 * Manages a Y.Doc that models the chat conversation as a Y.Array of messages.
 */
export class SyncProvider {
  readonly doc: Y.Doc;
  readonly messages: Y.Array<Message>;
  private idbProvider: IndexeddbPersistence;
  private webrtcProvider: WebrtcProvider | null = null;

  /** Fires whenever the Y.Array changes (local or remote). */
  private listeners = new Set<() => void>();
  private peerListeners = new Set<(count: number) => void>();

  constructor(roomId: string) {
    this.doc = new Y.Doc();
    this.messages = this.doc.getArray<Message>('messages');

    // Extract normalized short prefix (first segment before dash, lowercased)
    // This allows pairing via 8-char shortcode or full UUID interchangeably
    const cleanId = roomId.split('-')[0].toLowerCase().trim();
    const roomName = `edgechat-${cleanId}`;

    this.idbProvider = new IndexeddbPersistence(
      `edgechat-yjs-${roomName}`,
      this.doc,
    );

    const localSignaling = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws-signaling`;
    this.webrtcProvider = new WebrtcProvider(roomName, this.doc, {
      signaling: [
        localSignaling,
        'wss://signaling.yjs.dev',
      ],
      password: cleanId,
    });

    this.messages.observe(() => {
      this.notifyListeners();
    });

    this.webrtcProvider.on('synced', () => {
      this.notifyListeners();
    });

    this.webrtcProvider.awareness.on('change', () => {
      this.notifyPeerListeners();
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  onPeersChange(listener: (count: number) => void): () => void {
    this.peerListeners.add(listener);
    return () => {
      this.peerListeners.delete(listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private notifyPeerListeners() {
    const count = this.peerCount;
    for (const listener of this.peerListeners) {
      listener(count);
    }
  }

  getMessages(): Message[] {
    return this.messages.toArray().sort((a, b) => a.createdAt - b.createdAt);
  }

  addMessage(msg: Message): void {
    this.messages.push([msg]);
  }

  updateMessage(id: string, content: string): void {
    const arr = this.messages;
    for (let i = 0; i < arr.length; i++) {
      const item = arr.get(i);
      if (item.id === id) {
        this.doc.transact(() => {
          arr.delete(i, 1);
          arr.insert(i, [{ ...item, content, editedAt: Date.now() }]);
        });
        return;
      }
    }
  }

  updateMessageContent(id: string, content: string): void {
    this.updateMessage(id, content);
  }

  deleteMessage(id: string): void {
    const arr = this.messages;
    for (let i = 0; i < arr.length; i++) {
      const item = arr.get(i);
      if (item.id === id) {
        this.doc.transact(() => {
          arr.delete(i, 1);
        });
        return;
      }
    }
  }

  clearMessages(): void {
    this.doc.transact(() => {
      this.messages.delete(0, this.messages.length);
    });
  }

  get peerCount(): number {
    if (!this.webrtcProvider) return 0;
    const states = this.webrtcProvider.awareness.getStates();
    return Math.max(0, states.size - 1);
  }

  get isSynced(): Promise<void> {
    return this.idbProvider.whenSynced.then(() => undefined);
  }

  destroy(): void {
    this.webrtcProvider?.destroy();
    this.idbProvider.destroy();
    this.doc.destroy();
    this.listeners.clear();
    this.peerListeners.clear();
  }
}
