const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < MINUTE) {
    return "just now";
  }
  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)}m ago`;
  }
  if (diff < DAY) {
    return `${Math.floor(diff / HOUR)}h ago`;
  }
  const days = Math.floor(diff / DAY);
  if (days === 1) {
    return "yesterday";
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  if (days < 14) {
    return "1w ago";
  }
  return `${Math.floor(days / 7)}w ago`;
}

export function absoluteDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function firesAtRelative(iso: string | null): string {
  if (!iso) {
    return "no time set";
  }
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) {
    return relativeTime(iso);
  }
  if (diff < HOUR) {
    return `in ${Math.max(1, Math.floor(diff / MINUTE))}m`;
  }
  if (diff < DAY) {
    return `in ${Math.floor(diff / HOUR)}h`;
  }
  return absoluteDateTime(iso);
}
