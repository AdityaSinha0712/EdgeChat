interface PresenceBadgeProps {
  peerCount: number;
  syncEnabled: boolean;
  onOpenPairing: () => void;
}

export function PresenceBadge({
  peerCount,
  syncEnabled,
  onOpenPairing,
}: PresenceBadgeProps) {
  if (!syncEnabled) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800/80 bg-neutral-900/40 px-2.5 py-1 text-xs text-neutral-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-teal-400">
        <path d="M13 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 15a4 4 0 0 0-8 0v3h8v-3ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM16 18v-1a3 3 0 0 0-3-3h-1.07a5.97 5.97 0 0 1 .07 1v3h4ZM4 18v-3c0-.34.025-.674.074-1H3a3 3 0 0 0-3 3v1h4Z" />
      </svg>
      <span>
        {peerCount > 0 ? `${peerCount} device${peerCount === 1 ? '' : 's'} online` : 'Waiting for peers'}
      </span>
      <button
        onClick={onOpenPairing}
        className="ml-1 rounded text-[10px] text-cyan-400 hover:underline"
      >
        Manage
      </button>
    </div>
  );
}
