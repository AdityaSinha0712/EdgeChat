/**
 * Request persistent storage so the browser won't evict
 * the cached model weights under storage pressure.
 *
 * Called once on app startup. Silently no-ops if the API
 * isn't available or the browser denies the request.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;

  try {
    const granted = await navigator.storage.persist();
    if (granted) {
      console.log('[EdgeChat] Persistent storage granted');
    } else {
      console.log('[EdgeChat] Persistent storage denied by browser');
    }
    return granted;
  } catch {
    return false;
  }
}
