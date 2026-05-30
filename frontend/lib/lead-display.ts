import type { BudgetBucket } from "@/lib/schemas";

export const BUDGET_LABELS: Record<BudgetBucket, string> = {
  under_10k: "Under $10k",
  "10k_50k": "$10k – $50k",
  over_50k: "> $50k",
};

export const BUDGET_CHIP_STYLES: Record<BudgetBucket, string> = {
  under_10k: "bg-slate-100 text-slate-700 ring-slate-200/80",
  "10k_50k": "bg-blue-50 text-blue-800 ring-blue-200/80",
  over_50k: "bg-indigo-50 text-indigo-800 ring-indigo-200/80",
};

export const SYNC_BADGE_STYLES: Record<string, string> = {
  synced: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  pending: "bg-amber-50 text-amber-800 ring-amber-200/80",
  failed: "bg-red-50 text-red-800 ring-red-200/80",
};
