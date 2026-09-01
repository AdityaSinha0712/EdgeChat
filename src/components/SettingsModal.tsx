import { useState } from 'react';
import type { EngineStatus } from '../store/useEngine';
import type { Persona } from '../lib/personas';
import { AVAILABLE_MODELS, type ModelOption } from '../lib/models';
import { isMobileDevice } from '../lib/device';
import { MobileModelWarningModal } from './MobileModelWarningModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onOpenStorage: () => void;
  onOpenExportImport: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
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
  onOpenStorage,
  onOpenExportImport,
}: SettingsModalProps) {
  const [isAddingPersona, setIsAddingPersona] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaIcon, setNewPersonaIcon] = useState('✨');
  const [newPersonaPrompt, setNewPersonaPrompt] = useState('');
  const [pendingModelWarning, setPendingModelWarning] =
    useState<ModelOption | null>(null);

  if (!isOpen) return null;

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === modelId) ?? AVAILABLE_MODELS[0];
  const isEngineLoading =
    engineStatus === 'loading' || engineStatus === 'checking-gpu';

  function handleCreatePersona(e: React.FormEvent) {
    e.preventDefault();
    if (!newPersonaName.trim() || !newPersonaPrompt.trim()) return;

    const created = onAddPersona(
      newPersonaName.trim(),
      newPersonaIcon.trim() || '🤖',
      newPersonaPrompt.trim(),
    );
    onSelectPersona(created.id);
    setNewPersonaName('');
    setNewPersonaIcon('✨');
    setNewPersonaPrompt('');
    setIsAddingPersona(false);
  }

  function handleModelChange(model: ModelOption) {
    if (model.id === modelId) return;

    if (isMobileDevice() && model.isHeavyForMobile) {
      setPendingModelWarning(model);
      return;
    }

    onModelSelect(model.id);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div
          className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
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
              </div>
              <div>
                <h2
                  id="settings-modal-title"
                  className="text-base font-bold text-neutral-100 leading-none"
                >
                  Settings & Features
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Manage models, sync, personas & tools
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close settings"
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-neutral-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>

          {/* Content scroll area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Section 1: Active Model */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  AI Model
                </span>
                <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                  {currentModel.size} • {currentModel.cutoff}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    disabled={isEngineLoading}
                    onClick={() => handleModelChange(model)}
                    className={`flex items-center justify-between rounded-lg p-2 text-left text-xs transition-colors ${
                      model.id === modelId
                        ? 'border border-cyan-500/40 bg-cyan-500/15 text-cyan-200'
                        : 'border border-neutral-800/80 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-medium truncate">{model.label}</span>
                      {model.isHeavyForMobile && (
                        <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1 text-[9px] font-mono text-amber-400 shrink-0">
                          ⚠️ Heavy
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-500 shrink-0">
                      {model.size}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: AI Personas */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  AI Persona
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingPersona(!isAddingPersona)}
                  className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300"
                >
                  {isAddingPersona ? 'Cancel' : '+ New Persona'}
                </button>
              </div>

              {/* Persona creator form */}
              {isAddingPersona && (
                <form
                  onSubmit={handleCreatePersona}
                  className="space-y-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Icon"
                      value={newPersonaIcon}
                      onChange={(e) => setNewPersonaIcon(e.target.value)}
                      maxLength={4}
                      className="w-12 rounded-lg border border-neutral-700 bg-neutral-900 p-2 text-center text-xs text-neutral-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Persona Name"
                      value={newPersonaName}
                      onChange={(e) => setNewPersonaName(e.target.value)}
                      className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 p-2 text-xs text-neutral-100 outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="System prompt instructions…"
                    rows={2}
                    value={newPersonaPrompt}
                    onChange={(e) => setNewPersonaPrompt(e.target.value)}
                    className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-900 p-2 text-xs text-neutral-100 outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-cyan-600 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                  >
                    Save & Activate Persona
                  </button>
                </form>
              )}

              {/* Persona List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {personas.map((persona) => {
                  const isSelected = persona.id === activePersona.id;
                  const isCustom = !persona.id.startsWith('default-');

                  return (
                    <div
                      key={persona.id}
                      onClick={() => onSelectPersona(persona.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs transition-colors ${
                        isSelected
                          ? 'border border-cyan-500/40 bg-cyan-500/15 text-cyan-200'
                          : 'border border-neutral-800/80 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{persona.icon}</span>
                        <span className="font-medium truncate">{persona.name}</span>
                      </div>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePersona(persona.id);
                          }}
                          className="p-1 text-neutral-500 hover:text-red-400"
                          title="Delete persona"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: P2P Sync & Privacy */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  P2P Device Sync (E2EE)
                </span>
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    syncEnabled
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      syncEnabled
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-neutral-500'
                    }`}
                  />
                  {syncEnabled ? `${peerCount} peers` : 'Offline / Off'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-neutral-900/80 p-2.5">
                <div>
                  <p className="text-xs font-medium text-neutral-200">
                    Enable Peer-to-Peer Sync
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Sync chats directly with paired devices via WebRTC
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleSync}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    syncEnabled ? 'bg-cyan-500' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      syncEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Pairing code button */}
              <button
                type="button"
                onClick={() => {
                  onOpenPairing();
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700/80 bg-neutral-800/60 py-2 text-xs font-medium text-neutral-200 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm2 2V5h1v1H5ZM3 13a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Zm2 2v-1h1v1H5ZM13 3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3Zm1 2v1h1V5h-1ZM13 12a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-3Zm1 2v1h1v-1h-1Z"
                    clipRule="evenodd"
                  />
                </svg>
                Pair Devices / Scan QR Code
              </button>
            </div>

            {/* Section 4: Modes & Data Tools */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5 space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Tools & Views
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Compare Mode */}
                <button
                  type="button"
                  onClick={() => {
                    onToggleCompare();
                    onClose();
                  }}
                  className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-colors ${
                    isCompareMode
                      ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 text-cyan-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.25 3a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-1.5 0V3.75A.75.75 0 0 1 9.25 3ZM3.5 6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3A.75.75 0 0 1 3.5 6Zm0 4a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3A.75.75 0 0 1 3.5 10Zm0 4a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3A.75.75 0 0 1 3.5 14Zm8-8a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Zm0 4a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Zm0 4a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Side-by-Side Compare</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {isCompareMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Storage Inspector */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenStorage();
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-2.5 text-left text-xs text-neutral-300 hover:border-neutral-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-cyan-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 4.75C2 3.784 2.784 3 3.75 3h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 16.25 17H3.75A1.75 1.75 0 0 1 2 15.25V4.75ZM3.5 7v8.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V7H3.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Storage Inspector</span>
                </button>

                {/* Export / Import */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenExportImport();
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-2.5 text-left text-xs text-neutral-300 hover:border-neutral-700 sm:col-span-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-cyan-400"
                  >
                    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                  </svg>
                  <span>Export & Import Chats</span>
                </button>
              </div>
            </div>

            {/* Section 5: Chat Management */}
            {messageCount > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-red-300">
                    Clear Current Chat
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Delete {messageCount} message{messageCount > 1 ? 's' : ''} in this conversation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    onClose();
                  }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                >
                  Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Warning Modal */}
      <MobileModelWarningModal
        model={pendingModelWarning}
        isOpen={!!pendingModelWarning}
        onClose={() => setPendingModelWarning(null)}
        onProceed={(id) => {
          onModelSelect(id);
          setPendingModelWarning(null);
        }}
        onSelectRecommended={(id) => {
          onModelSelect(id);
          setPendingModelWarning(null);
        }}
      />
    </>
  );
}
