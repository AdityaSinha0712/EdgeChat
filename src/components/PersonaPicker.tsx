import { useState } from 'react';
import type { Persona } from '../lib/personas';

interface PersonaPickerProps {
  personas: Persona[];
  activePersona: Persona;
  onSelect: (id: string) => void;
  onAdd: (name: string, icon: string, systemPrompt: string) => Persona;
  onDelete: (id: string) => void;
}

export function PersonaPicker({
  personas,
  activePersona,
  onSelect,
  onAdd,
  onDelete,
}: PersonaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🤖');
  const [newPrompt, setNewPrompt] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleCreate() {
    if (!newName.trim() || !newPrompt.trim()) return;
    const persona = onAdd(newName, newIcon, newPrompt);
    onSelect(persona.id);
    setNewName('');
    setNewIcon('🤖');
    setNewPrompt('');
    setIsCreating(false);
  }

  function handleDelete(id: string) {
    onDelete(id);
    setConfirmDeleteId(null);
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="persona-picker-button"
        aria-label="Select persona"
        title={`Persona: ${activePersona.name}`}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 px-2.5 py-1.5 text-xs text-neutral-400 transition-colors hover:border-cyan-500/30 hover:text-neutral-300"
      >
        <span className="text-sm leading-none">{activePersona.icon}</span>
        <span className="hidden sm:inline">{activePersona.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setIsCreating(false);
              setConfirmDeleteId(null);
            }}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="max-h-[70vh] overflow-y-auto p-2">
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Persona
              </p>

              {/* Persona list */}
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className={`group flex items-start gap-2 rounded-lg px-3 py-2.5 transition-colors ${
                    persona.id === activePersona.id
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'text-neutral-300 hover:bg-neutral-800/50'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelect(persona.id);
                      setIsOpen(false);
                    }}
                    title={persona.systemPrompt}
                    className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
                  >
                    <span className="mt-0.5 text-base leading-none shrink-0">
                      {persona.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {persona.name}
                      </span>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500 whitespace-pre-wrap break-words">
                        {persona.systemPrompt}
                      </p>
                    </div>
                  </button>

                  {/* Delete button — only for custom personas */}
                  {!persona.isBuiltIn && (
                    <>
                      {confirmDeleteId === persona.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(persona.id)}
                            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-red-400 hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded px-1.5 py-0.5 text-[10px] text-neutral-500 hover:text-neutral-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(persona.id)}
                          className="rounded p-1 text-neutral-600 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                          aria-label={`Delete ${persona.name}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* Divider */}
              <div className="my-2 border-t border-neutral-800" />

              {/* Create custom persona */}
              {isCreating ? (
                <div className="space-y-2 rounded-lg bg-neutral-800/30 p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      placeholder="🤖"
                      className="w-12 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-center text-sm text-neutral-100 focus:border-cyan-500/50 focus:outline-none"
                      maxLength={4}
                    />
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Persona name"
                      className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-cyan-500/50 focus:outline-none"
                    />
                  </div>
                  <textarea
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="System prompt — describe how the AI should behave…"
                    rows={3}
                    className="w-full resize-none rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-cyan-500/50 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="rounded-md px-3 py-1 text-xs text-neutral-400 transition-colors hover:text-neutral-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!newName.trim() || !newPrompt.trim()}
                      className="rounded-md bg-cyan-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-40"
                    >
                      Create
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-neutral-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                  </svg>
                  Create custom persona
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
