import { useCallback, useEffect, useState } from 'react';

const SYNC_FLAG_KEY = 'edgechat-sync-enabled';

/**
 * Feature flag for CRDT sync (Phase 4).
 * Persisted in localStorage so it survives refresh.
 *
 * Listens for cross-tab `storage` events so toggling sync in one tab
 * automatically propagates to all other open tabs.
 */
export function useSyncFlag() {
  const [syncEnabled, setSyncEnabled] = useState(() => {
    try {
      return localStorage.getItem(SYNC_FLAG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Listen for cross-tab localStorage changes
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === SYNC_FLAG_KEY) {
        setSyncEnabled(e.newValue === 'true');
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleSync = useCallback(() => {
    setSyncEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SYNC_FLAG_KEY, String(next));
      } catch {
        // localStorage might be unavailable
      }
      return next;
    });
  }, []);

  return { syncEnabled, toggleSync };
}
