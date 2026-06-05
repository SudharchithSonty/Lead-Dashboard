"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import AnalyticsBadges from "@/components/AnalyticsBadges";
import HeroIllustration from "@/components/HeroIllustration";
import HubSpotStatus from "@/components/HubSpotStatus";
import LeadFeed from "@/components/LeadFeed";
import LeadForm from "@/components/LeadForm";
import SlideOver from "@/components/SlideOver";
import {
  createLead,
  fetchAnalytics,
  fetchHubSpotStatus,
  fetchLeads,
} from "@/lib/api";
import { ENDPOINTS } from "@/lib/config";
import {
  LeadSchema,
  type Analytics,
  type HubSpotStatus as HSStatus,
  type Lead,
  type LeadCreate,
} from "@/lib/schemas";

const HIGHLIGHT_DURATION_MS = 3000;

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [hubspotStatus, setHubspotStatus] = useState<HSStatus | null>(null);
  const [highlightLeadIds, setHighlightLeadIds] = useState<number[]>([]);

  const [now, setNow] = useState(() => Date.now());

  const [leadsLoading, setLeadsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [hsLoading, setHsLoading] = useState(true);

  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const eventSourceRef = useRef<EventSource | null>(null);
  const highlightTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const markLeadHighlighted = useCallback((leadId: number) => {
    setHighlightLeadIds((prev) =>
      prev.includes(leadId) ? prev : [...prev, leadId],
    );

    const existing = highlightTimersRef.current.get(leadId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      setHighlightLeadIds((prev) => prev.filter((id) => id !== leadId));
      highlightTimersRef.current.delete(leadId);
    }, HIGHLIGHT_DURATION_MS);

    highlightTimersRef.current.set(leadId, timer);
  }, []);

  useEffect(() => {
    const timers = highlightTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const data = await fetchLeads();
        if (!cancelled) {
          setLeads(data);
          setLeadsError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLeadsError(
            err instanceof Error ? err.message : "Failed to load leads",
          );
        }
      } finally {
        if (!cancelled) setLeadsLoading(false);
      }

      try {
        const a = await fetchAnalytics();
        if (!cancelled) setAnalytics(a);
      } catch {
        /* analytics failure is non-blocking */
      } finally {
        if (!cancelled) setAnalyticsLoading(false);
      }

      try {
        const s = await fetchHubSpotStatus();
        if (!cancelled) setHubspotStatus(s);
      } catch {
        /* hubspot status failure is non-blocking */
      } finally {
        if (!cancelled) setHsLoading(false);
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const es = new EventSource(ENDPOINTS.leadsStream);
    eventSourceRef.current = es;

    es.onmessage = (event: MessageEvent) => {
      try {
        const parsed: unknown = JSON.parse(event.data as string);
        const lead = LeadSchema.parse(parsed);
        setLeads((prev) => [lead, ...prev]);
        markLeadHighlighted(lead.id);
        void fetchAnalytics()
          .then(setAnalytics)
          .catch(() => {});
        void fetchHubSpotStatus()
          .then(setHubspotStatus)
          .catch(() => {});
      } catch {
        /* malformed SSE data -- ignore */
      }
    };

    return () => {
      es.close();
    };
  }, [markLeadHighlighted]);

  const handleOpenForm = useCallback(() => setIsFormOpen(true), []);
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

  async function handleSubmit(data: LeadCreate) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createLead(data);
      markLeadHighlighted(created.id);
      setIsFormOpen(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Submission failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-600/25">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight text-gray-900 sm:text-lg">
                  Lead Distribution Portal
                </h1>
                <p className="hidden text-xs text-muted sm:block">
                  Real-time CRM sync &amp; pipeline tracking
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              New Lead
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-4 top-0 -z-10 h-64 rounded-3xl bg-gradient-to-br from-blue-50/80 via-transparent to-indigo-50/50 sm:inset-x-6 lg:inset-x-8"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col items-center gap-6 lg:items-start">
              <div className="w-full max-w-xs lg:max-w-none">
                <HeroIllustration />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Lead Distribution
                  <span className="block text-blue-600">Portal</span>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  Capture prospective client details, sync them to HubSpot CRM in
                  real time, and track your pipeline from a single dashboard.
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-8 lg:col-span-9">
            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Pipeline Overview
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">
                    Live metrics from your lead database
                  </p>
                </div>
                <HubSpotStatus
                  status={hubspotStatus}
                  isLoading={hsLoading}
                />
              </div>
              <AnalyticsBadges
                analytics={analytics}
                isLoading={analyticsLoading}
              />
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Live Lead Feed
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">
                    Updates instantly via server-sent events
                  </p>
                </div>
                {leads.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/80">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                )}
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                <LeadFeed
                  leads={leads}
                  isLoading={leadsLoading}
                  error={leadsError}
                  highlightLeadIds={highlightLeadIds}
                  onAddLead={handleOpenForm}
                  now={now}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <SlideOver
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title="Submit New Lead"
      >
        <p className="mb-6 text-sm text-muted">
          Fill in the prospect details below. The lead will be synced to HubSpot
          automatically.
        </p>
        <LeadForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        {submitError && (
          <p className="mt-3 text-sm text-red-600">{submitError}</p>
        )}
      </SlideOver>
    </div>
  );
}
