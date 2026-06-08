# Day 13.0 — Amazon Audit Upgrade (Backend)

## What Changed

Upgraded the audit system from a generic marketplace audit to a real Amazon Product Detail Page structure.
AI output is now shorter, structured, and directly actionable.

---

## New Audit Input Fields (Audit model)

Added to `audits/models.py` — all optional, blank=True, safe for existing rows:

| Field | Maps to Amazon section |
|---|---|
| `about_this_item` | About this item / bullet points |
| `product_details` | Product Details / Top Highlights |
| `product_specifications` | Product Specifications / Attributes |
| `brand_content` | Brand section |
| `a_plus_content` | A+ Content |
| `variations` | Variations / size / color / options |
| `size_guide` | Size guide |
| `product_images_notes` | Product image gallery notes |
| `videos_notes` | Product video notes |
| `reviews_qna` | Reviews / Q&A summary |
| `buyer_complaints` | Buyer complaints or pain points |

All existing fields retained: `product_name`, `category`, `amazon_url`, `current_title`, `bullet_points`, `description`, `backend_keywords`, `price`, `rating`, `review_count`, `main_benefit`, `target_audience`, `seller_goal`, `notes`.

---

## New AuditResult Fields

Added to `AuditResult` model:

| Field | Type | Purpose |
|---|---|---|
| `concise_report` | JSONField nullable | Full v2 structured report from Gemini |
| `report_version` | CharField default='v1' | 'v1' = old format, 'v2' = new Amazon format |

All existing AuditResult fields retained for backward compat with frontend report page.

---

## Backward Compatibility

- Old audits: `report_version='v1'`, `concise_report=null`, existing fields populated — frontend still renders correctly.
- New audits: `report_version='v2'`, `concise_report` holds full v2 JSON, old model fields are populated by mapping v2 → v1 structure:
  - `top_critical_issues` → `weak_points`
  - `title_upgrade` → `title_analysis` + `improved_title`
  - `about_this_item_upgrade.improved_bullets` → `improved_bullets`
  - `description_upgrade` → `description_analysis` + `improved_description`
  - `image_gallery_plan` → `image_pack_plan` (Image Studio still works)
  - `a_plus_brand_plan` → `a_plus_content_ideas`
  - `keyword_opportunities`, `buyer_objections`, `priority_checklist` mapped directly
  - `conversion_diagnosis`, `bullet_improvements`, `review_insights` set to empty defaults

---

## New Concise Report JSON Structure (v2)

```json
{
  "score": 67,
  "score_label": "Needs stronger conversion signals",
  "executive_summary": "One short paragraph, max 2 sentences.",
  "top_critical_issues": [
    { "area": "Title", "problem": "...", "impact": "...", "fix": "..." }
  ],
  "fix_this_first": [
    { "task": "...", "reason": "..." }
  ],
  "title_upgrade": {
    "current_issue": "...",
    "improved_title": "Ready-to-use Amazon title"
  },
  "about_this_item_upgrade": {
    "strategy": "...",
    "improved_bullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"]
  },
  "product_details_fixes": [
    { "field": "...", "issue": "...", "recommended_fix": "..." }
  ],
  "description_upgrade": {
    "current_issue": "...",
    "improved_description": "..."
  },
  "keyword_opportunities": [
    { "keyword": "...", "reason": "..." }
  ],
  "buyer_objections": [
    { "objection": "...", "how_to_address": "..." }
  ],
  "image_gallery_plan": [
    { "image_type": "...", "goal": "...", "headline": "...", "visual_direction": "...", "text_elements": ["...", "..."] }
  ],
  "a_plus_brand_plan": [
    { "section": "...", "purpose": "...", "content_idea": "..." }
  ],
  "priority_checklist": [
    { "priority": "High|Medium|Low", "task": "...", "reason": "..." }
  ],
  "details": {
    "title": "...", "bullets": "...", "images": "...", "product_details": "..."
  }
}
```

### Limits enforced in prompt
- top_critical_issues: max 5
- fix_this_first: max 3
- improved_bullets: exactly 5
- product_details_fixes: max 5
- keyword_opportunities: max 8
- buyer_objections: max 5
- image_gallery_plan: max 6
- a_plus_brand_plan: max 3
- priority_checklist: max 5
- no paragraph longer than 2 sentences

---

## Migration

`audits/migrations/0003_audit_a_plus_content_audit_about_this_item_and_more.py`

Safe additive migration — only adds new nullable/blank columns, no data changes.

---

## Files Changed

| File | Change |
|---|---|
| `audits/models.py` | +11 Audit fields, +2 AuditResult fields |
| `audits/serializers.py` | All serializers updated with new fields |
| `audits/services/gemini_audit_service.py` | New v2 prompt + REQUIRED_FIELDS_V2 |
| `audits/views.py` | `_run_gemini_and_save` maps v2 → v1 + stores concise_report |
| `audits/migrations/0003_...py` | Auto-generated additive migration |

---

## Commands to Run

```bash
python manage.py makemigrations   # already done
python manage.py migrate          # already done
python manage.py check            # 0 issues
python manage.py runserver        # verify startup
```

---

---

## Frontend Changes (Day 13.0)

### New Audit Form — Amazon Listing Input v2

`frontend/src/pages/NewAuditPage.tsx`

- Added `CollapsibleSection` component for grouped form fields
- Extended `FormState` with: `aboutThisItem`, `productDetails`, `productSpecifications`, `brandContent`, `aPlusContent`, `productImagesNotes`, `reviewsQna`
- Step 3 (Amazon URL confirm) now has 6 collapsible sections:
  1. **Listing Basics** (open by default, required fields): URL, Title, Category, Price/Rating/Review Count
  2. **About This Item** (open): bullet points → `about_this_item`
  3. **Product Details** (collapsed): top highlights → `product_details`
  4. **Product Specifications** (collapsed): attributes → `product_specifications`
  5. **Description / Brand Content** (collapsed): description, brandContent, aPlusContent
  6. **Images & Customer Signals** (collapsed): image notes, reviews/Q&A, seller goal
- Step 3 (Product Photos confirm) adds: product specifications, product visual details (notes), seller goal
- `buildPayload` sends all new fields to backend

### Audit Report UI — v2 Concise Layout

`frontend/src/pages/AuditDetailPage.tsx`

- Added `ConciseAuditReport` component for `report_version === 'v2'` reports
- Renders: Executive Summary, Top Critical Issues (compact cards), Fix This First (3 cards), Copy Upgrade (title/bullets/description + copy buttons), Product Details Fixes, Image Gallery Plan (6 max + Image Studio CTA), A+ Brand Plan, Priority Checklist, Details (collapsible)
- Details section collapsed by default behind "View Details / Hide Details" toggle
- v1 reports continue to use existing `AuditReport` component unchanged
- `ReportHeader` updated to include "New Audit" CTA alongside existing CTAs
- Report version detection: `result.report_version === 'v2' && result.concise_report`

### Landing + Dashboard Connection

`frontend/src/components/layout/Navbar.tsx`
- Auth-aware navigation: logged-in users see Dashboard / New Audit / Billing links
- Guest users see Features / How It Works / Pricing / Login
- Primary CTA changes to "New Audit" for authenticated users

`frontend/src/components/layout/DashboardLayout.tsx`
- Added **Home** link at the top of sidebar nav (navigates to `/`)

`frontend/src/pages/LandingPage.tsx`
- Added `AuthWorkspaceBlock` component — only renders for authenticated users
- Shows "Your Sellio Workspace" bar with user greeting and quick links: New Audit, Dashboard, Billing
- Positioned between Navbar and HeroSection

`frontend/src/types/audit.ts`
- Added `ConciseReport` interface (full v2 JSON shape)
- Added `concise_report: ConciseReport | null` and `report_version: string` to `AuditResult`
- Added new Amazon fields to `AuditDetail` and `CreateAuditPayload`

---

## Manual Test Checklist

### Backend
- [ ] `python manage.py check` — 0 issues
- [ ] Server starts without errors
- [ ] Auth login works (email + Google Sign-In)
- [ ] Create a new audit (old fields only) — still works
- [ ] Create a new audit with new Amazon fields filled — submits ok
- [ ] Submit audit — Gemini generates v2 report, `report_version='v2'`
- [ ] Audit report page renders correctly
- [ ] Old completed audits still display (`report_version='v1'`)
- [ ] Image Studio loads — `image_pack_plan` populated from `image_gallery_plan`
- [ ] fal.ai image generation still works
- [ ] Billing / credits / paywall unchanged
- [ ] `concise_report` field returned in API response for new audits

### Frontend
- [ ] `npm run build` — 0 TypeScript errors
- [ ] New Audit → Amazon URL → Step 2 URL validation still works
- [ ] New Audit → Step 3 shows 6 collapsible sections (Listing Basics open, rest collapsed)
- [ ] Sections expand/collapse correctly with chevron animation
- [ ] New Audit → Product Photos → Step 3 shows new optional fields (specs, visual details, seller goal)
- [ ] Submitting audit with new fields populates them in the backend
- [ ] Audit report: v2 report shows concise layout (Critical Issues, Fix This First, Copy Upgrade, etc.)
- [ ] Audit report: v1 report still shows legacy layout unchanged
- [ ] Copy buttons work on Copy Upgrade section
- [ ] Image Gallery Plan CTA opens Image Studio
- [ ] Details section collapses/expands correctly
- [ ] Dashboard sidebar: Home link navigates to `/`
- [ ] Landing page (guest): shows Features/How It Works/Pricing/Login nav, "Start Free Audit" CTA
- [ ] Landing page (logged in): shows Dashboard/New Audit/Billing nav, "New Audit" CTA
- [ ] Landing page (logged in): Workspace block visible with user name and quick action links
- [ ] Landing page (guest): no workspace block shown
- [ ] All routes work: /, /login, /signup, /pricing, /dashboard, /dashboard/new-audit, /dashboard/audits, /dashboard/audits/:id, /dashboard/audits/:id/image-studio, /dashboard/billing, /dashboard/settings
- [ ] Google Sign-In still works
