import { ENDPOINTS } from "./config";
import {
  AnalyticsSchema,
  HubSpotStatusSchema,
  LeadListSchema,
  LeadSchema,
  type Analytics,
  type HubSpotStatus,
  type Lead,
  type LeadCreate,
} from "./schemas";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function formatValidationDetail(detail: unknown): string | null {
  if (!Array.isArray(detail)) return null;
  const messages = detail
    .map((item) => {
      if (typeof item !== "object" || item === null || !("msg" in item)) {
        return null;
      }
      const msg = String(item.msg);
      if ("loc" in item && Array.isArray(item.loc)) {
        const field = item.loc.at(-1);
        if (typeof field === "string") {
          return `${field}: ${msg.replace(/^Value error, /, "")}`;
        }
      }
      return msg.replace(/^Value error, /, "");
    })
    .filter((m): m is string => m !== null);
  return messages.length > 0 ? messages.join("; ") : null;
}

async function parseApiErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "detail" in body) {
      const detail = body.detail;
      if (typeof detail === "string") return detail;
      const formatted = formatValidationDetail(detail);
      if (formatted) return formatted;
    }
  } catch {
    /* non-JSON error body */
  }
  return `API error: ${response.status} ${response.statusText}`;
}

async function fetchJson<T>(
  url: string,
  options?: RequestInit,
): Promise<{ raw: unknown; parsed?: T }> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await parseApiErrorMessage(response);
    throw new ApiError(message, response.status);
  }
  const raw: unknown = await response.json();
  return { raw };
}

export async function createLead(data: LeadCreate): Promise<Lead> {
  const { raw } = await fetchJson(ENDPOINTS.leads, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return LeadSchema.parse(raw);
}

export async function fetchLeads(): Promise<Lead[]> {
  const { raw } = await fetchJson(ENDPOINTS.leads);
  return LeadListSchema.parse(raw);
}

export async function fetchAnalytics(): Promise<Analytics> {
  const { raw } = await fetchJson(ENDPOINTS.analytics);
  return AnalyticsSchema.parse(raw);
}

export async function fetchHubSpotStatus(): Promise<HubSpotStatus> {
  const { raw } = await fetchJson(ENDPOINTS.hubspotStatus);
  return HubSpotStatusSchema.parse(raw);
}

export { ApiError };
