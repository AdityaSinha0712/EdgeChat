import Dexie, { type EntityTable } from 'dexie';

/**
 * Represents a single chat message persisted to IndexedDB.
 */
export interface Message {
  /** UUID v4 primary key */
  id: string;
  /** 'user' | 'assistant' | 'system' */
  role: 'user' | 'assistant' | 'system';
  /** Raw text content of the message */
  content: string;
  /** Unix-ms timestamp */
  createdAt: number;
  /** Groups messages into conversations */
  conversationId: string;
  /** Human-readable device name that originated the message (for conflict/sync visualization) */
  originDevice?: string;
  /** Timestamp if edited */
  editedAt?: number;
}

/**
 * Represents a conversation thread.
 */
export interface Conversation {
  /** UUID v4 primary key */
  id: string;
  /** Thread title (auto-generated or user edited) */
  title: string;
  /** Unix-ms timestamp */
  createdAt: number;
  /** Unix-ms timestamp of last activity */
  updatedAt: number;
  /** Persona assigned to thread */
  personaId?: string;
}

/**
 * EdgeChat local database — backed by IndexedDB via Dexie.
 */
const db = new Dexie('EdgeChatDB') as Dexie & {
  messages: EntityTable<Message, 'id'>;
  conversations: EntityTable<Conversation, 'id'>;
};

db.version(1).stores({
  messages: 'id, conversationId, [conversationId+createdAt]',
});

db.version(2).stores({
  messages: 'id, conversationId, [conversationId+createdAt], originDevice',
  conversations: 'id, updatedAt, createdAt',
});

export { db };
