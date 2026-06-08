# Day 12 — Backend Deployment Preparation

## Overview

This document covers the backend production readiness changes made on Day 12. No actual deployment was performed. The goal was to harden settings, document all environment variables, and ensure the project is ready to deploy to any standard Django host.

---

## Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in all values before running locally or deploying.

### Core Django

| Variable | Required | Default | Description |
|---|---|---|---|
| `DJANGO_SECRET_KEY` | Yes (prod) | insecure fallback (dev only) | Django secret key — generate with `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | No | `False` | Set to `True` for local development only |
| `ALLOWED_HOSTS` | Yes (prod) | `localhost,127.0.0.1` | Comma-separated list of allowed hostnames |
| `CORS_ALLOWED_ORIGINS` | Yes (prod) | `http://localhost:5173` | Comma-separated list of allowed CORS origins |
| `CSRF_TRUSTED_ORIGINS` | Yes (prod) | `http://localhost:5173` | Comma-separated list of trusted CSRF origins (must include the frontend domain) |
| `FRONTEND_URL` | No | `http://localhost:5173` | Base URL of the frontend app |

### Database

Two options — use `DATABASE_URL` (preferred for production) or individual variables (preferred for local dev).

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | No | — | Full Postgres connection string, e.g. `postgresql://user:pass@host:5432/dbname`. Takes precedence over individual DB_* vars. |
| `DB_NAME` | No | — | Postgres database name (used if `DATABASE_URL` is not set) |
| `DB_USER` | No | — | Postgres user |
| `DB_PASSWORD` | No | — | Postgres password |
| `DB_HOST` | No | `localhost` | Postgres host |
| `DB_PORT` | No | `5432` | Postgres port |

### Google OAuth

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID — must be the same value used in the frontend |

### Gemini AI

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model to use for audit analysis |

### fal.ai Image Generation

| Variable | Required | Default | Description |
|---|---|---|---|
| `FAL_KEY` | Yes | — | fal.ai API key |
| `IMAGE_PROVIDER` | No | `fal` | Image provider (currently only `fal` is supported) |
| `FAL_TEXT_TO_IMAGE_MODEL` | No | `fal-ai/flux/schnell` | fal model for text-to-image generation |
| `FAL_KONTEXT_MODEL` | No | `fal-ai/flux-pro/kontext` | fal model for image editing (reserved for future use) |

### Billing / Payments

| Variable | Required | Default | Description |
|---|---|---|---|
| `PAYMENT_PROVIDER` | No | `mock` | Payment provider — `mock` for development, `polar` when real billing is enabled |
| `POLAR_ACCESS_TOKEN` | No | — | Polar API access token (required when `PAYMENT_PROVIDER=polar`) |
| `POLAR_WEBHOOK_SECRET` | No | — | Polar webhook signing secret |
| `POLAR_SERVER` | No | `sandbox` | Polar environment: `sandbox` or `production` |

---

## Production Settings Checklist

- [x] `DEBUG` reads from `DEBUG` env var, defaults to `False`
- [x] `SECRET_KEY` reads from `DJANGO_SECRET_KEY` env var; raises `RuntimeError` if missing in production
- [x] `ALLOWED_HOSTS` reads from `ALLOWED_HOSTS` env var
- [x] `CORS_ALLOWED_ORIGINS` reads from `CORS_ALLOWED_ORIGINS` env var
- [x] `CSRF_TRUSTED_ORIGINS` reads from `CSRF_TRUSTED_ORIGINS` env var
- [x] `FRONTEND_URL` reads from `FRONTEND_URL` env var
- [x] `DATABASE_URL` supported via `dj-database-url`; falls back to individual `DB_*` vars
- [x] `STATIC_ROOT` set to `backend/staticfiles/` for `collectstatic`
- [x] Production security headers enabled when `DEBUG=False`:
  - `SECURE_BROWSER_XSS_FILTER`
  - `SECURE_CONTENT_TYPE_NOSNIFF`
  - `X_FRAME_OPTIONS = DENY`
  - `SESSION_COOKIE_SECURE`
  - `CSRF_COOKIE_SECURE`
- [ ] `SECURE_SSL_REDIRECT` — enable after HTTPS is configured on the server
- [ ] `SECURE_HSTS_SECONDS` — enable after HTTPS and SSL_REDIRECT are confirmed working

---

## Database Notes

- Backend uses PostgreSQL exclusively (no SQLite).
- For local dev: set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` in `.env`.
- For production: prefer `DATABASE_URL` (e.g. from Railway, Render, Supabase, or any managed Postgres).
- `dj-database-url` parses `DATABASE_URL` and configures the connection with `conn_max_age=600` for connection pooling.
- Run `python manage.py migrate` after first deploy and after each new migration.

---

## Static / Media Storage Notes

- Static files: collected to `backend/staticfiles/` via `python manage.py collectstatic`.
- For production, serve `staticfiles/` via nginx, a CDN, or whitenoise (not added yet).
- Media files (audit product images uploaded by users): stored in `backend/media/` locally.
- **fal.ai generated images are stored as remote CDN URLs** — no local disk or cloud bucket needed for images yet.
- **Postponed**: Google Cloud Storage / Supabase Storage / S3 for uploaded audit product images. This is required before real production launch so that uploaded media survives server restarts and horizontal scaling.

---

## Health Check

```
GET /api/health/
```

- Returns `{"status": "ok", "service": "sellio-backend"}` — HTTP 200
- No authentication required
- Suitable for load balancer and uptime health checks

---

## Security Checklist

- [x] `backend/.env` excluded from git via `.gitignore`
- [x] `frontend/.env` excluded from git via `.gitignore`
- [x] No API keys hardcoded in source code
- [x] `FAL_KEY` — backend only, never exposed to frontend
- [x] `GEMINI_API_KEY` — backend only, never exposed to frontend
- [x] `DJANGO_SECRET_KEY` — backend only, raises error if missing in production
- [x] `GOOGLE_CLIENT_ID` — intentionally shared: backend validates tokens, frontend initiates OAuth flow
- [x] Production security headers applied when `DEBUG=False`
- [ ] HTTPS redirect — configure after TLS termination is set up on the host

---

## Packages Added

| Package | Version | Purpose |
|---|---|---|
| `dj-database-url` | 3.1.2 | Parse `DATABASE_URL` env var into Django `DATABASES` config |
| `gunicorn` | 26.0.0 | Production WSGI server to replace Django's development `runserver` |

---

## Commands to Run

### Local development

```bash
cd backend
python manage.py migrate
python manage.py runserver
```

### Production setup (on the server)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2
```

### Generate a new secret key

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## What Is Not Deployed Yet

- No hosting provider selected or configured
- No domain / DNS set up
- No HTTPS / TLS certificate
- No production database provisioned
- No CDN or object storage for media files
- No real Polar billing integration (still using mock provider)
- No CI/CD pipeline
- No environment secrets manager (e.g. Railway Variables, Render Env Groups)

---

---

## Frontend Deployment Preparation

### Frontend Environment Variables

Copy `frontend/.env.example` to `frontend/.env` for local development.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API URL — `http://127.0.0.1:8000/api` for local dev, production URL for prod |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth client ID — must match backend `GOOGLE_CLIENT_ID` |

In production, set these as environment variables in Vercel (not in a committed `.env` file).

### Vercel Deployment Checklist

- [ ] Set root directory to `frontend` in Vercel project settings
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Framework preset: **Vite** (auto-detected)
- [ ] Set `VITE_API_BASE_URL` to production backend URL in Vercel environment variables
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in Vercel environment variables
- [ ] SPA routing configured via `frontend/vercel.json` — all routes fall back to `index.html`
- [ ] Add production frontend domain to backend `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`
- [ ] Add production frontend domain to Google OAuth authorized JavaScript origins

### Route Checklist

All routes defined in `frontend/src/App.tsx`:

- [ ] `/` — Landing page
- [ ] `/login` — Login
- [ ] `/signup` — Signup
- [ ] `/pricing` — Public pricing
- [ ] `/dashboard` — Dashboard (protected)
- [ ] `/dashboard/new-audit` — New audit flow
- [ ] `/dashboard/audits` — Audits list
- [ ] `/dashboard/audits/:id` — Audit report
- [ ] `/dashboard/audits/:id/image-studio` — Image Studio per audit
- [ ] `/dashboard/billing` — Billing and credits
- [ ] `/dashboard/settings` — Account settings
- [ ] `/image-studio` — General Image Studio

### Build Checklist

- [x] `npm run build` — passes with no TypeScript errors
- [x] API base URL reads from `VITE_API_BASE_URL` env var with dev fallback
- [x] No API keys or secrets in frontend source code
- [x] No hardcoded production URLs in frontend source
- [x] Google OAuth client ID reads from `VITE_GOOGLE_CLIENT_ID` env var
- [x] `frontend/.env` excluded from git via `.gitignore`

### Production API URL Note

When deploying:

1. Deploy the backend first and get its production URL (e.g. `https://api.sellio.app/api`)
2. Set `VITE_API_BASE_URL=https://api.sellio.app/api` in Vercel environment variables
3. Add the production frontend URL (e.g. `https://sellio.app`) to backend:
   - `CORS_ALLOWED_ORIGINS`
   - `CSRF_TRUSTED_ORIGINS`
   - `ALLOWED_HOSTS`

---

## Future Production Tasks

1. **Real Polar integration** — set `PAYMENT_PROVIDER=polar`, configure `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_SERVER=production`
2. **Object storage** — add Google Cloud Storage or Supabase Storage for uploaded audit product images (`MEDIA_ROOT` replacement)
3. **Production database** — provision managed PostgreSQL (Railway, Supabase, Neon, or similar) and set `DATABASE_URL`
4. **Domain + HTTPS** — configure custom domain, TLS certificate, then enable `SECURE_SSL_REDIRECT` and `SECURE_HSTS_SECONDS` in settings
5. **Static files serving** — add whitenoise or configure nginx to serve `staticfiles/`
6. **CI/CD** — add GitHub Actions or Railway auto-deploy on push to `main`
7. **Logging** — add structured logging and error reporting (e.g. Sentry)
8. **Worker process** — if async tasks are added, set up Celery + Redis or use a background worker service
