import { describe, it, expect } from "vitest";
import { LeadSchema, AnalyticsSchema, HubSpotStatusSchema, LeadCreateSchema } from "@/lib/schemas";

describe("Zod schema validation", () => {
  describe("LeadSchema", () => {
    it("parses a valid lead", () => {
      const data = {
        id: 1,
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@acme.com",
        company: "Acme",
        budget: "under_10k",
        sync_status: "synced",
        hubspot_contact_id: "hs-1",
        sync_error: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };
      expect(() => LeadSchema.parse(data)).not.toThrow();
    });

    it("rejects invalid sync_status", () => {
      const data = {
        id: 1,
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@acme.com",
        company: "Acme",
        budget: "under_10k",
        sync_status: "unknown",
        hubspot_contact_id: null,
        sync_error: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };
      expect(() => LeadSchema.parse(data)).toThrow();
    });
  });

  describe("AnalyticsSchema", () => {
    it("parses valid analytics", () => {
      const data = {
        total_leads: 5,
        total_pipeline_value: 50000,
        budget_breakdown: { under_10k: 3, over_50k: 2 },
      };
      expect(() => AnalyticsSchema.parse(data)).not.toThrow();
    });
  });

  describe("HubSpotStatusSchema", () => {
    it("parses valid status", () => {
      const data = {
        configured: true,
        last_sync_success: true,
        last_sync_error: null,
      };
      expect(() => HubSpotStatusSchema.parse(data)).not.toThrow();
    });
  });

  describe("LeadCreateSchema", () => {
    it("rejects empty first_name", () => {
      const data = {
        first_name: "",
        last_name: "Doe",
        email: "j@acme.com",
        company: "A",
        budget: "under_10k",
      };
      expect(() => LeadCreateSchema.parse(data)).toThrow();
    });

    it("rejects invalid email", () => {
      const data = {
        first_name: "J",
        last_name: "D",
        email: "not-email",
        company: "A",
        budget: "under_10k",
      };
      expect(() => LeadCreateSchema.parse(data)).toThrow();
    });
  });
});
