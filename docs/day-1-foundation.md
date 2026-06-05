# Day 1 Foundation

## Project Goal

Sellio is an AI-powered Amazon listing generator. Sellers upload product images, and the platform automatically generates optimized Amazon titles, bullet points, and descriptions — saving hours of manual copywriting and improving listing quality.

## Stack

**Backend**
- Django 6 + Django REST Framework
- SimpleJWT (authentication)
- django-cors-headers
- python-dotenv
- PostgreSQL

**Frontend**
- React + Vite (TypeScript)
- TailwindCSS
- shadcn/ui (Day 2+)
- Framer Motion (Day 2+)

## MVP Flow

1. User registers or logs in → receives JWT access + refresh tokens
2. User uploads product images → backend stores and queues them
3. Backend generates Amazon-optimized listing (title, bullets, description)
4. User reviews and edits the listing
5. User copies or exports the final listing

## MVP Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Marketing landing page |
| Login | `/login` | Email + password login |
| Register | `/register` | New account creation |
| Dashboard | `/dashboard` | List of past listings |
| Upload | `/upload` | Upload product images |
| Listing | `/listing/:id` | View and edit generated listing |

## Day 1 Checklist

- [x] Django project initialized with `config/` layout
- [x] `settings.py` loads all config from `.env` via python-dotenv
- [x] PostgreSQL configured via environment variables
- [x] Apps registered: `rest_framework`, `corsheaders`, `accounts`, `audits`, `billing`, `images`
- [x] `CorsMiddleware` added above `CommonMiddleware`
- [x] CORS allowed for `http://localhost:5173`
- [x] `REST_FRAMEWORK` configured with `JWTAuthentication`
- [x] `.env.example` created (real `.env` excluded from git)
- [x] `.gitignore` created at project root with correct path-prefixed entries
- [x] Health check endpoint: `GET /api/health/`
- [x] `requirements.txt` reflects all installed packages
- [x] Frontend Vite + React + TypeScript scaffold running on port 5173

## Next Step: Day 2 — Landing Page

Build the public-facing landing page at `/` using React + TailwindCSS:
- Hero section with headline and CTA button
- Features section (3-column grid)
- How it works section (3-step flow)
- Pricing teaser section
- Footer with links
