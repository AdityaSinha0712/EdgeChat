import { useState } from 'react';
import type { Conversation } from '../lib/db';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenStoragePanel: () => void;
  onOpenSearch: () => void;
  onOpenExportImport: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onOpenStoragePanel,
  onOpenSearch,
  onOpenExportImport,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  function handleStartRename(conv: Conversation) {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  }

  function handleSaveRename(id: string) {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed left-0 top-0 z-[90] flex h-full w-72 flex-col border-r border-neutral-800 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur-xl transition-all">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="EdgeChat"
              className="h-6 w-6 rounded-md object-cover ring-1 ring-cyan-500/30"
            />
            <span className="text-sm font-bold text-neutral-200">Conversations</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:text-neutral-300"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* New Chat button */}
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-cyan-900/20 transition-all hover:from-cyan-500 hover:to-teal-500 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          New Chat
        </button>

        {/* Search bar button */}
        <button
          onClick={() => {
            onOpenSearch();
            onClose();
          }}
          className="mb-3 flex w-full items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-xs text-neutral-400 transition-colors hover:border-cyan-500/30 hover:text-neutral-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-neutral-500">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <span>Search messages…</span>
        </button>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 font-medium'
                    : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200'
                }`}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(conv.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={() => handleSaveRename(conv.id)}
                    autoFocus
                    className="flex-1 rounded border border-cyan-500/50 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-100 outline-none"
                  />
                ) : (
                  <button
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onClose();
                    }}
                    className="flex flex-1 items-center gap-2 truncate text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-neutral-500">
                      <path fillRule="evenodd" d="M10 2c-4.418 0-8 3.134-8 7 0 2.02.977 3.84 2.56 5.12.19.15.3.38.29.62l-.18 1.8a.75.75 0 0 0 1.05.77l2.25-.9a1.25 1.25 0 0 1 .46-.09c.52 0 1.04.06 1.57.06 4.418 0 8-3.134 8-7s-3.582-7-8-7Z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{conv.title}</span>
                  </button>
                )}

                {/* Edit & Delete Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleStartRename(conv)}
                      className="rounded p-1 text-neutral-500 hover:text-cyan-300"
                      title="Rename"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                        <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.05 10.476a.75.75 0 0 0-.168.308l-.8 3.2a.75.75 0 0 0 .91.91l3.2-.8a.75.75 0 0 0 .308-.168l7.963-7.963a1.75 1.75 0 0 0 0-2.475Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteConversation(conv.id)}
                      className="rounded p-1 text-neutral-500 hover:text-red-400"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                        <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-neutral-800/80 pt-3 space-y-1">
          <button
            onClick={() => {
              onOpenExportImport();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            <span>Export / Import Chat</span>
          </button>
          <button
            onClick={() => {
              onOpenStoragePanel();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M2 4.75C2 3.784 2.784 3 3.75 3h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 16.25 17H3.75A1.75 1.75 0 0 1 2 15.25V4.75ZM3.5 7v8.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V7H3.5Z" clipRule="evenodd" />
            </svg>
            <span>Storage & Trust Panel</span>
          </button>
        </div>
      </aside>
    </>
  );
}
