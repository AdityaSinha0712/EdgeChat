import { useEffect, useRef } from 'react';
import type { Message } from '../lib/db';
import type { EngineStatus } from '../store/useEngine';
import { ChatBubble } from './ChatBubble';
import { EmptyState } from './EmptyState';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  engineStatus: EngineStatus;
  onLoadModel: () => void;
  onEditMessage?: (id: string, newContent: string) => void;
  onRegenerateResponse?: (userMsgId: string) => void;
  onSelectPrompt?: (prompt: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  engineStatus,
  onLoadModel,
  onEditMessage,
  onRegenerateResponse,
  onSelectPrompt,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-cyan-400" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        engineStatus={engineStatus}
        onLoadModel={onLoadModel}
        onSelectPrompt={onSelectPrompt}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto scroll-smooth">
      {/* Top spacer for visual breathing room */}
      <div className="flex-shrink-0 pt-4" />

      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg}
          onEditMessage={onEditMessage}
          onRegenerateResponse={onRegenerateResponse}
        />
      ))}

      {/* Scroll anchor */}
      <div ref={bottomRef} className="flex-shrink-0 pb-2" />
    </div>
  );
}
