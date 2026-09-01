/**
 * Device identity utilities.
 *
 * Generates and persists a unique, human-friendly device name/id for this browser.
 * Used to tag message origins so synced messages display a "Synced from [Device]" badge.
 */

const DEVICE_ID_KEY = 'edgechat-device-id';
const DEVICE_NAME_KEY = 'edgechat-device-name';

function generateDeviceName(): string {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const platform = isMobile ? 'Mobile' : 'Desktop';
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${platform}-${randomSuffix}`;
}

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'browser-local';
  }
}

export function getDeviceName(): string {
  try {
    let name = localStorage.getItem(DEVICE_NAME_KEY);
    if (!name) {
      name = generateDeviceName();
      localStorage.setItem(DEVICE_NAME_KEY, name);
    }
    return name;
  } catch {
    return 'Device';
  }
}
