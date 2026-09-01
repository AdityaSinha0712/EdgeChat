import { useEffect, useState } from 'react';

/**
 * Checks if the current environment is running on a mobile device or tablet.
 * Detects mobile user agents, iPadOS desktop-mode emulation, and touch/viewport constraints.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua =
    navigator.userAgent ||
    navigator.vendor ||
    (window as unknown as { opera?: string }).opera ||
    '';

  // 1. Common mobile user-agents (Android, iPhone, iPod, BlackBerry, Opera Mini, Mobile Safari/Chrome)
  const mobileRegex =
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS/i;
  if (mobileRegex.test(ua)) {
    return true;
  }

  // 2. iPadOS detection (modern iPads report as Macintosh with multi-touch points)
  if (
    navigator.maxTouchPoints > 1 &&
    (/Macintosh/i.test(ua) || /iPad/i.test(ua))
  ) {
    return true;
  }

  // 3. Viewport width + touch pointer fallback (screen width <= 768px with coarse pointer)
  if (
    typeof window.matchMedia === 'function' &&
    window.innerWidth <= 768 &&
    window.matchMedia('(pointer: coarse)').matches
  ) {
    return true;
  }

  return false;
}

/**
 * React hook to reactively track if the user is on a mobile device or small touch viewport.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileDevice());

  useEffect(() => {
    function handleResize() {
      setIsMobile(isMobileDevice());
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isMobile;
}
