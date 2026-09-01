import type { ModelOption } from '../lib/models';
import { DEFAULT_MODEL_ID } from '../lib/models';

interface MobileModelWarningModalProps {
  model: ModelOption | null;
  isOpen: boolean;
  onClose: () => void;
  onProceed: (modelId: string) => void;
  onSelectRecommended?: (modelId: string) => void;
}

export function MobileModelWarningModal({
  model,
  isOpen,
  onClose,
  onProceed,
  onSelectRecommended,
}: MobileModelWarningModalProps) {
  if (!isOpen || !model) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-warning-title"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-neutral-950/95 p-5 sm:p-6 shadow-2xl shadow-amber-950/20 backdrop-blur-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle background warning glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-amber-600/10 blur-3xl" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
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

        {/* Header with warning icon */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="mobile-warning-title"
                className="text-base font-bold tracking-tight text-neutral-100"
              >
                High Resource Model
              </h2>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                Mobile Warning
              </span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              Heavy performance requirements detected for mobile browser
            </p>
          </div>
        </div>

        {/* Model summary card */}
        <div className="mt-4 rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-200">
              {model.label}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400">
                {model.size} download
              </span>
              {model.vramEstimate && (
                <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-mono text-amber-300">
                  {model.vramEstimate} VRAM
                </span>
              )}
            </div>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            {model.description}
          </p>
        </div>

        {/* Mobile impact notes */}
        <div className="mt-3.5 space-y-2 text-xs">
          <div className="flex items-start gap-2 rounded-lg bg-neutral-900/40 p-2.5 text-neutral-300">
            <span className="shrink-0 text-amber-400">⚡</span>
            <div>
              <span className="font-medium text-neutral-200">Memory & Tab Crashes:</span>{' '}
              <span className="text-neutral-400">
                Mobile browsers enforce strict memory limits. Models &ge; 1.8GB can exceed browser limits and cause WebGPU out-of-memory crashes or force the tab to reload.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-neutral-900/40 p-2.5 text-neutral-300">
            <span className="shrink-0 text-amber-400">📶</span>
            <div>
              <span className="font-medium text-neutral-200">Data & Battery Usage:</span>{' '}
              <span className="text-neutral-400">
                Downloading {model.size} over mobile data consumes significant bandwidth, and running continuous inference causes higher battery drain.
              </span>
            </div>
          </div>
        </div>

        {/* Recommendation tip */}
        <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[11px] text-cyan-300">
          <span className="font-semibold">💡 Recommended for Mobile:</span>{' '}
          <span className="text-cyan-200/80">
            Use lightweight models like <strong>Qwen 2.5 0.5B (~350 MB)</strong> or <strong>Llama 3.2 1B (~700 MB)</strong> for fluid, crash-free performance.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => {
              if (onSelectRecommended) {
                onSelectRecommended(DEFAULT_MODEL_ID);
              } else {
                onProceed(DEFAULT_MODEL_ID);
              }
              onClose();
            }}
            className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-center text-xs font-semibold text-white shadow-lg shadow-cyan-950/50 transition-all hover:from-cyan-500 hover:to-teal-500 hover:shadow-cyan-500/25 active:scale-98"
          >
            Use Recommended (0.5B)
          </button>

          <button
            type="button"
            onClick={() => {
              onProceed(model.id);
              onClose();
            }}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-center text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 active:scale-98"
          >
            Proceed Anyway
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3.5 py-2.5 text-center text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 active:scale-98"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
