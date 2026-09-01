import { useStorageEstimate } from '../lib/useStorageEstimate';

interface StoragePanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoragePanelModal({ isOpen, onClose }: StoragePanelModalProps) {
  const { stats, refreshStorageStats, clearModelCache } = useStorageEstimate();

  if (!isOpen) return null;

  function formatMB(bytes: number): string {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        {/* Title */}
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M2 4.75C2 3.784 2.784 3 3.75 3h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 16.25 17H3.75A1.75 1.75 0 0 1 2 15.25V4.75ZM3.5 7v8.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V7H3.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100">Storage & Privacy Inspector</h2>
            <p className="text-xs text-neutral-500">Everything cached on your device</p>
          </div>
        </div>

        {stats ? (
          <div className="space-y-4 text-xs">
            {/* Storage Usage Progress */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 space-y-2">
              <div className="flex justify-between font-medium text-neutral-300">
                <span>IndexedDB & Cache Storage</span>
                <span className="text-cyan-400">
                  {stats.usageBytes > stats.quotaBytes && stats.quotaBytes > 0
                    ? `${formatMB(stats.usageBytes)} (Soft quota: ${formatMB(stats.quotaBytes)})`
                    : `${formatMB(stats.usageBytes)} / ${formatMB(stats.quotaBytes)}`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${Math.max(2, stats.usagePercentage)}%` }}
                />
              </div>
              {stats.usageBytes > stats.quotaBytes && stats.quotaBytes > 0 && (
                <p className="text-[10px] text-neutral-500 pt-0.5">
                  Multiple AI models are cached locally, exceeding the browser's default soft quota.
                </p>
              )}
            </div>

            {/* Breakdown stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">Messages Stored</span>
                <p className="mt-1 text-base font-bold text-neutral-200">{stats.messageCount}</p>
              </div>
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">Conversations</span>
                <p className="mt-1 text-base font-bold text-neutral-200">{stats.conversationCount}</p>
              </div>
            </div>

            {/* Trust & Persistence Badges */}
            <div className="space-y-2 rounded-xl border border-neutral-800/80 bg-neutral-900/30 p-3 text-[11px]">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Browser Storage Protection</span>
                <span className={stats.isPersisted ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {stats.isPersisted ? '✓ Persistent' : 'Best effort'}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Model Weights Cached</span>
                <span className={stats.hasModelWeightCache ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}>
                  {stats.hasModelWeightCache ? '✓ Cached in Browser' : 'Not cached yet'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={refreshStorageStats}
                className="text-xs text-neutral-500 hover:text-neutral-300"
              >
                Refresh stats
              </button>
              <button
                onClick={clearModelCache}
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
              >
                Clear Model Cache
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-neutral-500">Calculating storage usage…</div>
        )}
      </div>
    </div>
  );
}
