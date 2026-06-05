"use client";

import type { Lead } from "@/lib/schemas";
import {
  formatRelativeTime,
  formatSyncStatus,
  getInitials,
} from "@/lib/format";
import {
  BUDGET_CHIP_STYLES,
  BUDGET_LABELS,
  SYNC_BADGE_STYLES,
} from "@/lib/lead-display";

interface LeadFeedProps {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  highlightLeadIds?: number[];
  onAddLead?: () => void;
  now?: number;
}

function FeedSkeleton() {
  return (
    <div className="divide-y divide-gray-100" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function Avatar({ lead }: { lead: Lead }) {
  const initials = getInitials(lead.first_name, lead.last_name);
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function BudgetChip({ budget }: { budget: Lead["budget"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BUDGET_CHIP_STYLES[budget]}`}
    >
      {BUDGET_LABELS[budget]}
    </span>
  );
}

function SyncBadge({ lead }: { lead: Lead }) {
  const label = formatSyncStatus(lead.sync_status);
  const styles =
    SYNC_BADGE_STYLES[lead.sync_status] ?? "bg-gray-100 text-gray-800 ring-gray-200/80";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}
      title={lead.sync_error ?? undefined}
    >
      {lead.sync_status === "synced" && (
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {lead.sync_status === "failed" && (
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      {label}
    </span>
  );
}

function isHighlighted(leadId: number, highlightLeadIds: number[]): boolean {
  return highlightLeadIds.includes(leadId);
}

function highlightRowClass(highlighted: boolean): string {
  return highlighted
    ? "bg-blue-50 motion-safe:animate-[lead-row-enter_1.2s_ease-out_forwards]"
    : "";
}

export default function LeadFeed({
  leads,
  isLoading,
  error,
  highlightLeadIds = [],
  onAddLead,
  now,
}: LeadFeedProps) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading leads">
        <span className="sr-only">Loading leads</span>
        <FeedSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <p className="mt-4 text-base font-medium text-gray-900">No leads yet</p>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          Submit your first prospect to see them appear here in real time.
        </p>
        {onAddLead && (
          <button
            type="button"
            onClick={onAddLead}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Submit first lead
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: card list */}
      <ul className="divide-y divide-gray-100 lg:hidden">
        {leads.map((lead) => {
          const highlighted = isHighlighted(lead.id, highlightLeadIds);
          return (
            <li
              key={lead.id}
              className={`px-4 py-4 transition-colors ${highlightRowClass(highlighted)}`}
            >
              <div className="flex items-start gap-3">
                <Avatar lead={lead} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatRelativeTime(lead.created_at, now)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-gray-600">{lead.email}</p>
                  <p className="text-sm text-gray-700">{lead.company}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <BudgetChip budget={lead.budget} />
                    <SyncBadge lead={lead} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-surface-muted/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Lead
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Budget
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sync
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Added
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {leads.map((lead) => {
              const highlighted = isHighlighted(lead.id, highlightLeadIds);
              return (
                <tr
                  key={lead.id}
                  className={`transition-colors hover:bg-gray-50/80 ${highlightRowClass(highlighted)}`}
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar lead={lead} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.first_name} {lead.last_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {lead.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {lead.company}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <BudgetChip budget={lead.budget} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <SyncBadge lead={lead} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400">
                    {formatRelativeTime(lead.created_at, now)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
