export function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}` || "?";
}

const SYNC_STATUS_LABELS: Record<string, string> = {
  synced: "Synced",
  pending: "Pending",
  failed: "Failed",
};

export function formatSyncStatus(status: string): string {
  return SYNC_STATUS_LABELS[status] ?? status;
}

export function formatRelativeTime(isoDate: string, now = Date.now()): string {
  // Naive strings (no Z or UTC offset) are SQLite UTC timestamps. Appending Z
  // forces JS to parse them as UTC instead of local time.
  const normalized = /Z|[+-]\d{2}:\d{2}$/.test(isoDate) ? isoDate : `${isoDate}Z`;
  const then = new Date(normalized).getTime();
  if (Number.isNaN(then)) return "";

  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
