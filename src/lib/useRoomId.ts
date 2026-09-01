import { useCallback, useState } from 'react';

const ROOM_ID_KEY = 'edgechat-room-id';

/**
 * Generates, stores, and manages the device's y-webrtc room ID.
 *
 * On first launch a random UUID is created via `crypto.randomUUID()`.
 * When pairing with another device the room ID is replaced with the
 * one received out-of-band (QR code or manual entry).
 *
 * The same value doubles as the `password` option for `WebrtcProvider`,
 * ensuring traffic on the public signaling server is encrypted.
 */
export function useRoomId() {
  const [roomId, setRoomIdState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(ROOM_ID_KEY);
      if (stored) return stored;

      const newId = crypto.randomUUID();
      localStorage.setItem(ROOM_ID_KEY, newId);
      return newId;
    } catch {
      // Fallback if crypto.randomUUID() isn't available
      const fallback =
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      try {
        localStorage.setItem(ROOM_ID_KEY, fallback);
      } catch {
        // localStorage might be unavailable
      }
      return fallback;
    }
  });

  /**
   * Adopt a room ID received from another device (via QR or manual entry).
   * Replaces this device's room ID and persists it.
   */
  const adoptRoomId = useCallback((newRoomId: string) => {
    const trimmed = newRoomId.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(ROOM_ID_KEY, trimmed);
    } catch {
      // localStorage might be unavailable
    }
    setRoomIdState(trimmed);
  }, []);

  /**
   * Generate a brand-new room ID (useful for "unpair" or "reset").
   */
  const resetRoomId = useCallback(() => {
    const newId = crypto.randomUUID();
    try {
      localStorage.setItem(ROOM_ID_KEY, newId);
    } catch {
      // localStorage might be unavailable
    }
    setRoomIdState(newId);
  }, []);

  /**
   * Short display version of the room ID for manual entry.
   * Takes the first 8 characters (before the first dash).
   */
  const shortCode = roomId.split('-')[0].toUpperCase();

  return { roomId, shortCode, adoptRoomId, resetRoomId };
}
