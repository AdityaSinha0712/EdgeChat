import { useCallback, useRef, useState } from 'react';

export interface TokenStats {
  /** Total tokens generated in the current/last session */
  tokenCount: number;
  /** Tokens per second */
  tokensPerSecond: number;
  /** Total generation time in milliseconds */
  elapsedMs: number;
  /** Whether currently generating */
  isActive: boolean;
}

const INITIAL_STATS: TokenStats = {
  tokenCount: 0,
  tokensPerSecond: 0,
  elapsedMs: 0,
  isActive: false,
};

/**
 * Tracks token-per-second stats during AI generation.
 *
 * Usage:
 *   1. Call `startTracking()` when generation begins
 *   2. Call `countToken()` for each token received
 *   3. Call `stopTracking()` when generation ends
 */
export function useTokenStats() {
  const [stats, setStats] = useState<TokenStats>(INITIAL_STATS);
  const startTimeRef = useRef(0);
  const tokenCountRef = useRef(0);

  const startTracking = useCallback(() => {
    startTimeRef.current = performance.now();
    tokenCountRef.current = 0;
    setStats({
      tokenCount: 0,
      tokensPerSecond: 0,
      elapsedMs: 0,
      isActive: true,
    });
  }, []);

  const countToken = useCallback(() => {
    tokenCountRef.current += 1;
    const elapsed = performance.now() - startTimeRef.current;
    const tps = elapsed > 0 ? (tokenCountRef.current / elapsed) * 1000 : 0;

    setStats({
      tokenCount: tokenCountRef.current,
      tokensPerSecond: tps,
      elapsedMs: elapsed,
      isActive: true,
    });
  }, []);

  const stopTracking = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const tps = elapsed > 0 ? (tokenCountRef.current / elapsed) * 1000 : 0;

    setStats({
      tokenCount: tokenCountRef.current,
      tokensPerSecond: tps,
      elapsedMs: elapsed,
      isActive: false,
    });
  }, []);

  return { stats, startTracking, countToken, stopTracking };
}
