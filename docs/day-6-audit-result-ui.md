# Day 6 — Premium Audit Result UI

## Goal

Turn `/dashboard/audits/:id` into a premium paid SaaS report experience — the Sellio AI Audit Report. Every completed audit now renders a full structured report that feels immediately valuable.

---

## Report Sections

When `status === completed` and `result` exists:

| Section | Data Source |
|---|---|
| Report Header | product_name, category, status, entry_type, created_at, score, score_label |
| Sellio Score | score, score_label, score bar + Conversion Diagnosis mini-cards |
| Executive Summary | executive_summary |
| Weak Points | weak_points[].area / issue / impact / fix |
| Copy Upgrade | improved_title + title_analysis, improved_bullets, improved_description + description_analysis |
| Keyword Opportunities | keyword_opportunities[].keyword / reason |
| Review Insights | review_insights[].signal / what_it_means / listing_fix |
| Buyer Objections | buyer_objections[].objection / how_to_address |
| A+ Content Ideas | a_plus_content_ideas[].section / purpose / content_idea |
| Image Pack Plan | image_pack_plan[].image_type / goal / headline / visual_direction / text_elements |
| Priority Checklist | priority_checklist[].priority / task / reason |
| Image Studio CTA | Static banner → /dashboard/image-studio |

---

## UX Behaviour

### Report Header (completed only)
- Shows product name (large), category, status badge, entry type badge, created date
- Score ring (140px) + score label on the right
- Subtle radial glow tinted to score color (lime/amber/orange)
- CTAs: Back to All Audits, Generate Image Pack

### Score Section
- Score ring (120px) + score label + contextual description + score bar
- Regenerate button inline
- Conversion Diagnosis mini-cards (Attention / Trust / Clarity / Conversion) below the ring, each color-coded with icon

### Copy Upgrade
- Grouped under single `Copy Upgrade` section label
- Improved Title: highlighted lime card, Copy Title button
- Improved Bullets: numbered cards, individual copy + Copy All
- Improved Description: pre-wrap text card, Copy Description button
- All copy buttons use `navigator.clipboard` with "Copied" confirmation state

### Image Pack Plan
- Premium creative brief cards — each image has a numbered badge + type name header
- Fields: Goal / Headline / Visual Direction / Text Elements
- Generate Image Pack CTA button in section header

### Priority Checklist
- High / Medium / Low colored badges
- Task + reason on each row

### Status States
- `pending_analysis`: spinner + "Analyzing your Amazon listing..." auto-polls every 3s
- `failed`: "Analysis could not be completed. Gemini is temporarily busy." + Try Again button
- `draft` / `ready_for_analysis`: prompt to Analyze Listing with submit button
- `completed` but no result: prompt to Regenerate

---

## Files Changed

| File | Change |
|---|---|
| `frontend/src/pages/AuditDetailPage.tsx` | Full premium rebuild — ReportHeader, upgraded ScoreCard with diagnosis mini-cards, SL with lime accent bar, grouped Copy Upgrade, premium Image Pack Plan |
| `frontend/src/pages/AuditsListPage.tsx` | Polished AuditCard with hover state, ScorePill, explicit "Open Report →" button, premium empty state |
| `frontend/src/pages/DashboardPage.tsx` | Updated RecentAuditItem with "Open Report →" link, better empty state |

---

## Routes (all unchanged)

```
/dashboard/audits        AuditsListPage
/dashboard/audits/:id    AuditDetailPage
/dashboard               DashboardPage
/dashboard/image-studio  ImageStudioPage (CTA target)
```

---

## Manual Test Checklist

- [ ] Create a new audit via /dashboard/new-audit
- [ ] Submit for analysis — pending_analysis spinner shows, auto-polls
- [ ] After completion — premium report header renders with score ring
- [ ] Sellio Score section shows score ring + bar + 4 diagnosis cards
- [ ] Copy Title button copies text and shows "Copied" state
- [ ] Copy All bullets copies all bullets
- [ ] Copy individual bullet works
- [ ] Copy Description works
- [ ] Keyword chips display with lime pill + reason text
- [ ] Image Pack Plan shows creative brief cards with numbered badges
- [ ] Generate Image Pack CTA routes to /dashboard/image-studio
- [ ] Priority Checklist shows High/Medium/Low badges
- [ ] /dashboard/audits shows audits with score pill + Open Report button
- [ ] Dashboard recent audits show Open Report link
- [ ] Mobile: report header stacks score below product info
- [ ] Mobile: cards stack and text does not overflow
- [ ] Failed state shows user-friendly message + Try Again button
- [ ] Google Sign-In still works
- [ ] New Audit flow still works
- [ ] `npm run build` passes with no TypeScript errors

---

## Not Yet Implemented

- Image generation (Image Studio is placeholder)
- Stripe / billing
- PDF export
- Amazon scraping / auto-populate from URL
