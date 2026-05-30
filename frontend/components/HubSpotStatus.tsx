"use client";

import type { HubSpotStatus as HubSpotStatusType } from "@/lib/schemas";

interface HubSpotStatusProps {
  status: HubSpotStatusType | null;
  isLoading: boolean;
}

function StatusSkeleton() {
  return (
    <div
      className="inline-flex h-8 w-36 animate-pulse rounded-full bg-surface-muted"
      aria-hidden="true"
    />
  );
}

function CheckIcon({ className }: { className?: string }) {
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
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
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
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

export default function HubSpotStatus({
  status,
  isLoading,
}: HubSpotStatusProps) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading HubSpot status">
        <span className="sr-only">Loading HubSpot status</span>
        <StatusSkeleton />
      </div>
    );
  }

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted ring-1 ring-border">
        Status unavailable
      </span>
    );
  }

  const isConnected = status.configured;
  const lastSyncFailed = status.last_sync_success === false;

  const pillStyles = isConnected
    ? lastSyncFailed
      ? "bg-amber-50 text-amber-900 ring-amber-200/80"
      : "bg-emerald-50 text-emerald-800 ring-emerald-200/80"
    : "bg-red-50 text-red-800 ring-red-200/80";

  const label = isConnected
    ? lastSyncFailed
      ? "HubSpot Connected · sync issue"
      : "HubSpot Connected"
    : "HubSpot Disconnected";

  return (
    <div
      className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2"
      title={status.last_sync_error ?? undefined}
    >
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${pillStyles}`}
      >
        {isConnected && !lastSyncFailed ? (
          <CheckIcon className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <AlertIcon className="h-3.5 w-3.5 shrink-0" />
        )}
        {label}
      </span>
      {status.last_sync_error && (
        <span className="max-w-48 truncate text-xs text-red-600 sm:max-w-xs">
          {status.last_sync_error}
        </span>
      )}
    </div>
  );
}
