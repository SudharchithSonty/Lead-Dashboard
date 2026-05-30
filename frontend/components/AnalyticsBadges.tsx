"use client";

import type { Analytics } from "@/lib/schemas";
import { formatCurrency } from "@/lib/format";

interface AnalyticsBadgesProps {
  analytics: Analytics | null;
  isLoading: boolean;
}

function SkeletonCard() {
  return (
    <div
      className="rounded-xl border border-border bg-surface p-6 shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
        <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-muted" />
      </div>
      <div className="mt-4 h-9 w-20 animate-pulse rounded bg-surface-muted" />
      <div className="mt-2 h-3 w-32 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function AnalyticsBadges({
  analytics,
  isLoading,
}: AnalyticsBadgesProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        aria-busy="true"
        aria-label="Loading analytics"
      >
        <span className="sr-only">Loading analytics</span>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const totalLeads = analytics?.total_leads ?? 0;
  const pipelineValue = analytics?.total_pipeline_value ?? 0;
  const avgPerLead =
    totalLeads > 0 ? Math.round(pipelineValue / totalLeads) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-blue-900/70">Total Leads</p>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <UsersIcon className="h-5 w-5" />
          </div>
        </div>
        <p className="tabular-nums mt-3 text-3xl font-bold tracking-tight text-gray-900">
          {totalLeads}
        </p>
        <p className="mt-1 text-xs text-blue-800/60">Active in pipeline</p>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-indigo-900/70">
            Est. Pipeline Value
          </p>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <CurrencyIcon className="h-5 w-5" />
          </div>
        </div>
        <p className="tabular-nums mt-3 text-3xl font-bold tracking-tight text-gray-900">
          {formatCurrency(pipelineValue)}
        </p>
        <p className="mt-1 text-xs text-indigo-800/60">
          {totalLeads > 0
            ? `~${formatCurrency(avgPerLead)} avg per lead`
            : "No leads yet"}
        </p>
      </div>
    </div>
  );
}
