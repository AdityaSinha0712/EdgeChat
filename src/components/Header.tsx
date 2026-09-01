import { ModelPicker } from './ModelPicker';
import { PersonaPicker } from './PersonaPicker';
import type { EngineStatus } from '../store/useEngine';
import type { Persona } from '../lib/personas';

interface HeaderProps {
  messageCount: number;
  onClear: () => void;
  engineStatus: EngineStatus;
  modelId: string;
  onModelSelect: (modelId: string) => void;
  personas: Persona[];
  activePersona: Persona;
  onSelectPersona: (id: string) => void;
  onAddPersona: (name: string, icon: string, systemPrompt: string) => Persona;
  onDeletePersona: (id: string) => void;
  syncEnabled: boolean;
  isCompareMode: boolean;
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
}

export function Header({
  messageCount,
  onClear,
  engineStatus,
  modelId,
  onModelSelect,
  personas,
  activePersona,
  onSelectPersona,
  onAddPersona,
  onDeletePersona,
  syncEnabled,
  isCompareMode,
  onOpenSidebar,
  onOpenSettings,
}: HeaderProps) {
  const hasActiveFeatures = syncEnabled || isCompareMode;

  return (
    <header className="relative z-50 flex items-center justify-between border-b border-neutral-800/60 bg-neutral-950/80 px-3 py-2 backdrop-blur-xl sm:px-5 sm:py-2.5">
      {/* Brand & Sidebar toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          title="Open conversation list"
          className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-2 text-neutral-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="EdgeChat Logo"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/30"
          />
          <h1 className="text-sm font-bold tracking-tight text-neutral-100 leading-none">
            Edge
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Chat
            </span>
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Clear chat button */}
        {messageCount > 0 && (
          <button
            onClick={onClear}
            id="clear-chat-button"
            aria-label="Clear chat history"
            className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-2.5 py-1.5 text-xs text-neutral-400 transition-colors hover:border-red-500/30 hover:text-red-400"
          >
            Clear
          </button>
        )}

        {/* Persona picker (desktop) */}
        <div className="hidden sm:block">
          <PersonaPicker
            personas={personas}
            activePersona={activePersona}
            onSelect={onSelectPersona}
            onAdd={onAddPersona}
            onDelete={onDeletePersona}
          />
        </div>

        {/* Model picker (Always visible) */}
        <ModelPicker
          currentModelId={modelId}
          engineStatus={engineStatus}
          onSelect={onModelSelect}
        />

        {/* Settings & Tools Button (Contains Compare, Sync, Storage, etc.) */}
        <button
          onClick={onOpenSettings}
          id="settings-button"
          aria-label="Open Settings and Tools"
          title="Settings, Tools & Preferences"
          className="relative rounded-lg border border-neutral-800 bg-neutral-900/50 p-2 text-neutral-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.993 6.993 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              clipRule="evenodd"
            />
          </svg>
          {hasActiveFeatures && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

