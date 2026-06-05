import { describe, it, expect } from "vitest";

import {
  formatCurrency,
  formatRelativeTime,
  formatSyncStatus,
  getInitials,
} from "@/lib/format";

describe("format utilities", () => {
  it("formats currency with grouping", () => {
    expect(formatCurrency(150000)).toBe("$150,000");
  });

  it("builds initials from names", () => {
    expect(getInitials("Jane", "Doe")).toBe("JD");
  });

  it("title-cases sync status", () => {
    expect(formatSyncStatus("synced")).toBe("Synced");
    expect(formatSyncStatus("pending")).toBe("Pending");
  });

  it("formats relative time for recent leads", () => {
    const now = new Date("2026-05-30T12:00:00Z").getTime();
    expect(formatRelativeTime("2026-05-30T11:58:00Z", now)).toBe("2m ago");
  });

  it("treats naive (no timezone) timestamps as UTC, not local time", () => {
    // SQLite stores naive UTC; without this fix JS would parse as local time
    // and show hours-old on UTC+N machines.
    const now = new Date("2026-05-30T12:00:00Z").getTime();
    // "2026-05-30T11:58:00" has no Z — must be read as UTC → 2m ago
    expect(formatRelativeTime("2026-05-30T11:58:00", now)).toBe("2m ago");
  });

  it("formats just now for sub-minute timestamps", () => {
    const now = new Date("2026-05-30T12:00:00Z").getTime();
    expect(formatRelativeTime("2026-05-30T11:59:45Z", now)).toBe("just now");
  });

  it("formats hours ago", () => {
    const now = new Date("2026-05-30T12:00:00Z").getTime();
    expect(formatRelativeTime("2026-05-30T09:00:00Z", now)).toBe("3h ago");
  });

  it("formats days ago", () => {
    const now = new Date("2026-05-30T12:00:00Z").getTime();
    expect(formatRelativeTime("2026-05-27T12:00:00Z", now)).toBe("3d ago");
  });
});
