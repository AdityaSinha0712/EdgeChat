import { useCallback, useEffect, useState } from 'react';
import { db } from './db';

export interface StorageStats {
  quotaBytes: number;
  usageBytes: number;
  usagePercentage: number;
  isPersisted: boolean;
  messageCount: number;
  conversationCount: number;
  hasModelWeightCache: boolean;
}

export function useStorageEstimate() {
  const [stats, setStats] = useState<StorageStats | null>(null);

  const refreshStorageStats = useCallback(async () => {
    try {
      let quotaBytes = 0;
      let usageBytes = 0;
      let isPersisted = false;

      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        quotaBytes = estimate.quota ?? 0;
        usageBytes = estimate.usage ?? 0;
      }

      if (navigator.storage && navigator.storage.persisted) {
        isPersisted = await navigator.storage.persisted();
      }

      const messageCount = await db.messages.count();
      const conversationCount = await db.conversations.count();

      // Check CacheStorage for model weights
      let hasModelWeightCache = false;
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        hasModelWeightCache = cacheNames.some((name) =>
          name.includes('webllm') || name.includes('model') || name.includes('transformers'),
        );
      }

      const usagePercentage =
        quotaBytes > 0 ? Math.min(100, (usageBytes / quotaBytes) * 100) : 0;

      setStats({
        quotaBytes,
        usageBytes,
        usagePercentage,
        isPersisted,
        messageCount,
        conversationCount,
        hasModelWeightCache,
      });
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    refreshStorageStats();
  }, [refreshStorageStats]);

  const clearModelCache = useCallback(async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
      await refreshStorageStats();
    }
  }, [refreshStorageStats]);

  return {
    stats,
    refreshStorageStats,
    clearModelCache,
  };
}
