import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';
import { db, type Message } from '../lib/db';
import { getDeviceName } from '../lib/deviceId';
import { useTokenStats } from '../lib/useTokenStats';
import type { useEngine } from './useEngine';

/**
 * Hook that owns the message list for the active conversation.
 * Supports multi-thread history, message editing, response regeneration, and device origin tagging.
 */
export function useMessages(
  engine: ReturnType<typeof useEngine>,
  conversationId: string,
  systemPrompt: string,
  buildContextMessage?: (query: string) => Promise<string | null>,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    stats: tokenStats,
    startTracking,
    countToken,
    stopTracking,
  } = useTokenStats();

  // Load messages from IndexedDB whenever conversationId changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const stored = await db.messages
        .where('[conversationId+createdAt]')
        .between(
          [conversationId, Dexie.minKey],
          [conversationId, Dexie.maxKey],
        )
        .toArray();

      if (!cancelled) {
        setMessages(stored);
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  /**
   * Stream completion for a given user prompt & context.
   */
  const streamReply = useCallback(
    async (userPrompt: string, history: Message[]) => {
      let engineReady = engine.status === 'ready';

      if (!engineReady && (engine.status === 'idle' || engine.status === 'error')) {
        engineReady = await engine.initEngine();
      }

      if (!engineReady) return;

      setIsGenerating(true);
      startTracking();

      const assistantMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        conversationId,
        originDevice: getDeviceName(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      try {
        let combinedSystemPrompt = systemPrompt;
        if (buildContextMessage) {
          const ragContext = await buildContextMessage(userPrompt);
          if (ragContext) {
            combinedSystemPrompt = `${systemPrompt}\n\n${ragContext}`;
          }
        }

        const chatHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
          { role: 'system', content: combinedSystemPrompt },
          ...history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ];

        let fullContent = '';
        const generator = engine.streamCompletion(chatHistory);
        for await (const delta of generator) {
          fullContent += delta;
          countToken();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: fullContent } : m,
            ),
          );
        }

        assistantMsg.content = fullContent;
        await db.messages.add(assistantMsg);
      } catch (err) {
        const errorContent =
          err instanceof Error
            ? `⚠️ Generation failed: ${err.message}`
            : typeof err === 'string'
              ? `⚠️ Generation failed: ${err}`
              : '⚠️ Generation failed unexpectedly.';

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: errorContent } : m,
          ),
        );
      } finally {
        stopTracking();
        setIsGenerating(false);
      }
    },
    [engine, conversationId, systemPrompt, buildContextMessage, startTracking, countToken, stopTracking],
  );

  /**
   * Persist and append a user message, then stream the assistant reply.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return null;

      const userMsg: Message = {
        id: uuidv4(),
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
        conversationId,
        originDevice: getDeviceName(),
      };

      await db.messages.add(userMsg);
      setMessages((prev) => [...prev, userMsg]);

      const updatedHistory = [...messages, userMsg];
      await streamReply(trimmed, updatedHistory);

      return userMsg;
    },
    [conversationId, messages, streamReply],
  );

  /**
   * Edit a user message content and regenerate AI response.
   */
  const editMessage = useCallback(
    async (id: string, newContent: string) => {
      const trimmed = newContent.trim();
      if (!trimmed) return;

      await db.messages.update(id, { content: trimmed, editedAt: Date.now() });

      const msgIndex = messages.findIndex((m) => m.id === id);
      if (msgIndex === -1) return;

      // Keep history up to edited message
      const historyToKeep = messages.slice(0, msgIndex);
      const editedUserMsg = { ...messages[msgIndex], content: trimmed, editedAt: Date.now() };

      // Delete subsequent assistant messages from DB
      const idsToDelete = messages.slice(msgIndex + 1).map((m) => m.id);
      if (idsToDelete.length > 0) {
        await db.messages.bulkDelete(idsToDelete);
      }

      setMessages([...historyToKeep, editedUserMsg]);
      await streamReply(trimmed, [...historyToKeep, editedUserMsg]);
    },
    [messages, streamReply],
  );

  /**
   * Regenerate assistant response for a given message.
   */
  const regenerateResponse = useCallback(
    async (assistantMsgId: string) => {
      const msgIndex = messages.findIndex((m) => m.id === assistantMsgId);
      if (msgIndex === -1) return;

      const historyBefore = messages.slice(0, msgIndex);
      const lastUserMsg = [...historyBefore].reverse().find((m) => m.role === 'user');
      if (!lastUserMsg) return;

      // Delete current assistant message from DB
      await db.messages.delete(assistantMsgId);
      setMessages(historyBefore);

      await streamReply(lastUserMsg.content, historyBefore);
    },
    [messages, streamReply],
  );

  /**
   * Clear all messages in the current conversation.
   */
  const clearMessages = useCallback(async () => {
    await db.messages
      .where('conversationId')
      .equals(conversationId)
      .delete();
    setMessages([]);
  }, [conversationId]);

  return {
    messages,
    isLoading,
    isGenerating,
    sendMessage,
    editMessage,
    regenerateResponse,
    clearMessages,
    tokenStats,
  };
}
