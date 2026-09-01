/**
 * Formats a unix-ms timestamp into a human-readable relative/absolute string.
 *
 * - < 1 min  → "Just now"
 * - < 1 hr   → "5m ago"
 * - < 24 hr  → "2:34 PM"
 * - otherwise → "Jul 10, 2:34 PM"
 */
export function formatTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const diffHrs = diffMs / 3_600_000;
  if (diffHrs < 24) return timeStr;

  const monthDay = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return `${monthDay}, ${timeStr}`;
}
