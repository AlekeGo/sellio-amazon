# Day 5 — Gemini AI Audit

## Goal

When a user submits an audit, the backend calls Gemini and saves a structured AI-generated report as `AuditResult`, linked one-to-one to the `Audit`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `GEMINI_MODEL` | Model to use, e.g. `gemini-2.5-flash` |

Set these in `backend/.env`.

---

## Model

### AuditResult

Linked one-to-one to `Audit`. Stores the full structured report:

- `score` — integer 0–100
- `score_label` — short label
- `executive_summary` — overall assessment
- `conversion_diagnosis` — attention / trust / clarity / conversion
- `weak_points` — list of issue objects
- `title_analysis` — current problem + strategy
- `improved_title` — full rewritten title
- `bullet_improvements` — per-bullet critique + rewrite
- `improved_bullets` — 5 final improved bullets
- `description_analysis` — current problem + strategy
- `improved_description` — full rewritten description
- `keyword_opportunities` — keyword + reason pairs
- `review_insights` — signal / what it means / listing fix
- `buyer_objections` — objection + how to address
- `a_plus_content_ideas` — section / purpose / content idea
- `image_pack_plan` — image type / goal / headline / visual direction / text elements
- `priority_checklist` — priority / task / reason

---

## Service Layer

`audits/services/gemini_audit_service.py`

Responsibilities:
- Builds prompt from Audit fields
- Calls Gemini with `response_mime_type='application/json'`
- Strips markdown fences if present
- Parses and validates JSON
- Returns normalized Python dict

---

## Endpoint Behavior

### POST /api/audits/\<id\>/submit/

1. Requires authentication — only audit owner can submit
2. Allowed from `draft` or `ready_for_analysis` status only
3. Sets `submitted_at`, sets status to `pending_analysis`
4. Calls Gemini via service layer
5. Saves `AuditResult` via `update_or_create`
6. Sets status to `completed`
7. Returns full audit detail including `result`

**Error cases:**
- Missing `GEMINI_API_KEY` → 500 with `"Gemini API key is not configured."`
- Invalid/missing JSON fields → 400 with field list
- Gemini network or API error → 502 with message, audit status set to `failed`

### POST /api/audits/\<id\>/regenerate/

Same as submit but allowed at any status. Owner only. Overwrites existing `AuditResult`.

### GET /api/audits/\<id\>/

Returns full audit detail including `result` if completed:

```json
{
  "id": 1,
  "status": "completed",
  "result": {
    "score": 67,
    "score_label": "Needs stronger conversion signals",
    "executive_summary": "...",
    ...
  }
}
```

### GET /api/audits/

Returns list with `result_score` field for completed audits.

---

## JSON Report Structure

```json
{
  "score": 67,
  "score_label": "Needs stronger conversion signals",
  "executive_summary": "...",
  "conversion_diagnosis": {
    "attention": "...",
    "trust": "...",
    "clarity": "...",
    "conversion": "..."
  },
  "weak_points": [{"area": "...", "issue": "...", "impact": "...", "fix": "..."}],
  "title_analysis": {"current_problem": "...", "strategy": "..."},
  "improved_title": "...",
  "bullet_improvements": [{"current_issue": "...", "improved_version": "..."}],
  "improved_bullets": ["...", "...", "...", "...", "..."],
  "description_analysis": {"current_problem": "...", "improvement_strategy": "..."},
  "improved_description": "...",
  "keyword_opportunities": [{"keyword": "...", "reason": "..."}],
  "review_insights": [{"signal": "...", "what_it_means": "...", "listing_fix": "..."}],
  "buyer_objections": [{"objection": "...", "how_to_address": "..."}],
  "a_plus_content_ideas": [{"section": "...", "purpose": "...", "content_idea": "..."}],
  "image_pack_plan": [{"image_type": "...", "goal": "...", "headline": "...", "visual_direction": "...", "text_elements": ["..."]}],
  "priority_checklist": [{"priority": "High", "task": "...", "reason": "..."}]
}
```

---

## Manual Test Checklist

1. Start backend: `python manage.py runserver`
2. Log in and obtain JWT token
3. Create a new audit via POST `/api/audits/` with product data
4. Submit via POST `/api/audits/<id>/submit/`
5. Confirm response status is `completed`
6. Confirm `result` object is present with `score`, `executive_summary`, etc.
7. GET `/api/audits/<id>/` — confirm `result` is returned
8. GET `/api/audits/` — confirm `result_score` appears for the completed audit
9. Test regenerate: POST `/api/audits/<id>/regenerate/` — confirm new result overwrites old
10. Remove `GEMINI_API_KEY` from `.env`, restart, try submit — confirm 500 with correct message
11. Verify admin panel shows AuditResult entries at `/admin/audits/auditresult/`
12. Confirm auth still works (login, refresh, Google Sign-In)
13. Confirm Day 4 New Audit 3-step flow still works end-to-end

---

## Frontend — Result Page

### Types updated (`types/audit.ts`)

- `AuditResult` interface added with all 16 fields
- `AuditListItem.result_score: number | null` added
- `AuditDetail.result: AuditResult | null` added

### API updated (`lib/auditsApi.ts`)

- `regenerateAudit(id)` — POST `/api/audits/:id/regenerate/`

### New Audit flow (`NewAuditPage.tsx`)

- When `Analyze Listing` is clicked and submitting, the step 3 form is replaced by a full loading card
- Loading copy: **"Generating AI audit..."** / "Analyzing your Amazon listing..."
- Navigation to detail page only happens after `submitAudit()` resolves

### Audit Detail page (`AuditDetailPage.tsx`)

#### States

| Status | UI |
|---|---|
| `pending_analysis` | Spinning ring + "Analyzing your listing..." + auto-polls every 3s |
| `failed` | Error banner + Retry Analysis button + New Audit link |
| `draft` / `ready_for_analysis` | "Ready for analysis" banner + Analyze Listing button |
| `completed` + result | Full Sellio AI Audit Report |
| `completed` + no result | Warning banner + Regenerate link |

#### Report sections (when completed)

1. **Sellio Score** — SVG ring (green/amber/orange), score label, score bar, date, Regenerate button
2. **Executive Summary** — prose paragraph
3. **Conversion Diagnosis** — 4-quadrant grid (Attention / Trust / Clarity / Conversion)
4. **Weak Points** — colored cards with area tag, issue, impact, fix
5. **Improved Title** — highlighted card + Copy button; includes strategy note
6. **Improved Bullet Points** — numbered list, per-bullet Copy + Copy All
7. **Improved Description** — pre-wrap card + Copy button
8. **Keyword Opportunities** — pill + reason rows
9. **Review Insights** — signal / means / fix rows
10. **Buyer Objections** — 2-column grid (objection / address)
11. **A+ Content Ideas** — responsive card grid
12. **Image Pack Plan** — cards with image type, goal, headline, visual direction, text elements
13. **Priority Checklist** — High/Medium/Low colored badges + task + reason
14. **Image Studio CTA** — gradient banner → `/dashboard/image-studio`

#### Score colors
- 80–100: lime `#a3e635`
- 60–79: amber `#fbbf24`
- 0–59: orange `#f97316`

### Audits list (`AuditsListPage.tsx`)

- Score badge shown next to arrow if `result_score` is not null
- Color-coded by score tier

### Dashboard recent audits (`DashboardPage.tsx`)

- Score badge shown alongside status badge in recent audit items

---

## Manual Test Checklist — Frontend

1. Go to `/dashboard/new-audit`
2. Select entry type, fill in details, click **Analyze Listing**
3. Confirm loading card shows "Generating AI audit..."
4. After redirect, confirm `/dashboard/audits/:id` shows full report
5. Verify all report sections render (score ring, bullets, checklist, etc.)
6. Click **Copy** on improved title — confirm clipboard text matches
7. Click **Copy** on a bullet — confirm clipboard text matches
8. Click **Copy All** on bullets — confirm all bullets joined with newlines
9. Click **Copy** on improved description
10. Click **Regenerate** — confirm spinner + new result
11. Go to `/dashboard/audits` — confirm score badge appears on completed audit
12. Go to `/dashboard` — confirm score badge in Recent Audits
13. Click **Image Studio** CTA — confirm redirect to `/dashboard/image-studio`
14. Test on mobile viewport (360px) — all sections readable, no overflow
15. Force `status: failed` (remove GEMINI_API_KEY) — confirm failed state + Retry button
16. Confirm `npm run build` passes with no TypeScript errors

---

## Not Implemented Yet

- Image generation from listing data
- Stripe credits / credit deduction on submit
- Real Amazon scraping from URL
- PDF export of audit report
