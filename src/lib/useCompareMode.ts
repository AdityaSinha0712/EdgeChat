import { useCallback, useState } from 'react';
import { DEFAULT_MODEL_ID, AVAILABLE_MODELS } from './models';

const COMPARE_MODE_KEY = 'edgechat-compare-mode';
const COMPARE_MODEL_A_KEY = 'edgechat-compare-model-a';
const COMPARE_MODEL_B_KEY = 'edgechat-compare-model-b';

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return stored === 'true';
  } catch {
    return fallback;
  }
}

function loadString(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Hook for managing side-by-side model comparison mode.
 */
export function useCompareMode() {
  const [isCompareMode, setIsCompareMode] = useState(() =>
    loadBool(COMPARE_MODE_KEY, false),
  );

  // Default to first two different models
  const defaultModelB =
    AVAILABLE_MODELS.length > 1
      ? AVAILABLE_MODELS[1].id
      : DEFAULT_MODEL_ID;

  const [modelA, setModelAState] = useState(() =>
    loadString(COMPARE_MODEL_A_KEY, DEFAULT_MODEL_ID),
  );
  const [modelB, setModelBState] = useState(() =>
    loadString(COMPARE_MODEL_B_KEY, defaultModelB),
  );

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COMPARE_MODE_KEY, String(next));
      } catch { /* noop */ }
      return next;
    });
  }, []);

  const setModelA = useCallback((id: string) => {
    setModelAState(id);
    try {
      localStorage.setItem(COMPARE_MODEL_A_KEY, id);
    } catch { /* noop */ }
  }, []);

  const setModelB = useCallback((id: string) => {
    setModelBState(id);
    try {
      localStorage.setItem(COMPARE_MODEL_B_KEY, id);
    } catch { /* noop */ }
  }, []);

  return {
    isCompareMode,
    toggleCompareMode,
    modelA,
    modelB,
    setModelA,
    setModelB,
  };
}
