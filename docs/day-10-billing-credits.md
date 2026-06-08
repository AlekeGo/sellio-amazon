# Day 10 — Billing & Credits Foundation

## Goal

Implement provider-agnostic billing and credits system without connecting a real payment provider. All checkout flows use a mock provider. Polar will be wired in a future day.

---

## Plan Catalog

| Key | Name | Price | Mode | Audit Credits | Upgrade Credits |
|---|---|---|---|---|---|
| `free_trial` | Free Trial | $0 | free | 1 | 0 |
| `full_upgrade` | Full Listing Upgrade | $29 | payment | 0 | 1 |
| `launch` | Launch | $19/mo | subscription | 3 | 1 |
| `pro` | Pro | $39/mo | subscription | 7 | 3 |
| `growth` | Growth | $59/mo | subscription | 10 | 5 |
| `agency` | Agency | $149/mo | subscription | 25 | 15 |
| `extra_upgrade` | Extra Full Upgrade | $19 | payment | 0 | 1 |
| `extra_audit_pack` | Extra Audit Pack | $9 | payment | 1 | 0 |

Defined in `billing/plans.py`.

---

## Models

**`UserBillingProfile`** — OneToOne with User. Tracks current plan, subscription status, provider, provider IDs.

**`CreditBalance`** — OneToOne with User. Tracks audit_credits, full_upgrade_credits, image_generation_credits.

**`CreditTransaction`** — ForeignKey to User. Logs every grant/consume/refund/adjustment per credit type with reason and metadata.

**`Payment`** — ForeignKey to User. Tracks each checkout attempt: plan_key, amount, status (pending/completed/failed/cancelled), mode, and a `credits_granted` flag to prevent double-granting.

---

## Credit Logic

### New User Defaults
Every newly registered user automatically gets:
- `current_plan = free_trial`
- `audit_credits = 1`
- `full_upgrade_credits = 0`
- `image_generation_credits = 0`

Triggered via Django signal in `billing/signals.py`.

### Audit Submit Credit Check
On `POST /api/audits/{id}/submit/`:
- If the audit already has a result → no credit consumed (safe re-submit).
- If no result → check `audit_credits >= 1`.
- If no credits → `402 Payment Required` with message: *"You have no audit credits left. Choose a plan to continue."*
- If credits available → consume 1 audit credit, then run Gemini analysis.

### Regenerate — No Credit Charge
`POST /api/audits/{id}/regenerate/` does not consume credits (it re-runs for an existing audit).

### Image Generation
Credit enforcement not strictly enforced in Day 10. `has_credit` and `consume_credit` helpers are ready for future integration. fal.ai generation is unchanged.

---

## Mock Checkout Flow

1. Frontend calls `POST /api/billing/create-checkout-session/` with `{ "plan_key": "pro" }`.
2. Backend creates a `Payment` record with `status=pending`.
3. Returns `checkout_url`: `http://localhost:5173/dashboard/billing?checkout=mock&plan=pro&payment_id=<id>`
4. **No credits granted yet.**
5. For local testing, call `POST /api/billing/mock-complete-payment/` with `{ "payment_id": <id> }`.
6. Backend marks payment `completed`, grants credits, and for subscriptions updates `current_plan`.
7. `credits_granted` flag is set to prevent duplicate granting.

---

## Future Polar Integration

When ready to connect Polar:

1. Set `PAYMENT_PROVIDER=polar` in env.
2. Fill `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_SERVER`.
3. Add a `billing/providers/polar.py` that implements the same interface as mock:
   - `create_checkout_session(user, plan_key)` → returns Polar checkout URL
   - `handle_webhook(payload, signature)` → verifies signature, calls `grant_plan_credits`
4. Add Polar webhook endpoint to `billing/urls.py`.
5. `MockCompletePaymentView` is gated on `PAYMENT_PROVIDER=mock` so it will automatically disable in production.

---

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/billing/plans/` | List all plans |
| GET | `/api/billing/me/` | Current user billing status + credit balance |
| POST | `/api/billing/create-checkout-session/` | Create pending payment, return mock checkout URL |
| POST | `/api/billing/mock-complete-payment/` | (Dev only) Complete payment and grant credits |

---

## Manual Test Checklist

---

## Frontend Integration (Day 10)

### Files Changed

| File | Change |
|---|---|
| `frontend/src/types/billing.ts` | New — TypeScript types for all billing models |
| `frontend/src/lib/billingApi.ts` | New — 4 API methods: `getBillingPlans`, `getMyBilling`, `createCheckoutSession`, `mockCompletePayment` |
| `frontend/src/pages/BillingPage.tsx` | Full rewrite — complete billing dashboard |
| `frontend/src/pages/DashboardPage.tsx` | Live billing data in stats grid, Manage Billing CTA |
| `frontend/src/pages/NewAuditPage.tsx` | Credit exhaustion paywall block on 402 error |
| `frontend/src/components/sections/PricingSection.tsx` | Auth-aware CTAs — logged-in users get mock checkout |

### API Methods Added

```ts
getBillingPlans()           // GET /api/billing/plans/
getMyBilling()              // GET /api/billing/me/
createCheckoutSession(key)  // POST /api/billing/create-checkout-session/
mockCompletePayment(id)     // POST /api/billing/mock-complete-payment/
```

### UI Pages Updated

**`/dashboard/billing`**
- Current plan glass card with subscription status badge
- 3 credit cards: audit credits, full upgrade credits, image generation credits
- Upgrade plans grid (launch/pro/growth/agency) with current-plan marker and highlighted Pro
- Add-ons section (extra_upgrade $19, extra_audit_pack $9)
- Recent transactions list with type/credit type/amount/reason
- Recent payments list with status, amount, date
- Mock checkout modal with plan details, Polar preview note, Complete Test Payment button
- URL state handling: `?checkout=success`, `?checkout=cancelled`, `?checkout=mock&plan=X&payment_id=Y`
- Auto-opens checkout when `?plan=X` param is present
- Loading skeletons and error states

**`/dashboard`**
- Stats grid now pulls live billing data (current plan, audit credits, full upgrade credits)
- CTA changed from "View Pricing" to "Manage Billing" → `/dashboard/billing`

**`/dashboard/new-audit` (Step 3)**
- Detects HTTP 402 from audit submit
- Shows premium paywall block: "You've used your free audit"
- Buttons: View Plans → `/dashboard/billing`, Manage Billing → `/dashboard/billing`

**`/pricing` and Landing Page Pricing Section**
- Logged-in + paid plan → navigates to `/dashboard/billing?plan=<key>`
- Logged-in + free trial → navigates to `/dashboard/new-audit`
- Not logged in + free → navigates to `/signup`
- Not logged in + paid → navigates to `/login`
- Add-ons have Buy buttons with same auth-aware routing

### Mock Checkout UX Flow

1. User clicks any paid plan button (anywhere)
2. If logged in → navigated to `/dashboard/billing?plan=pro`
3. BillingPage calls `createCheckoutSession('pro')` automatically
4. Mock checkout modal appears with plan details, price, features
5. Info note: "Polar checkout will be connected before launch"
6. User clicks "Complete Test Payment" → `mockCompletePayment(paymentId)`
7. Credits granted, billing data refreshed, success banner shown
8. URL becomes `/dashboard/billing?checkout=success`

### Commands to Run

```bash
# Start backend
cd backend && python manage.py runserver

# Start frontend (new terminal)
cd frontend && npm run dev

# Verify build passes
cd frontend && npm run build
```

---

## Manual Test Checklist — Backend

```
# 1. Server starts
cd backend
python manage.py runserver

# 2. Register a new user → billing profile + credit balance auto-created
POST /api/auth/register/
{ "email": "test@test.com", "password": "pass123", "full_name": "Test User" }

# 3. Get billing status
GET /api/billing/me/
# Expect: audit_credits=1, full_upgrade_credits=0, current_plan=free_trial

# 4. Get plan catalog
GET /api/billing/plans/
# Expect: list of 8 plans

# 5. Create checkout session
POST /api/billing/create-checkout-session/
{ "plan_key": "pro" }
# Expect: payment_id + checkout_url + message

# 6. Mock-complete the payment
POST /api/billing/mock-complete-payment/
{ "payment_id": <id from step 5> }
# Expect: credits granted, balance shows audit_credits=7, full_upgrade_credits=3

# 7. Check billing me again
GET /api/billing/me/
# Expect: current_plan=pro, updated credits, transaction history

# 8. Submit an audit (with credits)
POST /api/audits/{id}/submit/
# Expect: Gemini runs, audit_credits decremented by 1

# 9. Submit same audit again (already has result)
POST /api/audits/{id}/submit/ will be blocked (status=completed)
# The status gate prevents re-submit

# 10. Run out of credits test (optional)
# Use up all credits, then try to submit a new audit
# Expect: 402 with "You have no audit credits left. Choose a plan to continue."

# 11. Attempt mock-complete on already-completed payment
POST /api/billing/mock-complete-payment/
{ "payment_id": <same id> }
# Expect: 400 "Payment already completed."

# 12. Google Sign-In still works
POST /api/auth/google/
# Expect: tokens returned, billing profile created for new Google user

# 13. fal.ai image generation still works
POST /api/images/generations/
# Expect: image generated, no credit errors
```

---

## Manual Test Checklist — Frontend

```
# Auth
- Register new user → billing stats show Free Trial + 1 audit credit
- Login with existing user → billing page loads with real data
- Google Sign-In → billing profile created automatically

# Dashboard home
- /dashboard → stats grid shows live plan name + credits
- "Manage Billing" CTA navigates to /dashboard/billing

# Billing page
- /dashboard/billing loads without errors
- Current plan card shows plan name + status badge
- 3 credit cards show real values from API
- Upgrade plans grid shows all 4 plans (launch/pro/growth/agency)
- Current plan is marked "CURRENT"
- Pro plan is highlighted with "RECOMMENDED" badge
- Add-ons section shows Extra Full Upgrade ($19) and Extra Audit Pack ($9)
- Recent transactions: "No transactions yet" if empty, list if populated
- Recent payments: "No payments yet" if empty, list if populated

# Mock checkout flow
- Click "Choose Pro" on billing page → modal appears
- Modal shows plan name, price, features, Polar note
- Click "Complete Test Payment" → payment completes, credits update, success banner appears
- /dashboard/billing?checkout=success → green success banner at top
- /dashboard/billing?checkout=cancelled → amber cancelled banner at top

# Pricing page checkout
- /pricing → all plan buttons visible
- Not logged in → clicking any paid plan routes to /login
- Not logged in → clicking "Start Free" routes to /signup
- Logged in → clicking "Start Pro" navigates to /dashboard/billing?plan=pro
- /dashboard/billing?plan=pro → checkout modal auto-opens

# Credit limit UX
- Use up all audit credits (or test with 0 credits user)
- Try to submit new audit → Step 3 shows paywall block instead of raw error
- "View Plans" button routes to /dashboard/billing
- "Manage Billing" button routes to /dashboard/billing

# Routes still working
- / → landing page
- /login, /signup → auth pages
- /pricing → pricing page
- /dashboard → home
- /dashboard/billing → billing page
- /dashboard/new-audit → new audit flow
- /dashboard/audits → audit list
- /dashboard/audits/:id → audit detail
- /dashboard/audits/:id/image-studio → image studio
- /dashboard/settings → settings

# Build quality
npm run build  # must pass with no TypeScript errors
```
