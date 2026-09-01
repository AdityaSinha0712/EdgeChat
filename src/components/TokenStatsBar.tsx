import type { TokenStats } from '../lib/useTokenStats';

interface TokenStatsBarProps {
  stats: TokenStats;
}

export function TokenStatsBar({ stats }: TokenStatsBarProps) {
  // Only show if we have stats to display
  if (stats.tokenCount === 0 && !stats.isActive) return null;

  return (
    <div
      className="animate-fade-in flex shrink-0 items-center justify-center gap-4 border-t border-neutral-800/40 bg-neutral-900/30 px-4 py-1.5 text-[11px] text-neutral-500"
      aria-label="Generation statistics"
      role="status"
    >
      {/* Tokens */}
      <div className="flex items-center gap-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3 w-3"
        >
          <path d="M1 8.849c0 1 .738 1.851 1.734 1.947L3 10.82v1.893a.75.75 0 0 0 1.28.53l1.81-1.81A8.5 8.5 0 0 0 8 11.5c3.59 0 6.5-2.35 6.5-5.25S11.59 1 8 1 1.5 3.35 1.5 6.25c0 .95.313 1.84.863 2.6L1 8.849Z" />
        </svg>
        <span className="tabular-nums font-medium">
          {stats.tokenCount} tokens
        </span>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3 w-3"
        >
          <path
            fillRule="evenodd"
            d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="tabular-nums font-medium">
          {stats.tokensPerSecond.toFixed(1)} tok/s
        </span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3 w-3"
        >
          <path
            fillRule="evenodd"
            d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="tabular-nums font-medium">
          {(stats.elapsedMs / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Active indicator */}
      {stats.isActive && (
        <span className="flex items-center gap-1 text-emerald-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
          generating
        </span>
      )}
    </div>
  );
}
