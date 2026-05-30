# Design Thinking Prompts

Prompts that reflect the reasoning behind each architectural and implementation decision in this project. Use these as a reference for future sessions, code reviews, or onboarding.

---

## 1. Architecture & Data Flow

**Why is the backend the single point of truth for HubSpot sync, not the frontend?**

> The assignment flow is: Form -> Backend -> HubSpot CRM, with the backend also pushing real-time events to the dashboard. If the frontend called HubSpot directly, we'd lose centralized validation, retry logic, error tracking, and observability. The backend mediates all CRM writes so that every lead has a local audit trail before it ever touches an external API. This also means the dashboard can show sync status without the browser needing CRM credentials.

**Why SSE instead of WebSockets or polling?**

> The data flow is strictly one-directional: backend pushes new lead events to the dashboard. WebSockets add bidirectional complexity we don't need. Polling wastes bandwidth and adds latency. SSE is the simplest protocol that solves the problem -- one persistent HTTP connection, automatic reconnection built into the browser EventSource API, and trivially testable. We chose the simplest tool that handles the known requirement.

**Why SQLite with NullPool instead of PostgreSQL?**

> The assignment is a lightweight portal meant to run anywhere with minimal setup. SQLite eliminates the need for a database server, making `make setup && make dev` a zero-dependency workflow. `NullPool` is mandatory because SQLite doesn't support true connection pooling -- reusing connections across threads causes "database is locked" errors. If this needed to scale to multiple backend instances, we'd swap to PostgreSQL with `QueuePool`, but that's a different constraint than "anyone can run this on their machine."

---

## 2. Boundary Validation

**Why validate on both sides (Pydantic backend + Zod frontend)?**

> The frontend Zod validation gives instant user feedback without a round-trip. The backend Pydantic validation is the security boundary -- it's the only thing standing between user input and the database/HubSpot API. Never trust client-side validation alone; a `curl` request bypasses it entirely. The two schemas mirror each other but serve different purposes: UX vs. security.

**Why reject free email domains at the schema level?**

> The form collects "Corporate Email Address." Allowing gmail.com or yahoo.com would violate the assignment's intent and pollute the CRM with non-business contacts. Enforcing this at the Pydantic validator means it's impossible to bypass -- not in the form, not via the API, not in tests unless explicitly mocking. The `frozenset` of blocked domains is a constant, not scattered string comparisons.

**Why response DTOs instead of returning the ORM model directly?**

> The `Lead` SQLAlchemy model has internal fields (like the raw relationship to the database session) that should never leak to clients. `LeadResponse` is a Pydantic model that explicitly declares which fields are exposed and in what shape. This is a security boundary: if we add an internal `notes` field later, it won't accidentally appear in the API response. It also decouples the API contract from the database schema.

---

## 3. Error Handling & Resilience

**Why does lead creation succeed even when HubSpot sync fails?**

> The lead is the user's data. Losing it because a third-party API timed out is unacceptable. The design is: persist locally first (the lead always has a row in the database), then attempt sync. If sync fails, the lead's `sync_status` is set to `FAILED` with the error message preserved. The dashboard shows this status, and a future retry mechanism can pick up failed leads. This is graceful degradation -- the core operation (capturing the lead) never fails because of an optional downstream.

**Why catch narrow exception types instead of `except Exception`?**

> `except Exception` hides bugs. If the HubSpot client has a typo that raises `AttributeError`, catching `Exception` would silently swallow it and mark it as a "sync failure" when it's actually a code bug. By catching `httpx.TimeoutException`, `httpx.HTTPStatusError`, and `httpx.HTTPError` separately, we log the right context for each failure mode and let genuine bugs crash loudly.

**Why structured logging with `extra={}` instead of f-string messages?**

> Structured logs are machine-parseable. When debugging at 3 AM, `grep` on `lead_id=42` is faster than parsing prose. The `extra` dict also feeds into log aggregation tools (Datadog, ELK) as searchable fields. This is the difference between "I can find the problem" and "I have to read every log line."

---

## 4. Frontend Design Decisions

**Why is every component tested with explicit loading/error/empty states?**

> A component that doesn't handle all three states will silently break in production. The tests enforce this contract: `LeadFeed` must render "Loading leads..." when `isLoading=true`, an error message when `error` is set, and "No leads submitted yet" when the list is empty. These tests are cheap to write and prevent the most common UX bugs.

**Why Zod `.parse()` on every API response, not just `as Lead[]`?**

> TypeScript's type system is erased at runtime. `as Lead[]` tells the compiler "trust me" but doesn't validate the actual data. If the backend changes a field from `string` to `number`, the TypeScript cast won't catch it -- but `Zod.parse()` will throw immediately with a clear error. This is the network boundary: the one place where we validate that external data matches our expectations before it enters the React state tree.

**Why a separate `lib/config.ts` instead of inline URLs?**

> Hardcoded URLs are the number one cause of "works on my machine, breaks in production." `NEXT_PUBLIC_API_URL` is set once in `.env` and consumed through `config.ts`. When deploying the frontend to HubSpot, the only change is the environment variable. No code changes, no find-and-replace, no missed URLs.

---

## 5. Testing Philosophy

**Why TDD (tests before code)?**

> Writing the test first forces you to define the behavior before you write the implementation. The test for "blank first name returns 422" existed before the Pydantic validator did. This means the validator was written to satisfy a concrete requirement, not imagined in the abstract. It also means we never ship code that "probably works but isn't tested" -- the test is the proof.

**Why mock HubSpot in integration tests but not the database?**

> The database is ours -- we control it, it's deterministic, and it's fast (SQLite in-memory via `NullPool`). Testing against the real database catches ORM bugs, migration issues, and query errors. HubSpot is external, slow, rate-limited, and non-deterministic. Mocking it isolates our tests from third-party flakiness while still verifying that we send the right headers, handle timeouts, and record sync status correctly.

**Why 55 tests for a "lightweight" portal?**

> The assignment is lightweight in scope, not in quality. 32 backend tests cover: validation (15 edge cases), ingestion (6 scenarios including sync failure), analytics (3 computation cases), HubSpot client (5 error modes), and health check (1). 23 frontend tests cover: form validation (4), lead feed states (5), analytics badges (4), HubSpot status (4), and Zod schema validation (6). Each test is a contract. Removing any one of them means a behavior is unverified.

---

## 6. Developer Experience

**Why a Makefile instead of a README with 12 commands?**

> `make setup && make dev` is two commands. The README explains what each target does, but the Makefile is the executable documentation. It also encodes the Python 3.13 requirement, the venv path, and the correct order of operations. A new developer doesn't need to read the README to get the app running -- they need to run `make setup`.

**Why `.env.example` instead of committed `.env`?**

> `.env` contains secrets (HubSpot access token). Committing it to git is a security violation. `.env.example` is the template: it shows every variable the app needs, with placeholder values, and is safe to commit. The developer copies it, fills in their credentials, and `.gitignore` ensures the real `.env` never touches the repository.

---

## 7. Reusable Prompts for Future Work

Use these when continuing development on this project:

### Adding a new API endpoint

> "Add a new endpoint at `[path]` that does `[behavior]`. Write failing tests first in `backend/tests/test_[name].py` covering: valid input, missing fields, null fields, and edge cases. Then implement the route, schema, and any service logic. Run `make verify` before considering it done."

### Adding a new frontend component

> "Create a new component `[Name]` in `frontend/components/`. Write failing Vitest tests first in `frontend/__tests__/[Name].test.tsx` covering: loading state, error state, empty state, and populated state. Then implement the component. Validate any API data with Zod at the boundary in `lib/api.ts`."

### Fixing a bug

> "Apply the Fix-It-Thrice protocol: (1) Write a test that reproduces the exact failure. (2) Fix the root cause structurally, not the symptom. (3) Verify the test passes and run `make verify` to confirm no regressions."

### Adding HubSpot retry logic

> "Add retry with exponential backoff to `sync_contact()` in `backend/app/services/hubspot.py` for transient failures (timeout, 502, 503, 429). Use `tenacity` with `stop_after_attempt(3)` and `wait_exponential(min=1, max=10)`. Never retry non-idempotent operations blindly -- HubSpot contact creation may need an idempotency check (search by email before create)."

### Deploying for demo

> "Deploy the FastAPI backend to `[host]`. Set `NEXT_PUBLIC_API_URL` to the deployed URL. Set `CORS_ORIGIN` to the HubSpot-hosted page URL. Build the frontend with `npm run build`. Upload the built output to HubSpot for hosting. Share the HubSpot dashboard URL as the deliverable."
