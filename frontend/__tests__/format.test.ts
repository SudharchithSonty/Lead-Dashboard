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
});
