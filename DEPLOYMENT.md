# Deployment Guide

## Architecture
- Backend: Django + Gunicorn on Render, PostgreSQL managed by Render.
- Frontend: React + Vite on Vercel.
- API routing: Frontend calls backend via `VITE_API_BASE_URL`.

## Backend (Render)
1. Create a new Web Service from this repository.
2. Set Root Directory to `backend`.
3. Set build command: `pip install -r requirements.txt`.
4. Set start command: `bash start.sh`.
5. Add env vars from [backend/.env.example](backend/.env.example).
6. Add a Render PostgreSQL database and map `DATABASE_URL`.
7. Deploy. Migrations run automatically in `start.sh`.

## Frontend (Vercel)
1. Create a new Vercel project from the repository.
2. Set root directory to `frontend`.
3. Ensure build command: `npm run build` and output: `dist`.
4. Set `VITE_API_BASE_URL` from [frontend/.env.example](frontend/.env.example).

## Checklist
- Backend settings set to production.
- `DJANGO_SECRET_KEY` set to a strong value.
- `DJANGO_ALLOWED_HOSTS` includes Render domain.
- `CORS_ALLOWED_ORIGINS` includes Vercel domain.
- Database migrations applied.
- Frontend build succeeds and points to correct API base URL.
