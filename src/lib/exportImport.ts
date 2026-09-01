import { db, type Message, type Conversation } from './db';

export interface ExportData {
  version: number;
  exportedAt: number;
  conversation: Conversation;
  messages: Message[];
}

/**
 * Export a single conversation and its messages as a JSON blob.
 */
export async function exportConversation(conversationId: string): Promise<void> {
  const conversation = await db.conversations.get(conversationId);
  if (!conversation) return;

  const messages = await db.messages
    .where('conversationId')
    .equals(conversationId)
    .toArray();

  const exportPayload: ExportData = {
    version: 1,
    exportedAt: Date.now(),
    conversation,
    messages,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeTitle = conversation.title
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
  const filename = `edgechat_${safeTitle}_${Date.now()}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import a conversation from a JSON file.
 * Returns the imported conversation ID.
 */
export async function importConversation(file: File): Promise<string> {
  const text = await file.text();
  const data = JSON.parse(text) as ExportData;

  if (!data.conversation || !Array.isArray(data.messages)) {
    throw new Error('Invalid EdgeChat conversation backup file.');
  }

  // Create unique conversation ID to avoid collisions
  const newConvId = crypto.randomUUID();
  const importedConv: Conversation = {
    ...data.conversation,
    id: newConvId,
    title: `${data.conversation.title} (Imported)`,
    updatedAt: Date.now(),
  };

  await db.conversations.add(importedConv);

  const importedMessages: Message[] = data.messages.map((m) => ({
    ...m,
    id: crypto.randomUUID(),
    conversationId: newConvId,
  }));

  await db.messages.bulkAdd(importedMessages);
  return newConvId;
}
