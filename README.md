# ESG Emissions Ingestion Platform (Prototype)

## Overview
Prototype ESG ingestion and review platform focused on traceable raw ingestion, deterministic normalization, and analyst review workflows. The system preserves raw inputs, normalizes emissions into a canonical model, and maintains an audit trail for approvals and rejections.

## Architecture Summary
- **Backend**: Django + DRF, PostgreSQL, service-layer ingestion/normalization/validation
- **Frontend**: React + Vite + Tailwind
- **Workflow**: Source data -> Raw records -> Normalized emissions -> Review + Audit

## Tech Stack
- Django
- Django REST Framework
- PostgreSQL
- Pandas
- React
- Vite
- Tailwind CSS
- Axios

## Setup
### Backend
1. Create a Python environment and install dependencies.
2. Configure env vars from [backend/.env.example](backend/.env.example).
3. Run migrations:
   ```bash
   python backend/manage.py migrate
   ```
4. Start server:
   ```bash
   python backend/manage.py runserver
   ```

### Frontend
1. Install dependencies in `frontend`.
2. Set `VITE_API_BASE_URL` in [frontend/.env.example](frontend/.env.example).
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Deployment URLs
- Backend (Render): `https://your-backend.onrender.com`
- Frontend (Vercel): `https://your-frontend.vercel.app`

## Ingestion Workflow
- **SAP CSV**: Upload German-header CSV export, normalize units, map plant codes.
- **Utility CSV**: Upload billing-period usage CSV, normalize to kWh.
- **Travel API**: Sync mocked Concur/Navan-style trips.

## Folder Structure
```
backend/
  api/
  apps/
    ingestion/
    emissions/
    reviews/
  config/
  services/
    parsers/
    normalization/
    validation/
  utils/
frontend/
  src/
    components/
    pages/
    services/
    hooks/
```

## Screenshots (placeholders)
- `docs/screenshots/dashboard.png`
- `docs/screenshots/review-queue.png`
- `docs/screenshots/record-detail.png`

## Documentation
- [MODEL.md](MODEL.md)
- [DECISIONS.md](DECISIONS.md)
- [TRADEOFFS.md](TRADEOFFS.md)
- [SOURCES.md](SOURCES.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)

## Reviewer Login Credentials
This prototype does not implement authentication. Analyst identity is simulated via name strings in review actions.
