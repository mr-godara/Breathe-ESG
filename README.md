# Breathe ESG

Emissions ingestion and analyst review platform. Ingests source data (SAP exports, utility bills, travel records), normalizes to a canonical emissions model, and runs analyst review workflows with full audit trail.

## Why this exists

Enterprise sustainability teams receive emissions data from dozens of source systems in inconsistent formats. This platform solves the "last mile" between raw exports and auditable, review-ready emission records.

Core invariant: **raw inputs are preserved exactly as received.** Normalization produces a separate canonical record. Analysts review normalized data but can always trace back to the source evidence.

## Architecture

```
CSV/API → Raw Record → Normalized Emission → Review Queue → Audit Log
              ↑                  ↑                 ↑
         preserved as-is    canonical units    append-only
```

- **Backend**: Django + DRF, SQLite (dev) / PostgreSQL (prod)
- **Frontend**: React 19, Vite 8, Tailwind CSS 4
- **Data flow**: Source → `RawRecord` → `EmissionRecord` → `ReviewAction` + `AuditLog`
- **Multi-tenancy**: Explicit `organization` FK on every queryable entity

## Ingestion sources

| Source | Format | Normalization |
|--------|--------|---------------|
| SAP MM | CSV with German headers (`Belegdatum`, `Werk`, `Menge`, `Einheit`) | Mixed units → kg/L/kWh, locale decimals, plant code mapping |
| Utility | CSV with billing periods and meter IDs | kWh/MWh → kWh, period validation |
| Travel | Mocked Concur/Navan-style API | Airport codes, distance estimation, class mapping |

Suspicious records (missing fields, implausible values, same-origin trips) are flagged but not rejected — analysts decide.

## Setup

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env                              # edit as needed
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env                              # set VITE_API_BASE_URL
npm run dev                                       # localhost:5173
```

## API

All endpoints are tenant-scoped via `organization_id`.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ingestion/sap/upload/` | Upload SAP CSV |
| `POST` | `/ingestion/utility/upload/` | Upload utility CSV |
| `GET` | `/reviews/queue/` | List records for review (filterable) |
| `POST` | `/reviews/action/` | Approve or reject a record |
| `GET` | `/reviews/history/<id>/` | Review action history for a record |
| `GET` | `/records/detail/<id>/` | Full record detail (raw + normalized + audit) |

## Data model

```
Organization
  └─ DataSource
       └─ IngestionBatch
            └─ RawRecord (raw_payload, ingest_status, suspicious_flags)
                 └─ EmissionRecord (scope, kgCO2e, review_status)
                      ├─ ReviewAction (approve/reject, analyst, reason)
                      └─ AuditLog (event, actor, timestamp)
```

Key design decisions:
- Raw/normalized separation for reprocessing and audit evidence
- Approval locks the record and snapshots data
- Suspicious flags on both raw and normalized layers
- Append-only review and audit models

## Project structure

```
backend/
  api/              # DRF views (ingestion, review workflow)
  apps/             # Django apps (ingestion, emissions, reviews)
  services/         # Business logic (parsers, normalization, validation)
  config/           # Django settings, WSGI
  utils/            # Shared utilities
frontend/
  src/
    components/     # DataTable, DetailModal, FiltersBar, Layout, etc.
    pages/          # DashboardPage, UploadPage, ReviewQueuePage
    services/       # Axios API client
    hooks/          # useAsyncState
```

## Deployment

Backend on Render, frontend on Vercel. Config in [`render.yaml`](render.yaml) and [`vercel.json`](vercel.json).

See [DEPLOYMENT.md](DEPLOYMENT.md) for full checklist.

## Scope boundaries

This is a prototype. It intentionally excludes:
- Authentication / RBAC (analyst identity is a name string)
- Async job processing (ingestion is synchronous)
- OCR/PDF extraction (CSV-only)
- ML anomaly detection (deterministic rules only)
- Emission factor versioning

See [TRADEOFFS.md](TRADEOFFS.md) for rationale on each.

## Docs

- [MODEL.md](MODEL.md) — Data model and indexing strategy
- [DECISIONS.md](DECISIONS.md) — Design decisions and assumptions
- [TRADEOFFS.md](TRADEOFFS.md) — What was excluded and why
- [SOURCES.md](SOURCES.md) — Source system research and data assumptions
- [DEPLOYMENT.md](DEPLOYMENT.md) — Render + Vercel deployment guide
