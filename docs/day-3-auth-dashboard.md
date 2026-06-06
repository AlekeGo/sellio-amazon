# Day 3 — Authentication Foundation

## Goal

Implement a clean JWT-based authentication system in the `accounts` app using Django, DRF, and SimpleJWT. This covers registration, login, profile management, token refresh, and a Google Sign-In foundation.

---

## Endpoints Implemented

| Method | URL | Auth Required | Description |
|--------|-----|---------------|-------------|
| POST | `/api/auth/register/` | No | Register a new user |
| POST | `/api/auth/login/` | No | Login with email + password |
| GET | `/api/auth/me/` | Yes (Bearer) | Get current user profile |
| PATCH | `/api/auth/me/` | Yes (Bearer) | Update full_name |
| POST | `/api/auth/token/refresh/` | No | Refresh access token |
| POST | `/api/auth/google/` | No | Sign in with Google ID token |
| GET | `/api/health/` | No | Health check (unchanged) |

---

## User Model Fields

| Field | Type | Notes |
|-------|------|-------|
| `email` | EmailField | Primary login identifier, unique |
| `full_name` | CharField | Required |
| `avatar_url` | URLField | Optional |
| `provider` | CharField | Optional — `google` or null |
| `google_id` | CharField | Optional |
| `is_active` | BooleanField | Default true |
| `is_staff` | BooleanField | Default false |
| `created_at` | DateTimeField | Auto |
| `updated_at` | DateTimeField | Auto |

---

## Environment Variables

```
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=sellio_amazon_db
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id-here
```

`GOOGLE_CLIENT_ID` is optional for local dev. The `/api/auth/google/` endpoint returns a clean 400 if it is missing.

---

## Google Sign-In Setup

### Prerequisites
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:5173` to **Authorised JavaScript origins**
4. Copy the Client ID

### Backend
Set `GOOGLE_CLIENT_ID` in `backend/.env`:
```
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
```

### Frontend
Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`:
```
VITE_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
```

Both values must be the same Client ID. If either is absent the Google button is disabled (backend returns 400, frontend shows a disabled placeholder) — the rest of the auth flow continues to work normally.

---

## Commands to Run

```bash
# Activate venv (Windows)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create migrations
python manage.py makemigrations accounts

# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run dev server
python manage.py runserver
```

---

## Manual Test Checklist

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "full_name": "Test User"}'
```
Expected: `201` with `user`, `access`, `refresh`.

### Duplicate email
Send the same register request again.
Expected: `400` with `Email already registered.`

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```
Expected: `200` with `user`, `access`, `refresh`.

### Wrong password
Expected: `400` with `Invalid credentials.`

### Get profile
```bash
curl http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer <access_token>"
```
Expected: `200` with user object.

### No token
```bash
curl http://localhost:8000/api/auth/me/
```
Expected: `401 Unauthorized`.

### Update profile
```bash
curl -X PATCH http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Updated Name"}'
```
Expected: `200` with updated user.

### Refresh token
```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<refresh_token>"}'
```
Expected: `200` with new `access` token.

### Google (no config)
```bash
curl -X POST http://localhost:8000/api/auth/google/ \
  -H "Content-Type: application/json" \
  -d '{"credential": "anything"}'
```
Expected: `400` with `Google Sign-In is not configured. Set GOOGLE_CLIENT_ID.`

### Health check (unchanged)
```bash
curl http://localhost:8000/api/health/
```
Expected: `200` with `{"status": "ok", "service": "sellio-backend"}`.

---

## Frontend Auth Flow

### Stack additions
- `axios` — API client with JWT interceptor
- `@react-oauth/google` — Google Sign-In component

### Environment variables (frontend)
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id   # optional
```

### Frontend routes added

| Route | Component | Protected |
|-------|-----------|-----------|
| `/login` | `LoginPage` | No |
| `/signup` | `SignupPage` | No |
| `/dashboard` | `DashboardPage` + `DashboardLayout` | Yes |
| `/dashboard/new-audit` | `NewAuditPage` | Yes |
| `/dashboard/results` | `ResultsPage` | Yes |
| `/dashboard/image-studio` | `ImageStudioPage` | Yes |
| `/dashboard/billing` | `BillingPage` | Yes |
| `/dashboard/settings` | `SettingsPage` | Yes |
| `/image-studio` | `ImageStudioPage` | Yes |

### Auth flow
1. App loads → `AuthProvider` checks `localStorage` for `access_token`
2. If token exists → `GET /api/auth/me/` to hydrate user state
3. Protected routes check `isAuthenticated`; if false → redirect to `/login`
4. Login/Signup/Google → stores `access_token` + `refresh_token` → redirect to `/dashboard`
5. Logout → clears tokens → redirect to `/`
6. 401 response from any protected endpoint → clears tokens + hard redirect to `/login`

### Key files created
- `src/lib/api.ts` — Axios client with JWT request interceptor + 401 handler
- `src/contexts/AuthContext.tsx` — `AuthProvider`, `useAuth` hook
- `src/components/ProtectedRoute.tsx` — layout route guard using `<Outlet />`
- `src/components/layout/DashboardLayout.tsx` — sidebar layout with mobile drawer
- `src/pages/SignupPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/BillingPage.tsx`
- `src/pages/ImageStudioPage.tsx`
- `src/pages/ResultsPage.tsx`
- `frontend/.env.example`

---

## Frontend Manual Test Checklist

### Auth
- [ ] Visit `/login` — form renders, Google placeholder shown (or real button if `VITE_GOOGLE_CLIENT_ID` set)
- [ ] Login with wrong credentials → error message shown inline
- [ ] Login with correct credentials → redirected to `/dashboard`
- [ ] Visit `/dashboard` while logged out → redirected to `/login`
- [ ] Visit `/signup` → create account → redirected to `/dashboard`
- [ ] Reload `/dashboard` — stay logged in (token persists in localStorage)
- [ ] Click Logout in sidebar → tokens cleared → redirected to `/`

### Dashboard
- [ ] `/dashboard` — welcome message shows user's first name
- [ ] Sidebar shows all nav items, active state correct on each route
- [ ] Mobile: hamburger button visible, sidebar slides in/out
- [ ] `/dashboard/new-audit` — two option cards visible, "Coming Day 4" buttons disabled
- [ ] `/dashboard/results` — empty state with CTA
- [ ] `/dashboard/image-studio` — 6 category cards visible
- [ ] `/dashboard/billing` — Free Trial plan + credit placeholders
- [ ] `/dashboard/settings` — email read-only, full name editable, save works
- [ ] `/image-studio` (from landing) → redirects to login if not authenticated

### Google Sign-In
- [ ] Open `/login` or `/signup` with `VITE_GOOGLE_CLIENT_ID` set — real Google button renders
- [ ] Click the Google button — Google account picker opens
- [ ] Select an account — request goes to `POST /api/auth/google/` and returns `user`, `access`, `refresh`
- [ ] After success — redirected to `/dashboard`
- [ ] Repeat login with same Google account — same user returned (no duplicate created)
- [ ] Open `/login` with `VITE_GOOGLE_CLIENT_ID` unset — disabled placeholder button shown, no error thrown
- [ ] Backend: `curl -X POST .../api/auth/google/ -d '{"credential":"bad"}'` → `400 Invalid Google token.`
- [ ] Backend with `GOOGLE_CLIENT_ID` unset: same curl → `400 Google Sign-In is not configured. Set GOOGLE_CLIENT_ID.`

### Build
- [ ] `npm run build` — passes with no TypeScript errors
