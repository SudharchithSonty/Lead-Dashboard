import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import HubSpotStatus from "@/components/HubSpotStatus";

describe("HubSpotStatus", () => {
  it("shows loading state", () => {
    render(<HubSpotStatus status={null} isLoading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows connected when configured and last sync succeeded", () => {
    render(
      <HubSpotStatus
        status={{
          configured: true,
          last_sync_success: true,
          last_sync_error: null,
        }}
        isLoading={false}
      />,
    );
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  it("shows disconnected when not configured", () => {
    render(
      <HubSpotStatus
        status={{
          configured: false,
          last_sync_success: null,
          last_sync_error: "HubSpot access token is not configured",
        }}
        isLoading={false}
      />,
    );
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });

  it("shows connected with warning when configured but last sync failed", () => {
    render(
      <HubSpotStatus
        status={{
          configured: true,
          last_sync_success: false,
          last_sync_error: "timeout",
        }}
        isLoading={false}
      />,
    );
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
    expect(screen.getByText(/sync issue/i)).toBeInTheDocument();
    expect(screen.getByText(/timeout/i)).toBeInTheDocument();
  });
});
