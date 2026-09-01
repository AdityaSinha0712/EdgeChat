interface SyncToggleProps {
  syncEnabled: boolean;
  peerCount: number;
  onToggle: () => void;
}

export function SyncToggle({
  syncEnabled,
  peerCount,
  onToggle,
}: SyncToggleProps) {
  return (
    <button
      onClick={onToggle}
      id="sync-toggle-button"
      aria-label={syncEnabled ? 'Disable sync' : 'Enable sync'}
      title={
        syncEnabled
          ? `Sync ON — ${peerCount} peer${peerCount !== 1 ? 's' : ''} connected`
          : 'Enable cross-tab/device sync'
      }
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
        syncEnabled
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          : 'border-neutral-800 bg-neutral-900/50 text-neutral-500 hover:border-neutral-700 hover:text-neutral-400'
      }`}
    >
      {/* Sync icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5"
      >
        <path
          fillRule="evenodd"
          d="M15.312 11.424a5.5 5.5 0 0 1-9.379 2.624l-1.16 1.16a7 7 0 0 0 11.808-3.267l.542.07a.75.75 0 0 0 .166-1.49l-2.21-.29a.75.75 0 0 0-.86.63l-.29 2.21a.75.75 0 0 0 1.49.167l.103-.784ZM4.688 8.576a5.5 5.5 0 0 1 9.379-2.624l1.16-1.16A7 7 0 0 0 3.419 8.06l-.542-.07a.75.75 0 1 0-.166 1.49l2.21.29a.75.75 0 0 0 .86-.63l.29-2.21a.75.75 0 0 0-1.49-.166l-.103.783Z"
          clipRule="evenodd"
        />
      </svg>
      Sync
      {syncEnabled && peerCount > 0 && (
        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
          {peerCount}
        </span>
      )}
    </button>
  );
}
