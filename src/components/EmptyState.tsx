import type { EngineStatus } from '../store/useEngine';

interface EmptyStateProps {
  engineStatus: EngineStatus;
  onLoadModel: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export function EmptyState({
  engineStatus,
  onLoadModel,
  onSelectPrompt,
}: EmptyStateProps) {
  const needsInit = engineStatus === 'idle';

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      {/* Pulsing icon */}
      <div className="relative group">
        <div className="absolute -inset-1 animate-pulse rounded-3xl bg-cyan-500/20 blur-lg transition duration-1000 group-hover:bg-cyan-500/30" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-neutral-900 ring-1 ring-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden">
          <img
            src="/logo.png"
            alt="EdgeChat AI"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      <div className="max-w-sm text-center">
        <h2 className="text-xl font-semibold text-neutral-200">
          {needsInit ? 'Load AI Model' : 'Start a conversation'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          {needsInit
            ? 'Load a model to enable local AI chat. The model runs entirely in your browser — nothing leaves your device.'
            : 'Type a message below to begin. Your chat history is stored locally on this device — nothing leaves your browser.'}
        </p>
      </div>

      {needsInit ? (
        <button
          onClick={onLoadModel}
          id="load-model-button"
          className="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-500 hover:to-teal-500 hover:shadow-cyan-500/40 active:scale-95"
        >
          Load Model & Start Chatting
        </button>
      ) : (
        /* Hint chips */
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'Explain quantum computing',
            'Write a haiku about code',
            'What is WebGPU?',
          ].map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => onSelectPrompt?.(hint)}
              className="rounded-full border border-neutral-800 bg-neutral-900/50 px-4 py-1.5 text-xs text-neutral-400 transition-all hover:border-cyan-500/30 hover:bg-neutral-800/80 hover:text-neutral-200 active:scale-95 cursor-pointer"
            >
              {hint}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
