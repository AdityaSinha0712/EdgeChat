import { db, type Message, type Conversation } from './db';

export interface SearchMatch {
  message: Message;
  conversation: Conversation;
  snippet: string;
}

/**
 * Perform a full-text search across all messages in IndexedDB.
 */
export async function searchChatHistory(query: string): Promise<SearchMatch[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const allMessages = await db.messages.toArray();
  const matchedMessages = allMessages.filter((m) =>
    m.content.toLowerCase().includes(trimmed),
  );

  const results: SearchMatch[] = [];
  const conversationsCache = new Map<string, Conversation>();

  for (const message of matchedMessages) {
    let conv = conversationsCache.get(message.conversationId);
    if (!conv) {
      const fetched = await db.conversations.get(message.conversationId);
      if (fetched) {
        conv = fetched;
        conversationsCache.set(message.conversationId, fetched);
      }
    }

    if (conv) {
      const idx = message.content.toLowerCase().indexOf(trimmed);
      const start = Math.max(0, idx - 30);
      const end = Math.min(message.content.length, idx + trimmed.length + 40);
      let snippet = message.content.substring(start, end);

      if (start > 0) snippet = '…' + snippet;
      if (end < message.content.length) snippet = snippet + '…';

      results.push({
        message,
        conversation: conv,
        snippet,
      });
    }
  }

  return results.slice(0, 30); // Max 30 matches
}
