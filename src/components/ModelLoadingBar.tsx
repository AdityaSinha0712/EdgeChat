import type { LoadProgress } from '../store/useEngine';

interface ModelLoadingBarProps {
  progress: LoadProgress;
}

export function ModelLoadingBar({ progress }: ModelLoadingBarProps) {
  const pct = Math.round(progress.progress * 100);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            {/* Spinning ring */}
            <svg
              className="absolute h-16 w-16 animate-spin"
              viewBox="0 0 64 64"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-neutral-800"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="176"
                strokeDashoffset="132"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-7 w-7 text-cyan-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-lg font-semibold text-neutral-200">
          Loading AI model
        </h2>

        {/* Progress bar */}
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Status text */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="max-w-[80%] truncate">{progress.text}</span>
          <span className="tabular-nums font-medium text-neutral-400">
            {pct}%
          </span>
        </div>

        {/* Hint */}
        <p className="mt-6 text-center text-xs text-neutral-600">
          Initial visit downloads model weights (~350 MB+) to local browser cache.
          <br />
          Subsequent visits load model weights locally from browser cache into GPU memory.
        </p>
      </div>
    </div>
  );
}
