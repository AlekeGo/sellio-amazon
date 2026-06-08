# Day 11 — Credits & Limits Enforcement

## Credit Rules

### Plan Credit Grants

| Plan            | audit_credits | full_upgrade_credits | image_generation_credits | Mode         |
|-----------------|:-------------:|:--------------------:|:------------------------:|--------------|
| free_trial      | 1             | 0                    | 0                        | free         |
| full_upgrade    | 1             | 1                    | 6                        | one-time     |
| launch          | 3             | 1                    | 6                        | subscription |
| pro             | 7             | 3                    | 18                       | subscription |
| growth          | 10            | 5                    | 30                       | subscription |
| agency          | 25            | 15                   | 90                       | subscription |
| extra_upgrade   | 1             | 1                    | 6                        | one-time     |
| extra_audit_pack| 3             | 0                    | 0                        | one-time     |

Credits are additive — completing a payment adds on top of any existing balance.

---

## Audit Credit Behavior

**Endpoint:** `POST /api/audits/<id>/submit/`

Rules enforced in order:

1. If `audit.status == 'completed'` → return existing result immediately, no credit consumed.
2. If `audit.status == 'pending_analysis'` → return 202 "in progress", no credit consumed.
3. If `audit.status` is not `draft`, `ready_for_analysis`, or `failed` → return 400.
4. If audit already has an `AuditResult` (re-submit on failed with existing partial data) → no credit consumed.
5. If user `audit_credits <= 0` → return **402**:
   ```json
   {
     "code": "NO_AUDIT_CREDITS",
     "detail": "You have no audit credits left. Choose a plan to continue.",
     "upgrade_required": true
   }
   ```
6. If credit check passes → consume 1 `audit` credit immediately before Gemini call.
7. If Gemini fails (any exception) → automatically refund the consumed credit and set `audit.status = 'failed'`.

**Safety guarantee:** A credit is never permanently lost due to a provider error. Refund happens in all three exception branches (ValueError, GeminiTemporaryError, Exception).

---

## Image Credit Behavior

**Endpoints:**
- `POST /api/images/generations/` — new generation
- `POST /api/images/generations/<id>/regenerate/` — new generation from existing
- `POST /api/images/generations/<id>/retry/` — retry a failed generation

### Credit priority

| Condition | Action |
|-----------|--------|
| `image_generation_credits > 0` | Consume 1 `image_generation` credit on success |
| `image_generation_credits == 0` AND `full_upgrade_credits > 0` | Allow generation, no credit consumed |
| Neither credit available, but `DEBUG=True` AND `PAYMENT_PROVIDER=mock` | Allow generation (dev mode), no credit consumed |
| Neither credit, not dev mode | Return **402** |

**402 response:**
```json
{
  "code": "NO_IMAGE_CREDITS",
  "detail": "You have no image generation credits left. Choose a plan to continue.",
  "upgrade_required": true
}
```

**Safety guarantee:** Credit is consumed ONLY after the FAL provider returns a successful result. A failed generation never deducts credits.

---

## Billing State API

`GET /api/billing/me/` now returns:

```json
{
  "profile": { "current_plan": "...", "subscription_status": "..." },
  "balance": {
    "audit_credits": 1,
    "full_upgrade_credits": 0,
    "image_generation_credits": 0
  },
  "can_run_audit": true,
  "can_generate_image": false,
  "upgrade_required": false,
  "recent_transactions": [...],
  "recent_payments": [...]
}
```

`upgrade_required` is `true` when all three credit types are zero.

---

## Mock Payment Testing

### Create a checkout session

```bash
POST /api/billing/create-checkout-session/
{ "plan_key": "launch" }
```

Returns `payment_id` and a `checkout_url`.

### Complete mock payment (grants credits)

```bash
POST /api/billing/mock-complete-payment/
{ "payment_id": "<id>" }
```

- Only available when `PAYMENT_PROVIDER=mock` (env default).
- Idempotent: calling twice returns 400 "Payment already completed."
- The `credits_granted` flag on `Payment` prevents double-grant even if called concurrently.

---

## Manual Test Checklist

- [ ] New user has 1 `audit_credit` and 0 `image_generation_credits`.
- [ ] `GET /api/billing/me/` returns correct balance, `can_run_audit=true`, `can_generate_image=false`.
- [ ] Submit audit → credit consumed → balance drops to 0.
- [ ] Re-submit same completed audit → returns existing result, no credit consumed.
- [ ] Submit with 0 credits → 402 with `code: NO_AUDIT_CREDITS`.
- [ ] Simulate Gemini failure (remove `GEMINI_API_KEY`) → credit refunded, balance restored.
- [ ] Complete mock payment for `launch` plan → grants 3 audit + 1 full_upgrade + 6 image_generation credits.
- [ ] Complete same payment twice → second call returns 400.
- [ ] With 0 `image_generation_credits` and 0 `full_upgrade_credits` and `DEBUG=False` → image gen returns 402.
- [ ] With 0 `image_generation_credits` but `full_upgrade_credits > 0` → image gen allowed, no credit consumed.
- [ ] With `image_generation_credits > 0` → image gen succeeds and credit decrements by 1.
- [ ] Image gen FAL failure → no credit consumed.
- [ ] Admin: all four billing models visible and editable in Django admin.
- [ ] `python manage.py check` passes with 0 issues.

---

## Frontend — Day 11 Paywall & Credit UX

### Files changed

| File | Change |
|------|--------|
| `frontend/src/types/billing.ts` | Added `can_run_audit`, `can_generate_image`, `upgrade_required` to `BillingMeResponse` |
| `frontend/src/components/ui/PaywallBlock.tsx` | **New** — reusable premium paywall component |
| `frontend/src/pages/NewAuditPage.tsx` | Replaced inline creditExhausted block with `PaywallBlock`; shows "0 audits left" |
| `frontend/src/pages/DashboardPage.tsx` | 4th stat card (image credits), Upgrade Plan CTA, audit credit warning state |
| `frontend/src/pages/AuditImageStudioPage.tsx` | Billing fetch, credit pill in progress bar, 402 → PaywallBlock |
| `frontend/src/pages/BillingPage.tsx` | Success banner text updated to "Credits added successfully." |
| `frontend/src/index.css` | `stats-grid` updated: 1-col mobile → 2-col sm → 4-col lg |

### Components added

**`PaywallBlock`** (`components/ui/PaywallBlock.tsx`)

Props: `title`, `subtitle`, `creditsLine`, `primaryCta { label, to }`, `secondaryCta { label, to }`

All props have sensible defaults. Used in:
- `NewAuditPage` — when 402 is returned from audit submit
- `AuditImageStudioPage` — when 402 is returned from image generation

### Paywall behavior

| Trigger | Location | Display |
|---------|----------|---------|
| Backend returns 402 `NO_AUDIT_CREDITS` on audit submit | NewAuditPage Step 3 | PaywallBlock inline below form; Analyze Listing button hidden |
| Backend returns 402 `NO_IMAGE_CREDITS` on generate/regenerate | AuditImageStudioPage | PaywallBlock banner at top of page |
| `upgrade_required === true` from billing | DashboardPage actions | "Upgrade Plan" button replaces "Manage Billing" |

### Dashboard credit card

4 stat cards in the `stats-grid`:
1. **Current plan** — name + subscription status
2. **Audit credits** — count; orange border + warning when `can_run_audit === false`
3. **Full upgrade credits** — count
4. **Image credits** — count

CTA row: "Create New Audit" + conditional "Upgrade Plan" (when `upgrade_required`) or "Manage Billing"

### Image Studio credit display

The progress bar row shows a credit pill when billing data is available:
- `X images left` (lime) — when `image_generation_credits > 0`
- `Full Upgrade active` (emerald) — when image credits are 0 but `full_upgrade_credits > 0`

No pill shown in dev mode (backend allows generation anyway).

---

## Manual Test Checklist (Frontend — Day 11)

- [ ] New user has 1 audit credit displayed on dashboard.
- [ ] Dashboard shows 4 credit stat cards including image generation credits.
- [ ] New Audit → Analyze Listing → with credits → audit runs normally.
- [ ] New Audit → Analyze Listing → with 0 credits → PaywallBlock shown, button hidden, "0 audits left" displayed.
- [ ] PaywallBlock "View Plans" → navigates to /dashboard/billing.
- [ ] PaywallBlock "Manage Billing" → navigates to /dashboard/billing.
- [ ] Image Studio progress bar shows "X images left" pill when image credits > 0.
- [ ] Image Studio shows "Full Upgrade active" pill when image credits are 0 but full_upgrade > 0.
- [ ] Image generate with no credits (non-dev mode) → PaywallBlock shown at top of page.
- [ ] Billing page: complete mock payment → success banner says "Credits added successfully."
- [ ] After mock payment → billing data refreshes automatically, dashboard credits updated on next visit.
- [ ] Dashboard "Upgrade Plan" button appears when all credits are 0.
- [ ] Dashboard "Manage Billing" button appears when credits remain.
- [ ] Paywall, credit cards, progress bar all render correctly on mobile (≤480px).
- [ ] `npm run build` passes with 0 TypeScript errors.
- [ ] Auth, Google Sign-In, New Audit flow, Gemini audit, image generation all still work.

---

## Postponed

- **Real Polar integration** — webhook handler, subscription lifecycle events.
- **Production webhooks** — Polar sends `payment.completed` events; we will consume them and call `grant_plan_credits`.
- **Taxes** — handled by Polar at checkout.
- **Refunds** — manual refund via Polar dashboard; no automatic credit reversal on refund yet.
- **Customer portal** — Polar-hosted portal for subscription management.
- **Subscription cancellation / expiry** — no credit expiration or removal on cancel yet.
- **Usage metering** — no per-period reset; credits accumulate indefinitely.
