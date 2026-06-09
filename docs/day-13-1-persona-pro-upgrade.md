# Day 13.1 — Seller Persona Mode & One-click Pro Upgrade Pack

## Overview

Two features added on top of the Day 13.0 Amazon listing audit:

1. **Seller Persona Mode** — the seller declares their brand positioning before running the audit, and every AI output reflects that persona.
2. **Pro Upgrade Pack** — a dedicated block inside the AI report that delivers copy-ready, persona-aligned assets the seller can paste directly into Amazon.

---

## Seller Persona Mode

### Field

`Audit.seller_persona` — optional `CharField(max_length=30, blank=True)`.

### Allowed values

| Value | Display |
|---|---|
| `premium` | Premium |
| `budget_friendly` | Budget Friendly |
| `gift_ready` | Gift Ready |
| `expert_professional` | Expert / Professional |
| `luxury` | Luxury |
| `problem_solver` | Problem Solver |
| `minimal_clean` | Minimal / Clean |

Empty string means no persona (balanced professional copy).

### Prompt behavior per persona

- **premium** — Trust, quality materials, superior craftsmanship, value perception.
- **budget_friendly** — Value, practicality, affordability, everyday usefulness.
- **gift_ready** — Emotional value, gifting occasions, recipient benefit.
- **expert_professional** — Precise, technical, specification-driven language.
- **luxury** — Refined, elegant, aspirational, exclusive positioning.
- **problem_solver** — Lead with buyer pain point, then deliver the clear solution.
- **minimal_clean** — Simple, clear, direct wording. No hype, no filler.

The persona instruction is injected at the top of the Gemini prompt and applies to **all** copy outputs: title, bullets, description, pro_upgrade_pack, image briefs, and priority checklist.

---

## Pro Upgrade Pack

### Location in AuditResult

Stored in two places (both always populated for v2 reports):

- `AuditResult.concise_report["pro_upgrade_pack"]` — embedded inside the full JSON report.
- `AuditResult.pro_upgrade_pack` — dedicated JSONField for direct access.

Old v1 reports have `pro_upgrade_pack = null` — fully backwards compatible.

### Structure

```json
{
  "pro_upgrade_pack": {
    "persona_used": "Premium",
    "copy_ready_title": "Ready-to-use Amazon title under 200 chars",
    "copy_ready_bullets": [
      "Bullet 1 — ready to paste",
      "Bullet 2 — ready to paste",
      "Bullet 3 — ready to paste",
      "Bullet 4 — ready to paste",
      "Bullet 5 — ready to paste"
    ],
    "copy_ready_description": "Max 3 sentences. Ready to paste into Amazon description.",
    "product_details_fixes": [
      {
        "field": "Material",
        "recommended_value": "Ready-to-use value",
        "reason": "One sentence reason."
      }
    ],
    "image_briefs": [
      {
        "image_type": "Benefit Infographic",
        "headline": "Short headline",
        "visual_direction": "One sentence visual direction.",
        "text_elements": ["Short text", "Short text"]
      }
    ],
    "priority_checklist": [
      {
        "priority": "High",
        "task": "Short task name",
        "reason": "One sentence reason."
      }
    ]
  }
}
```

### Rules enforced in prompt

- `copy_ready_bullets`: exactly 5 if possible.
- `copy_ready_description`: max 3 sentences.
- `product_details_fixes`: max 5 items.
- `image_briefs`: max 6 items.
- `priority_checklist`: max 5 items.
- All outputs are practical and copy-ready — not just recommendations.

### Image Studio compatibility

`pro_upgrade_pack.image_briefs` uses the same shape as `image_gallery_plan` items (without the `goal` field). Existing `image_pack_plan` and `image_gallery_plan` fields are untouched.

---

## Frontend implementation

### Seller Persona Mode — New Audit

**Component:** `SellerPersonaPicker` in `NewAuditPage.tsx`

- 7 persona options in a responsive grid (`auto-fill, minmax(175px, 1fr)`)
- Click to select, click again to deselect
- Selected state: lime border + lime label text
- Placed in Step 3 (Confirm screen) for both entry types:
  - `amazon_url`: standalone visible card between the header card and the first collapsible section
  - `product_photos`: inline card inside the form, below Seller Goal
- `seller_persona` sent in `buildPayload` → `CreateAuditPayload.seller_persona`

**Step 3 confirm screen layout (amazon_url):**
1. Header card (Confirm your listing details)
2. **Seller Persona Mode card** ← new
3. Listing Basics (Required, open)
4. About This Item (open)
5. Product Details / Specifications / Description (collapsed)
6. Images & Customer Signals (collapsed)
7. Submit button row

### Pro Upgrade Pack — Audit Report

**Component:** `ProUpgradePackBlock` in `AuditDetailPage.tsx`

- Rendered inside `ConciseAuditReport` after "Fix This First", before "Ready-to-Copy Listing Upgrade"
- Only renders when `audit.result.pro_upgrade_pack` is non-null
- Backward compat: if `pro_upgrade_pack` is null (v1 reports or old v2), the existing "Ready-to-Copy" and other sections still render as-is

**Visual design:**
- Outer: lime border (`rgba(163,230,53,0.28)`), lime-tinted background
- Header: lime gradient background, Crown icon, title + subtitle, persona badge, "Copy Full Pack" button
- Sections: Copy-ready Title, Copy-ready Bullets, Copy-ready Description, Product Details Fixes, Image Briefs, Priority Checklist

**Copy buttons added:**
| Button | Copies |
|---|---|
| Copy Title | `copy_ready_title` |
| Copy All Bullets | All bullets joined with `\n` |
| Copy (per bullet) | Individual bullet |
| Copy Description | `copy_ready_description` |
| Copy (per fix value) | `recommended_value` field |
| Copy All Fixes | All `field: value` pairs |
| Copy Brief (per image) | Image type + headline + visual direction |
| Copy Image Briefs | All image briefs formatted |
| Copy Full Pack | Full structured upgrade pack as text |

**Image Briefs section:** includes "Open Image Studio" CTA linking to `/dashboard/audits/:id/image-studio`.

**Persona badge in Report Header:** `ReportHeader` shows a Crown + persona label badge when `audit.seller_persona` is set.

### TypeScript types updated

| Type | Change |
|---|---|
| `ProUpgradePack` | New interface |
| `SellerPersona` | New union type |
| `AuditResult.pro_upgrade_pack` | `ProUpgradePack \| null` |
| `AuditDetail.seller_persona` | `string` |
| `CreateAuditPayload.seller_persona` | `string?` |

---

## Files changed

| File | Change |
|---|---|
| `backend/audits/models.py` | `seller_persona` on `Audit`; `pro_upgrade_pack` on `AuditResult` |
| `backend/audits/serializers.py` | `seller_persona` in Create/Update/Detail; `pro_upgrade_pack` in Result |
| `backend/audits/services/gemini_audit_service.py` | Persona block + `pro_upgrade_pack` in prompt and required fields |
| `backend/audits/views.py` | Store `pro_upgrade_pack` in `_run_gemini_and_save` |
| `backend/audits/migrations/0004_...py` | Safe AddField migrations |
| `frontend/src/types/audit.ts` | `ProUpgradePack`, `SellerPersona`, updated `AuditResult`, `AuditDetail`, `CreateAuditPayload` |
| `frontend/src/pages/NewAuditPage.tsx` | `PERSONA_OPTIONS`, `SellerPersonaPicker`, `sellerPersona` in form + payload |
| `frontend/src/pages/AuditDetailPage.tsx` | `ProUpgradePackBlock`, persona badge in `ReportHeader`, `proUpgradePack` in `ConciseAuditReport` |

---

## Commands to run

```bash
cd backend
python manage.py migrate
python manage.py check
python manage.py runserver
```

```bash
cd frontend
npm run build
npm run dev
```

`makemigrations` is not needed — migration 0004 is already written.

---

## Manual test checklist

**Backend:**
- [ ] `python manage.py migrate` completes with no errors
- [ ] `python manage.py check` passes
- [ ] Create a new audit via POST `/api/audits/` with `seller_persona: "premium"` — field saved correctly
- [ ] Create a new audit with no `seller_persona` — field is empty, no error
- [ ] PATCH `/api/audits/<id>/` with `seller_persona: "gift_ready"` — field updates correctly
- [ ] GET `/api/audits/<id>/` returns `seller_persona` in response
- [ ] Submit audit for analysis — Gemini returns `pro_upgrade_pack` in response
- [ ] `AuditResult.pro_upgrade_pack` is populated after submission
- [ ] `AuditResult.concise_report["pro_upgrade_pack"]` is present
- [ ] `pro_upgrade_pack.copy_ready_bullets` has 5 items
- [ ] `pro_upgrade_pack.image_briefs` has `image_type`, `headline`, `visual_direction`, `text_elements`

**Frontend — New Audit:**
- [ ] Open `/dashboard/new-audit`, choose Amazon URL, click Continue
- [ ] Step 3 shows Seller Persona Mode section above Listing Basics
- [ ] Clicking a persona card highlights it with lime border
- [ ] Clicking it again deselects it
- [ ] Selecting "Premium" and submitting — `seller_persona: "premium"` in API payload
- [ ] Submitting with no persona selected — `seller_persona` absent from payload (no error)
- [ ] Product photos flow Step 3 also shows persona picker after Seller Goal

**Frontend — Audit Report:**
- [ ] Open a completed v2 audit that has `pro_upgrade_pack`
- [ ] Report header shows persona badge (Crown icon + label)
- [ ] "One-click Pro Upgrade" block appears after "Fix This First"
- [ ] Copy Title button copies `copy_ready_title` and shows "Copied" feedback
- [ ] Copy All Bullets copies all bullets joined with newlines
- [ ] Per-bullet copy buttons work individually
- [ ] Copy Description button works
- [ ] Copy (per fix) button copies individual fix value
- [ ] Copy All Fixes button copies all field:value pairs
- [ ] Copy Brief button copies individual image brief
- [ ] Copy Image Briefs button copies all briefs
- [ ] Copy Full Pack button copies the full structured upgrade pack text
- [ ] "Open Image Studio" CTA links to `/dashboard/audits/:id/image-studio`
- [ ] Old v1 reports still load (no crash when `pro_upgrade_pack` is null)
- [ ] Old v2 reports without `pro_upgrade_pack` still show "Ready-to-Copy Listing Upgrade"
- [ ] Image Studio still works
- [ ] Auth and Google Sign-In still work
- [ ] Billing/credits deducted on submit
- [ ] Paywall triggers correctly when no credits remain
- [ ] Regenerate audit updates `pro_upgrade_pack`
- [ ] `seller_persona: "luxury"` produces noticeably different tone vs `budget_friendly`
