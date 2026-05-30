# Lead Distribution Portal

A lightweight single-page application for ingesting prospective client leads, tracking them in a real-time dashboard, and synchronizing them to a HubSpot CRM sandbox via the HubSpot API.

## Architecture

```text
[Web Form] → [FastAPI Backend] → [HubSpot CRM API]
                  │
                  └──(SSE)──→ [Internal Dashboard]
```

- **Backend**: Python 3.13 / FastAPI / SQLAlchemy / SQLite
- **Frontend**: Next.js / React / TypeScript / Tailwind CSS
- **Integration**: HubSpot CRM v3 Contacts API

## Prerequisites

- Python 3.13+
- Node.js 20+
- npm 10+

## Quick Start

```bash
# 1. Clone the repo and enter the directory
cd Dashboard

# 2. Copy environment template and fill in HubSpot credentials
cp .env.example .env
# Edit .env with your HUBSPOT_ACCESS_TOKEN

# 3. Install everything (creates .venv + npm install)
make setup

# 4. Run both backend and frontend
make dev
```

The backend runs at `http://localhost:8000` and the frontend at `http://localhost:3000`.

## Available Make Targets

| Target            | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `make setup`      | Create Python venv, install backend + frontend deps   |
| `make dev`        | Start backend (port 8000) and frontend (port 3000)    |
| `make backend-dev`| Start only the FastAPI backend                        |
| `make frontend-dev`| Start only the Next.js frontend                      |
| `make test`       | Run all backend and frontend tests                    |
| `make lint`       | Run ruff (backend) and eslint (frontend)              |
| `make type-check` | Run mypy (backend) and tsc (frontend)                 |
| `make verify`     | Full verification: lint + type-check + tests + audit  |
| `make clean`      | Remove venv, node_modules, .next, and DB files        |

## Running Tests

```bash
# All tests
make test

# Backend only
make test-backend

# Frontend only
make test-frontend
```

## Environment Variables

See `.env.example` for all available configuration. Key variables:

- `HUBSPOT_ACCESS_TOKEN` - Your HubSpot private app access token
- `HUBSPOT_PORTAL_ID` - Your HubSpot portal ID
- `CORS_ORIGIN` - Allowed frontend origin (default: `http://localhost:3000`)
- `NEXT_PUBLIC_API_URL` - Backend URL for the frontend (default: `http://localhost:8000`)

## HubSpot Setup

1. Create a HubSpot Developer Sandbox account
2. Create a Private App with `crm.objects.contacts.write` and `crm.objects.contacts.read` scopes
3. Copy the access token to your `.env` file

## Deployment

For the HubSpot-hosted dashboard link:

1. Deploy the FastAPI backend to a public URL
2. Set `NEXT_PUBLIC_API_URL` and `BACKEND_PUBLIC_URL` to point to the deployed backend
3. Build the frontend: `cd frontend && npm run build`
4. The built output can be served from HubSpot or any static host

>>>>>>> 5ed1a4c (Initial commit: Lead Distribution Portal (backend + frontend))
