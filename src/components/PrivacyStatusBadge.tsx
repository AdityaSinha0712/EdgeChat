interface PrivacyStatusBadgeProps {
  syncEnabled: boolean;
  peerCount: number;
}

export function PrivacyStatusBadge({ syncEnabled, peerCount }: PrivacyStatusBadgeProps) {
  return (
    <div
      title={
        syncEnabled
          ? `End-to-End Encrypted WebRTC Sync (${peerCount} peer${peerCount === 1 ? '' : 's'} connected)`
          : 'Local-First Private Chat: Messages never leave this browser'
      }
      className="hidden md:flex items-center gap-1.5 rounded-full border border-neutral-800/80 bg-neutral-900/40 px-2.5 py-1 text-[11px]"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
            syncEnabled ? 'animate-ping bg-teal-400' : 'bg-emerald-400'
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            syncEnabled ? 'bg-teal-400' : 'bg-emerald-500'
          }`}
        />
      </span>
      <span className="text-neutral-400 font-medium">
        {syncEnabled
          ? `E2EE Sync (${peerCount} peer${peerCount === 1 ? '' : 's'})`
          : '🔒 Local Only (100% Private)'}
      </span>
    </div>
  );
}
