import { z } from "zod/v4";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "mail.com",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
]);

export const BudgetBucketSchema = z.enum(["under_10k", "10k_50k", "over_50k"]);
export type BudgetBucket = z.infer<typeof BudgetBucketSchema>;

export const SyncStatusSchema = z.enum(["pending", "synced", "failed"]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const LeadSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  company: z.string(),
  budget: BudgetBucketSchema,
  sync_status: SyncStatusSchema,
  hubspot_contact_id: z.nullable(z.string()),
  sync_error: z.nullable(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const LeadListSchema = z.array(LeadSchema);

export const AnalyticsSchema = z.object({
  total_leads: z.number(),
  total_pipeline_value: z.number(),
  budget_breakdown: z.record(z.string(), z.number()),
});
export type Analytics = z.infer<typeof AnalyticsSchema>;

export const HubSpotStatusSchema = z.object({
  configured: z.boolean(),
  last_sync_success: z.nullable(z.boolean()),
  last_sync_error: z.nullable(z.string()),
});
export type HubSpotStatus = z.infer<typeof HubSpotStatusSchema>;

export const LeadCreateSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company is required"),
  budget: z
    .string()
    .min(1, "Please select a budget range")
    .pipe(BudgetBucketSchema),
}).superRefine((data, ctx) => {
  const domain = data.email.split("@")[1]?.toLowerCase();
  if (domain && FREE_EMAIL_DOMAINS.has(domain)) {
    ctx.addIssue({
      code: "custom",
      message: "Please use a corporate email address (not Gmail, Yahoo, etc.)",
      path: ["email"],
    });
  }
});
export type LeadCreate = z.infer<typeof LeadCreateSchema>;
