import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import AnalyticsBadges from "@/components/AnalyticsBadges";
import type { Analytics } from "@/lib/schemas";

const SAMPLE_ANALYTICS: Analytics = {
  total_leads: 42,
  total_pipeline_value: 150000,
  budget_breakdown: { under_10k: 10, "10k_50k": 20, over_50k: 12 },
};

describe("AnalyticsBadges", () => {
  it("shows loading state", () => {
    render(<AnalyticsBadges analytics={null} isLoading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows total leads count", () => {
    render(<AnalyticsBadges analytics={SAMPLE_ANALYTICS} isLoading={false} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows total pipeline value formatted", () => {
    render(<AnalyticsBadges analytics={SAMPLE_ANALYTICS} isLoading={false} />);
    expect(screen.getByText(/\$150,000/)).toBeInTheDocument();
  });

  it("shows empty state when no analytics", () => {
    render(<AnalyticsBadges analytics={null} isLoading={false} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
