import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { formatTime } from '../lib/formatTime';
import type { Message } from '../lib/db';
import { getDeviceName } from '../lib/deviceId';

interface ChatBubbleProps {
  message: Message;
  onEditMessage?: (id: string, newContent: string) => void;
  onRegenerateResponse?: (userMsgId: string) => void;
}

export function ChatBubble({
  message,
  onEditMessage,
  onRegenerateResponse,
}: ChatBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const currentDeviceName = getDeviceName();
  const isSyncedFromPeer =
    message.originDevice && message.originDevice !== currentDeviceName;

  function handleSaveEdit() {
    if (editContent.trim() && onEditMessage) {
      onEditMessage(message.id, editContent.trim());
      setIsEditing(false);
    }
  }

  function handleCopyText() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`animate-message-in group relative flex gap-3 px-4 py-2 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isUser
            ? 'bg-cyan-500/20 text-cyan-300'
            : 'bg-teal-500/20 text-teal-300'
        }`}
        aria-hidden="true"
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-sm:max-w-[88%] ${
          isUser
            ? 'rounded-tr-md bg-cyan-600 text-white shadow-sm shadow-cyan-900/30'
            : 'rounded-tl-md bg-neutral-800/80 text-neutral-200 ring-1 ring-white/5'
        }`}
      >
        {/* Origin tag for synced messages */}
        {isSyncedFromPeer && (
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold text-teal-300/80">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
              <path fillRule="evenodd" d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
            </svg>
            <span>Synced from {message.originDevice}</span>
          </div>
        )}

        {/* Editing mode */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full resize-none rounded-lg border border-neutral-600 bg-neutral-900 p-2 text-xs text-neutral-100 outline-none"
              rows={3}
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded px-2 py-0.5 text-[11px] text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded bg-cyan-500 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-cyan-400"
              >
                Save & Regenerate
              </button>
            </div>
          </div>
        ) : (
          /* Normal message content */
          <>
            {isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div className="prose-chat">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}

        {/* Footer timestamp & action menu */}
        <div className="mt-1 flex items-center justify-between gap-2 text-[10px]">
          <span
            className={`transition-opacity ${
              isUser
                ? 'text-cyan-200/60 opacity-0 group-hover:opacity-100'
                : 'text-neutral-500 opacity-0 group-hover:opacity-100'
            }`}
          >
            {formatTime(message.createdAt)}
            {message.editedAt && ' (edited)'}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleCopyText}
              className="text-neutral-400 hover:text-neutral-200"
              title="Copy text"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            {isUser && onEditMessage && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-cyan-300 hover:underline"
                title="Edit message"
              >
                Edit
              </button>
            )}
            {!isUser && onRegenerateResponse && (
              <button
                onClick={() => onRegenerateResponse(message.id)}
                className="text-teal-300 hover:underline"
                title="Regenerate reply"
              >
                Regenerate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
