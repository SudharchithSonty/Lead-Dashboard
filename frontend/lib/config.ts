export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const ENDPOINTS = {
  leads: `${API_BASE_URL}/api/leads`,
  leadsStream: `${API_BASE_URL}/api/leads/stream`,
  analytics: `${API_BASE_URL}/api/analytics`,
  hubspotStatus: `${API_BASE_URL}/api/hubspot/status`,
} as const;

export const BUDGET_OPTIONS = [
  { value: "under_10k", label: "Under $10k" },
  { value: "10k_50k", label: "$10k - $50k" },
  { value: "over_50k", label: "Greater than $50k" },
] as const;
