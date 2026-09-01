import { useState } from 'react';
import { AVAILABLE_MODELS, type ModelOption } from '../lib/models';
import type { EngineStatus } from '../store/useEngine';
import { isMobileDevice } from '../lib/device';
import { MobileModelWarningModal } from './MobileModelWarningModal';

interface ModelPickerProps {
  currentModelId: string;
  engineStatus: EngineStatus;
  onSelect: (modelId: string) => void;
}

export function ModelPicker({
  currentModelId,
  engineStatus,
  onSelect,
}: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingModelWarning, setPendingModelWarning] =
    useState<ModelOption | null>(null);

  const isLoading =
    engineStatus === 'loading' || engineStatus === 'checking-gpu';

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === currentModelId) ??
    AVAILABLE_MODELS[0];

  function handleModelClick(model: ModelOption) {
    if (model.id === currentModelId) {
      setIsOpen(false);
      return;
    }

    if (isMobileDevice() && model.isHeavyForMobile) {
      setIsOpen(false);
      setPendingModelWarning(model);
      return;
    }

    setIsOpen(false);
    onSelect(model.id);
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        id="model-picker-button"
        aria-label="Select AI model"
        className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-cyan-500/30 hover:text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
        >
          <path d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Z" />
        </svg>
        <span>{currentModel.label}</span>
        <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400 font-mono">
          {currentModel.cutoff}
        </span>
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 max-h-[80vh] overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  Select Model
                </p>
                <p className="text-[10px] font-medium text-neutral-500">
                  Knowledge Cutoff
                </p>
              </div>
              {AVAILABLE_MODELS.map((model: ModelOption) => (
                <button
                  key={model.id}
                  onClick={() => handleModelClick(model)}
                  className={`flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    model.id === currentModelId
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'text-neutral-300 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{model.label}</span>
                      {model.isHeavyForMobile && (
                        <span
                          title="High memory/VRAM requirement — caution on mobile"
                          className="rounded bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 text-[9px] font-mono text-amber-400"
                        >
                          ⚠️ Heavy
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                        {model.cutoff}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {model.size}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {model.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mobile Model Warning Modal */}
      <MobileModelWarningModal
        model={pendingModelWarning}
        isOpen={!!pendingModelWarning}
        onClose={() => setPendingModelWarning(null)}
        onProceed={(id) => {
          onSelect(id);
          setPendingModelWarning(null);
        }}
        onSelectRecommended={(id) => {
          onSelect(id);
          setPendingModelWarning(null);
        }}
      />
    </div>
  );
}

