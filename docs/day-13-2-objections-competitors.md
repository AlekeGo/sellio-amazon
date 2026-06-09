# Day 13.2 — Buyer Objection Radar & Competitor Analysis Lite

## Overview

Day 13.2 adds two new AI-generated intelligence blocks to every audit report:

1. **Buyer Objection Radar** — identifies what is stopping buyers from converting, with specific listing and image fixes
2. **Competitor Analysis Lite** — compares the listing against manually entered competitors and identifies where the seller can win

No Amazon scraping. No external API calls beyond Gemini. Manual competitor input only.

---

## Buyer Objection Radar

### What it does

Analyzes reviews, Q&A, buyer complaints, and listing data to surface the top buyer objections that are likely hurting conversion.

### Data sources used

- `reviews_qna` — customer reviews and Q&A text
- `buyer_complaints` — known complaints
- `rating` — used to gauge satisfaction level
- `review_count` — volume signal
- `notes` — any seller-supplied additional context

### Fallback behavior

If `reviews_qna` and `buyer_complaints` are both empty, Gemini infers likely objections from the listing data (title, bullets, price, category) and sets `source_signal` to `"Likely concern based on listing data"`.

### Output structure

Stored inside `concise_report` as `buyer_objection_radar`:

```json
"buyer_objection_radar": [
  {
    "objection": "Short buyer concern",
    "source_signal": "What suggests this concern",
    "why_it_hurts_conversion": "1 sentence",
    "listing_fix": "1 sentence fix for copy",
    "image_fix": "Short image idea"
  }
]
```

- Maximum 5 objections
- All fields are short, practical, and actionable

---

## Competitor Analysis Lite

### What it does

Compares the seller's listing against manually entered competitor data to identify competitor advantages and areas where the seller can outperform them.

### Important: No scraping

Competitor data is entered manually by the seller. The system does not fetch, scrape, or auto-populate any Amazon data.

### Competitor input structure

The `competitors` field on the `Audit` model accepts a JSON array:

```json
[
  {
    "name": "Competitor 1",
    "url": "https://amazon.com/dp/...",
    "title": "Competitor listing title",
    "price": "$29.99",
    "rating": "4.3",
    "review_count": "1,200",
    "bullets": "Key bullet points from their listing",
    "image_notes": "What their main images show",
    "strengths": "What they do well",
    "notes": "Any additional notes"
  }
]
```

All fields within each competitor object are optional. The `competitors` field itself is optional (null by default).

The `competitor_notes` field is a plain text field for any free-form observations about the competitive landscape.

### Fallback behavior

If no competitor data is provided, Gemini returns:
- `competitor_advantages`: empty array `[]`
- `where_we_can_win`: empty array `[]`
- `summary`: `"No competitor data was provided."`

### Output structure

Stored inside `concise_report` as `competitor_analysis_lite`:

```json
"competitor_analysis_lite": {
  "summary": "Short 1-2 sentence comparison",
  "competitor_advantages": [
    {
      "competitor": "Competitor name or URL",
      "advantage": "Short advantage",
      "why_it_matters": "1 sentence"
    }
  ],
  "where_we_can_win": [
    {
      "area": "Title / Images / Bullets / Product Details / A+",
      "opportunity": "Short opportunity",
      "recommended_action": "Short action"
    }
  ],
  "do_not_copy_warning": "Use competitor structure as inspiration, but do not copy text, claims, images, or branding."
}
```

- Maximum 5 `competitor_advantages`
- Maximum 5 `where_we_can_win` items
- `do_not_copy_warning` is always present

---

## Pro Upgrade Pack integration

`buyer_objection_radar` and `competitor_analysis_lite` influence the Pro Upgrade Pack:

- `copy_ready_bullets` — first two bullets directly address the top buyer objections
- `image_briefs` — includes at least one "Objection Buster" image brief and one differentiator image
- `priority_checklist` — prioritizes fixes that address buyer objections and competitor gaps

---

## Report structure

Both blocks are stored in `AuditResult.concise_report` (JSONField) as top-level keys alongside the rest of the v2 report. No new database fields on `AuditResult` are needed.

`AuditResult.report_version` remains `"v2"`.

---

## Model changes

### `Audit` model — new optional fields

| Field | Type | Default | Description |
|---|---|---|---|
| `competitors` | JSONField | null | Array of competitor objects (manual input) |
| `competitor_notes` | TextField | blank | Free-form competitor landscape notes |

Migration: `0005_audit_competitors_competitor_notes`

---

## API changes

All three serializers now include `competitors` and `competitor_notes`:

- `AuditCreateSerializer`
- `AuditUpdateSerializer`
- `AuditDetailSerializer`

---

## Frontend Implementation

### New files / components

No new files created. All changes are additions to existing files.

### `frontend/src/types/audit.ts`

New interfaces added:
- `Competitor` — manual competitor input object (all fields optional)
- `BuyerObjectionRadarItem` — one objection card: `objection`, `source_signal`, `why_it_hurts_conversion`, `listing_fix`, `image_fix`
- `CompetitorAdvantage` — one competitor advantage: `competitor`, `advantage`, `why_it_matters`
- `CompetitorWinArea` — one win opportunity: `area`, `opportunity`, `recommended_action`
- `CompetitorAnalysisLite` — full analysis object: `summary`, `competitor_advantages[]`, `where_we_can_win[]`, `do_not_copy_warning`

Extended types:
- `ConciseReport` — added optional `buyer_objection_radar?: BuyerObjectionRadarItem[]` and `competitor_analysis_lite?: CompetitorAnalysisLite`
- `AuditDetail` — added `competitors: Competitor[] | null` and `competitor_notes: string`
- `CreateAuditPayload` — added `competitors?: Competitor[]` and `competitor_notes?: string`

### `frontend/src/pages/NewAuditPage.tsx`

- Added `Plus` to lucide-react imports
- Added `CompetitorField` type and `emptyCompetitor()` helper
- Added `competitors: CompetitorField[]` and `competitorNotes: string` state
- Added `addCompetitor`, `removeCompetitor`, `updateCompetitor` helpers
- Added `CompetitorSection` component: collapsible section with up to 3 competitor cards (each with name, url, title, price, rating, review count, bullets, image notes, strengths)
- Updated `handleSubmit` to include `competitors` (filtered, non-empty only) and `competitor_notes` in the create payload
- Step 3 Amazon URL form:
  - Renamed "Images & Customer Signals" → "Images & Seller Context" (removed `reviewsQna` from it)
  - Added dedicated "Reviews, Q&A & Buyer Complaints" collapsible section with `reviewsQna` field and helper text
  - Added "Competitor Analysis Lite" collapsible section via `CompetitorSection`
- Step 3 Product Photos form:
  - Added "Reviews, Q&A & Buyer Complaints" collapsible section inside the flex column
  - Added "Competitor Analysis Lite" collapsible section

### `frontend/src/pages/AuditDetailPage.tsx`

- Extended type import: added `BuyerObjectionRadarItem`, `CompetitorAnalysisLite`
- Added `BuyerObjectionRadarBlock` component:
  - Shows up to 5 objection cards in the v2 concise report
  - Each card: [Concern] badge + objection, source signal, [Why it hurts] + [Fix] + [Image idea] badges
  - "Copy Objection Fixes" button copies all objection + fix + image idea text
  - Empty state: "Add reviews or Q&A in your next audit to detect stronger buyer objections."
- Added `CompetitorAnalysisLiteBlock` component:
  - Shows summary, competitor advantages (red cards), where we can win (green cards), do_not_copy_warning
  - "Copy Competitor Action Plan" button
  - Empty/no-data state: "No competitor data was provided for this audit."
- Both blocks inserted in `ConciseAuditReport` after Pro Upgrade Pack and before Ready-to-Copy Listing Upgrade

### Report block order in `ConciseAuditReport` (v2)

1. Summary
2. Top Problems
3. Fix This First
4. One-click Pro Upgrade
5. **Buyer Objection Radar** ← new
6. **Competitor Analysis Lite** ← new
7. Ready-to-Copy Listing Upgrade
8. Product Details Fixes
9. Image Gallery Plan
10. Next Actions (Priority Checklist)
11. View Details (collapsed)
12. Image Studio CTA

### Copy buttons added

- "Copy Objection Fixes" — in `BuyerObjectionRadarBlock`
- "Copy Competitor Action Plan" — in `CompetitorAnalysisLiteBlock`

### Backward compatibility

- Old v1 reports: both new blocks are only in `ConciseAuditReport` (v2 only)
- Old v2 reports without `buyer_objection_radar`: block shows empty state
- Old v2 reports without `competitor_analysis_lite`: block shows empty/no-data state
- No required fields added to the form

---

## AI JSON parsing fallback added

`gemini_audit_service.py` now uses a multi-step safe parser before falling back gracefully:

1. Direct `json.loads` on the raw response
2. Strip markdown fences (` ```json `) then re-parse
3. Extract the largest `{…}` block between first `{` and last `}` then re-parse
4. Remove trailing commas before `}` or `]` then re-parse
5. If all steps fail, return `_fallback_report()` — audit completes with score 0 and a "Please regenerate" message instead of crashing

The Gemini prompt was also strengthened: explicit no-trailing-commas rule, double-quotes only, no markdown, empty arrays for missing data. Temperature lowered to 0.4 for more deterministic output. User-provided text fields (reviews, competitor notes, etc.) are now JSON-serialized before being embedded in the prompt so they cannot break prompt structure.

The views catch `json.JSONDecodeError` before `ValueError` and return `"AI response was incomplete. Please try again or reduce input length."` — never the raw Python parse error.

---

## Manual test checklist

### Backend checks

- [ ] `python manage.py check` passes with no errors
- [ ] `python manage.py migrate` applies migration `0005` successfully
- [ ] `python manage.py runserver` starts without errors

### Auth checks

- [ ] Login with email/password works
- [ ] Google Sign-In works
- [ ] Protected routes reject unauthenticated requests

### Audit flow checks

- [ ] New Audit creation (Step 1-3) works without competitors
- [ ] Gemini audit generates successfully without competitor data
- [ ] `buyer_objection_radar` is present in `concise_report` when audit completes
- [ ] `competitor_analysis_lite` has empty arrays and "No competitor data was provided." summary when no competitors are submitted

### Competitor input checks

- [ ] PATCH `/api/audits/<id>/` with `competitors` JSON array saves correctly
- [ ] PATCH `/api/audits/<id>/` with `competitor_notes` text saves correctly
- [ ] GET `/api/audits/<id>/` returns `competitors` and `competitor_notes` in response
- [ ] Gemini audit with competitors data generates `competitor_analysis_lite` with populated arrays

### Buyer Objection Radar checks

- [ ] With `reviews_qna` filled: `source_signal` reflects review data
- [ ] Without `reviews_qna` or `buyer_complaints`: `source_signal` is "Likely concern based on listing data"
- [ ] Maximum 5 objections returned

### Pro Upgrade Pack checks

- [ ] `pro_upgrade_pack` still present after Day 13.2 changes
- [ ] `copy_ready_bullets` reflect buyer objection insights
- [ ] `image_briefs` include an objection-addressing brief
- [ ] Seller Persona still applied to all copy in `pro_upgrade_pack`

### Frontend — New Audit form checks

- [ ] Step 3 (Amazon URL): "Reviews, Q&A & Buyer Complaints" section appears and accepts text
- [ ] Step 3 (Amazon URL): "Images & Seller Context" section no longer shows reviews field
- [ ] Step 3 (Amazon URL): "Competitor Analysis Lite" section is collapsed by default
- [ ] Can add up to 3 competitor cards (Add Competitor button hidden at 3)
- [ ] Competitor cards show name, url, title, price/rating/reviews, bullets, image notes, strengths
- [ ] Removing a competitor card works correctly
- [ ] Competitor count badge shows in section header after adding competitors
- [ ] Form submits successfully with no competitors (all optional)
- [ ] Form submits with 1–3 competitors included in the API payload
- [ ] Same sections appear in Step 3 (Product Photos) form
- [ ] `npm run build` passes with no TypeScript errors

### Frontend — Audit Report checks

- [ ] Buyer Objection Radar block appears after One-click Pro Upgrade in v2 reports
- [ ] Objection cards show: [Concern] badge, objection text, source signal
- [ ] Each card shows [Why it hurts] / [Fix] / [Image idea] styled badges with content
- [ ] "Copy Objection Fixes" button copies all objection + fix + image idea text
- [ ] Empty state shows: "Add reviews or Q&A in your next audit to detect stronger buyer objections."
- [ ] Competitor Analysis Lite block appears after Buyer Objection Radar in v2 reports
- [ ] Competitor advantages render as red-tinted cards
- [ ] Where We Can Win renders as green-tinted cards
- [ ] Do Not Copy warning banner appears
- [ ] "Copy Competitor Action Plan" button copies structured text
- [ ] No-data state shows: "No competitor data was provided for this audit."
- [ ] Old v1 reports still display (no crash from missing fields)
- [ ] Old v2 reports without the new blocks show empty states (no crash)

### Existing features checks

- [ ] Day 13.0 concise report still works (all v2 fields present)
- [ ] Day 13.1 seller_persona still works
- [ ] Day 13.1 pro_upgrade_pack still generated
- [ ] Image Studio loads and generates images
- [ ] fal.ai image generation works
- [ ] Billing/credits check fires on audit submit
- [ ] Paywall blocks when credits are zero
