import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db, type Conversation } from './db';
import { DEFAULT_CONVERSATION_ID } from './constants';

const ACTIVE_CONVERSATION_KEY = 'edgechat-active-conversation';

function loadActiveConversationId(): string {
  try {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY) ?? DEFAULT_CONVERSATION_ID;
  } catch {
    return DEFAULT_CONVERSATION_ID;
  }
}

function saveActiveConversationId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
  } catch {
    // localStorage unavailable
  }
}

/**
 * Hook for managing multi-thread conversations in IndexedDB.
 *
 * Provides thread creation, switching, renaming, deletion, and auto-title generation.
 */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveIdState] = useState<string>(
    loadActiveConversationId,
  );

  // Load conversations from IndexedDB
  const refreshConversations = useCallback(async () => {
    const list = await db.conversations.orderBy('updatedAt').reverse().toArray();

    // Ensure default conversation exists if DB is empty
    if (list.length === 0) {
      const defaultConv: Conversation = {
        id: DEFAULT_CONVERSATION_ID,
        title: 'New Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.conversations.add(defaultConv);
      setConversations([defaultConv]);
    } else {
      setConversations(list);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const setActiveConversationId = useCallback((id: string) => {
    setActiveIdState(id);
    saveActiveConversationId(id);
  }, []);

  const createConversation = useCallback(
    async (title = 'New Chat'): Promise<string> => {
      const newConv: Conversation = {
        id: uuidv4(),
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.conversations.add(newConv);
      await refreshConversations();
      setActiveConversationId(newConv.id);
      return newConv.id;
    },
    [refreshConversations, setActiveConversationId],
  );

  const renameConversation = useCallback(
    async (id: string, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      await db.conversations.update(id, {
        title: trimmed,
        updatedAt: Date.now(),
      });
      await refreshConversations();
    },
    [refreshConversations],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      // Delete conversation and all its messages
      await db.messages.where('conversationId').equals(id).delete();
      await db.conversations.delete(id);

      const remaining = await db.conversations.orderBy('updatedAt').reverse().toArray();

      if (remaining.length === 0) {
        // Re-create default if all deleted
        const defaultConv: Conversation = {
          id: DEFAULT_CONVERSATION_ID,
          title: 'New Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.conversations.add(defaultConv);
        setConversations([defaultConv]);
        setActiveConversationId(defaultConv.id);
      } else {
        setConversations(remaining);
        if (activeConversationId === id) {
          setActiveConversationId(remaining[0].id);
        }
      }
    },
    [activeConversationId, refreshConversations, setActiveConversationId],
  );

  const touchConversation = useCallback(async (id: string, titleHint?: string) => {
    const conv = await db.conversations.get(id);
    const updates: Partial<Conversation> = { updatedAt: Date.now() };

    // Auto-title from first message if title is still "New Chat"
    if (conv && conv.title === 'New Chat' && titleHint) {
      const autoTitle =
        titleHint.length > 30 ? titleHint.slice(0, 30) + '…' : titleHint;
      updates.title = autoTitle;
    }

    if (conv) {
      await db.conversations.update(id, updates);
    } else {
      await db.conversations.add({
        id,
        title: titleHint ? (titleHint.length > 30 ? titleHint.slice(0, 30) + '…' : titleHint) : 'New Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    await refreshConversations();
  }, [refreshConversations]);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ??
    conversations[0];

  return {
    conversations,
    activeConversationId,
    activeConversation,
    setActiveConversationId,
    createConversation,
    renameConversation,
    deleteConversation,
    touchConversation,
    refreshConversations,
  };
}
