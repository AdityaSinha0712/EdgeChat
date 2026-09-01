import { ModelPicker } from './ModelPicker';
import { PersonaPicker } from './PersonaPicker';
import { SyncToggle } from './SyncToggle';
import { PrivacyStatusBadge } from './PrivacyStatusBadge';
import { PresenceBadge } from './PresenceBadge';
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
  isCompareMode: boolean;
  onToggleCompare: () => void;
  syncEnabled: boolean;
  peerCount: number;
  onToggleSync: () => void;
  onOpenPairing: () => void;
  onOpenSidebar: () => void;
  onOpenStorage: () => void;
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
  isCompareMode,
  onToggleCompare,
  syncEnabled,
  peerCount,
  onToggleSync,
  onOpenPairing,
  onOpenSidebar,
  onOpenStorage,
}: HeaderProps) {
  return (
    <header className="relative z-50 flex items-center justify-between border-b border-neutral-800/60 bg-neutral-950/80 px-3 py-2.5 backdrop-blur-xl sm:px-5 sm:py-3">
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
            className="h-8 w-8 rounded-lg object-cover shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/30"
          />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-neutral-100 leading-none">
              Edge
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Chat
              </span>
            </h1>
          </div>
        </div>

        {/* Dynamic Privacy Indicator */}
        <PrivacyStatusBadge syncEnabled={syncEnabled} peerCount={peerCount} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {messageCount > 0 && (
          <button
            onClick={onClear}
            id="clear-chat-button"
            aria-label="Clear chat history"
            className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-red-500/30 hover:text-red-400"
          >
            Clear
          </button>
        )}

        {/* Storage inspector button */}
        <button
          onClick={onOpenStorage}
          title="Storage & Trust Inspector"
          className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-1.5 text-neutral-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M2 4.75C2 3.784 2.784 3 3.75 3h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 16.25 17H3.75A1.75 1.75 0 0 1 2 15.25V4.75ZM3.5 7v8.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V7H3.5Z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Model picker */}
        <ModelPicker
          currentModelId={modelId}
          engineStatus={engineStatus}
          onSelect={onModelSelect}
        />

        {/* Persona picker */}
        <PersonaPicker
          personas={personas}
          activePersona={activePersona}
          onSelect={onSelectPersona}
          onAdd={onAddPersona}
          onDelete={onDeletePersona}
        />

        {/* Compare toggle */}
        <button
          onClick={onToggleCompare}
          id="compare-toggle-button"
          aria-label="Toggle side-by-side comparison"
          title={isCompareMode ? 'Exit compare mode' : 'Compare two models'}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
            isCompareMode
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              : 'border-neutral-800 bg-neutral-900/50 text-neutral-500 hover:border-cyan-500/30 hover:text-neutral-300'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M9.25 3a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-1.5 0V3.75A.75.75 0 0 1 9.25 3ZM3.5 6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3A.75.75 0 0 1 3.5 6Zm0 4a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3A.75.75 0 0 1 3.5 10Zm0 4a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3A.75.75 0 0 1 3.5 14Zm8-8a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Zm0 4a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Zm0 4a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Compare</span>
        </button>

        {/* Presence Badge */}
        <PresenceBadge
          syncEnabled={syncEnabled}
          peerCount={peerCount}
          onOpenPairing={onOpenPairing}
        />

        {/* Sync toggle */}
        <SyncToggle
          syncEnabled={syncEnabled}
          peerCount={peerCount}
          onToggle={onToggleSync}
        />
      </div>
    </header>
  );
}
