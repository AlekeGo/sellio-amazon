# Sellio

AI-powered Amazon listing audit and optimization tool for sellers.

Sellio analyzes product listings, generates improvement recommendations via Gemini AI, and produces premium Amazon-ready product visuals via fal.ai.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router v7, Tailwind CSS, Framer Motion |
| Backend | Django 6, Django REST Framework, PostgreSQL |
| AI (audit) | Google Gemini (gemini-2.5-flash) |
| AI (images) | fal.ai (flux/schnell) |
| Auth | JWT + Google OAuth 2.0 |
| Billing | Mock provider (Polar planned) |

---

## Current MVP Features

- Landing page and public pricing page
- Email/password signup and login
- Google Sign-In (OAuth)
- New Audit flow — Amazon URL or product photo upload
- AI-powered audit report with listing score and recommendations
- Image Studio — AI-generated Amazon product images per audit
- Generated images gallery with preview, download, delete, regenerate
- Billing page — plan overview, credit balance, payment history
- Dashboard with credit cards and recent audit list
- Settings page

---

## Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your actual values
python manage.py migrate
python manage.py runserver
```

Backend runs on `http://127.0.0.1:8000`.

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set VITE_GOOGLE_CLIENT_ID
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## Environment Variables

### Backend — `backend/.env`

Copy `backend/.env.example` and fill in all values.

| Variable | Required | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | Yes (prod) | Django secret key — generate with `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | No | `True` for local dev, omit or `False` for production |
| `ALLOWED_HOSTS` | Yes (prod) | Comma-separated allowed hostnames |
| `CORS_ALLOWED_ORIGINS` | Yes (prod) | Comma-separated allowed CORS origins |
| `CSRF_TRUSTED_ORIGINS` | Yes (prod) | Comma-separated trusted CSRF origins |
| `DATABASE_URL` | No | Full Postgres connection string (preferred in production) |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | No | Individual DB vars (used if `DATABASE_URL` not set) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `FAL_KEY` | Yes | fal.ai API key |
| `PAYMENT_PROVIDER` | No | `mock` (default) or `polar` |

### Frontend — `frontend/.env`

Copy `frontend/.env.example` and fill in values.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API URL — `http://127.0.0.1:8000/api` for local dev, production URL for prod |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth client ID — must match backend `GOOGLE_CLIENT_ID` |

---

## How to Run Locally

1. Start backend: `cd backend && python manage.py runserver`
2. Start frontend: `cd frontend && npm run dev`
3. Open `http://localhost:5173`

---

## Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/signup` | Signup |
| `/pricing` | Public pricing page |
| `/dashboard` | Dashboard (protected) |
| `/dashboard/new-audit` | Create new audit |
| `/dashboard/audits` | All audits list |
| `/dashboard/audits/:id` | Audit report |
| `/dashboard/audits/:id/image-studio` | Image Studio for audit |
| `/dashboard/billing` | Billing and credits |
| `/dashboard/settings` | Account settings |

---

## Current Limitations

- Payment is mock only — Polar integration is planned but not connected
- Uploaded media files (audit product photos) are stored locally, not in cloud storage
- No CI/CD configured
- Not deployed to production yet — Day 12 is preparation only

---

## Deployment Preparation (Day 12)

### Backend

Deploy as a Django/Gunicorn WSGI app (Railway, Render, Fly.io, or any Postgres-capable host).

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2
```

Set all required env vars from `backend/.env.example`. See `docs/day-12-deployment-prep.md` for the full backend checklist.

### Frontend

Deploy on Vercel (recommended) from the `frontend/` directory.

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Framework preset | Vite |

Required Vercel env vars:
- `VITE_API_BASE_URL` — set to your production backend URL
- `VITE_GOOGLE_CLIENT_ID` — your Google OAuth client ID

SPA routing is handled by `frontend/vercel.json`.

---

## Security Notes

- `backend/.env` and `frontend/.env` are excluded from git
- No API keys are hardcoded in frontend code
- Backend secrets (`GEMINI_API_KEY`, `FAL_KEY`, `DJANGO_SECRET_KEY`) are never sent to the frontend
- `GOOGLE_CLIENT_ID` is intentionally public — backend validates tokens, frontend initiates the OAuth flow
