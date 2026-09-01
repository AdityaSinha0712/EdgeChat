import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../lib/db';
import { SyncProvider } from '../lib/syncProvider';
import { DEFAULT_CONVERSATION_ID } from '../lib/constants';
import { getDeviceName } from '../lib/deviceId';
import { useTokenStats } from '../lib/useTokenStats';
import type { useEngine } from './useEngine';

export function useSyncedMessages(
  engine: ReturnType<typeof useEngine>,
  enabled: boolean,
  roomId: string,
  systemPrompt: string,
  buildContextMessage?: (query: string) => Promise<string | null>,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const providerRef = useRef<SyncProvider | null>(null);

  const {
    stats: tokenStats,
    startTracking,
    countToken,
    stopTracking,
  } = useTokenStats();

  useEffect(() => {
    if (!enabled) {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      setMessages([]);
      setIsLoading(false);
      setPeerCount(0);
      return;
    }

    const provider = new SyncProvider(roomId);

    setMessages(provider.getMessages());
    setIsLoading(false);
    setPeerCount(provider.peerCount);

    const unsubscribeMessages = provider.subscribe(() => {
      setMessages(provider.getMessages());
      setIsLoading(false);
    });

    const unsubscribePeers = provider.onPeersChange((count) => {
      setPeerCount(count);
    });

    providerRef.current = provider;

    return () => {
      unsubscribeMessages();
      unsubscribePeers();
      provider.destroy();
      providerRef.current = null;
    };
  }, [enabled, roomId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return null;

      const provider = providerRef.current;
      if (!provider) return null;

      const userMsg: Message = {
        id: uuidv4(),
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
        conversationId: DEFAULT_CONVERSATION_ID,
        originDevice: getDeviceName(),
      };

      provider.addMessage(userMsg);

      let engineReady = engine.status === 'ready';

      if (!engineReady && (engine.status === 'idle' || engine.status === 'error')) {
        engineReady = await engine.initEngine();
      }

      if (engineReady) {
        setIsGenerating(true);
        startTracking();

        let combinedSystemPrompt = systemPrompt;
        if (buildContextMessage) {
          const ragContext = await buildContextMessage(trimmed);
          if (ragContext) {
            combinedSystemPrompt = `${systemPrompt}\n\n${ragContext}`;
          }
        }

        const chatHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
          { role: 'system', content: combinedSystemPrompt },
          ...provider.getMessages().map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ];

        const assistantMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: '',
          createdAt: Date.now(),
          conversationId: DEFAULT_CONVERSATION_ID,
          originDevice: getDeviceName(),
        };

        provider.addMessage(assistantMsg);

        try {
          let fullContent = '';
          const generator = engine.streamCompletion(chatHistory);
          for await (const delta of generator) {
            fullContent += delta;
            countToken();
            provider.updateMessage(assistantMsg.id, fullContent);
          }
        } catch (err) {
          const errorContent =
            err instanceof Error
              ? `⚠️ Generation failed: ${err.message}`
              : typeof err === 'string'
                ? `⚠️ Generation failed: ${err}`
                : '⚠️ Generation failed unexpectedly.';

          provider.updateMessage(assistantMsg.id, errorContent);
        } finally {
          stopTracking();
          setIsGenerating(false);
        }
      }

      return userMsg;
    },
    [engine, systemPrompt, buildContextMessage, startTracking, countToken, stopTracking],
  );

  const editMessage = useCallback(
    async (id: string, newContent: string) => {
      const provider = providerRef.current;
      if (!provider) return;
      provider.updateMessage(id, newContent.trim());
    },
    [],
  );

  const regenerateResponse = useCallback(
    async (assistantMsgId: string) => {
      const provider = providerRef.current;
      if (!provider) return;

      const current = provider.getMessages();
      const idx = current.findIndex((m) => m.id === assistantMsgId);
      if (idx === -1) return;

      const userMsg = [...current.slice(0, idx)].reverse().find((m) => m.role === 'user');
      if (!userMsg) return;

      provider.deleteMessage(assistantMsgId);
      await sendMessage(userMsg.content);
    },
    [sendMessage],
  );

  const clearMessages = useCallback(() => {
    providerRef.current?.clearMessages();
  }, []);

  return {
    messages,
    isLoading,
    isGenerating,
    peerCount,
    sendMessage,
    editMessage,
    regenerateResponse,
    clearMessages,
    tokenStats,
  };
}
