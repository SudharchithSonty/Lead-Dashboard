import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import LeadFeed from "@/components/LeadFeed";
import type { Lead } from "@/lib/schemas";

const SAMPLE_LEAD: Lead = {
  id: 1,
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@acme.com",
  company: "Acme Corp",
  budget: "under_10k",
  sync_status: "synced",
  hubspot_contact_id: "hs-123",
  sync_error: null,
  created_at: "2026-05-28T10:00:00Z",
  updated_at: "2026-05-28T10:00:00Z",
};

describe("LeadFeed", () => {
  it("shows loading state", () => {
    render(<LeadFeed leads={[]} isLoading={true} error={null} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(
      <LeadFeed leads={[]} isLoading={false} error="Something went wrong" />,
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("shows empty state when no leads", () => {
    render(<LeadFeed leads={[]} isLoading={false} error={null} />);
    expect(screen.getByText(/no leads yet/i)).toBeInTheDocument();
  });

  it("shows add-lead action in empty state when handler provided", () => {
    const onAddLead = vi.fn();
    render(
      <LeadFeed
        leads={[]}
        isLoading={false}
        error={null}
        onAddLead={onAddLead}
      />,
    );
    expect(
      screen.getByRole("button", { name: /submit first lead/i }),
    ).toBeInTheDocument();
  });

  it("renders lead data in feed", () => {
    render(
      <LeadFeed leads={[SAMPLE_LEAD]} isLoading={false} error={null} />,
    );
    expect(screen.getAllByText(/Jane Doe/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("jane@acme.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Acme Corp").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/synced/i).length).toBeGreaterThan(0);
  });

  it("shows failed sync status with error", () => {
    const failedLead: Lead = {
      ...SAMPLE_LEAD,
      sync_status: "failed",
      sync_error: "HubSpot timeout",
    };
    render(
      <LeadFeed leads={[failedLead]} isLoading={false} error={null} />,
    );
    expect(screen.getAllByText(/^Failed$/i).length).toBeGreaterThan(0);
  });
});
