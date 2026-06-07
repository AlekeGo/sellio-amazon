# Day 7 — Image Studio UI

## Goal

Build the full Image Studio structure and UI for Sellio, connected to existing AI audit reports.
No real image generation — pure UI and data preparation for Day 8.

---

## Routes Added

| Route | Component | Description |
|---|---|---|
| `/image-studio` | `ImageStudioPage` | General Image Studio overview (polished) |
| `/dashboard/image-studio` | `ImageStudioPage` | Same page via dashboard alias |
| `/dashboard/audits/:id/image-studio` | `AuditImageStudioPage` | Audit-specific Image Studio |

---

## Image Studio UX

### General `/image-studio`

Shown when no audit is selected. Displays:
- Header with gradient title and CTAs (Choose an Audit / Start New Audit)
- How It Works — 4-step workflow (01 Audit → 02 Studio → 03 Generate → 04 Download)
- Image pack categories grid — 6 types with goal descriptions
- Bottom CTA card linking to `/dashboard/audits`

### Audit-specific `/dashboard/audits/:id/image-studio`

Loads audit by ID and shows:
1. **ImageStudioHeader** — product name, category, score ring (72px), status badge, Back to Report + Dashboard breadcrumbs
2. **Progress bar** — 0 / N generated with status legend (Planned / Ready / Generated / Needs review)
3. **Reference images** — uploaded product photos if any, placeholder if none
4. **Two-column layout** (desktop) / single column (mobile):
   - Left: ImagePackCard list — one per image type
   - Right: ImageBriefPanel (sticky) — shows when card is selected
5. **GeneratedImageSlots** — 4 empty slots labeled "Coming Day 8"
6. **Bottom CTAs** — Back to Report / Dashboard / Start New Audit

---

## Image Pack Categories (6 types)

| Type | Goal |
|---|---|
| Main Image Refresh | Drive click-through with hero image |
| Benefit Infographic | Communicate value visually |
| Comparison Graphic | Disqualify alternatives |
| How It Works Visual | Show ease of use in 3–4 steps |
| Lifestyle Visual | Build emotional connection |
| A+ Banner Concept | Elevate brand trust |

---

## Components Created

```
src/components/image-studio/
  ImageStudioHeader.tsx   — Audit metadata header with score ring, status, back links
  ImagePackCard.tsx       — Individual image type card with Prepare Brief / Generate buttons
  ImageBriefPanel.tsx     — Detailed creative brief panel with prompt preview + Copy Brief
  GeneratedImageSlots.tsx — 4 empty image slots with "Coming Day 8" placeholder
```

```
src/pages/
  AuditImageStudioPage.tsx  — New: /dashboard/audits/:id/image-studio
  ImageStudioPage.tsx       — Updated: polished general /image-studio page
```

---

## Audit Report Integration

`AuditDetailPage.tsx` updated — all 3 Image Studio buttons now link to the audit-specific route:

- ReportHeader: `Generate Image Pack` → `/dashboard/audits/:id/image-studio`
- Image Pack Plan section: `Open in Image Studio` → `/dashboard/audits/:id/image-studio`
- Bottom CTA card: `Open Image Studio` → `/dashboard/audits/:id/image-studio`

---

## Data Flow

- `AuditImageStudioPage` loads audit via `getAudit(id)`
- If `audit.result?.image_pack_plan` has items → uses them
- If not → falls back to 6 DEFAULT_ITEMS (predefined briefs for each category)
- `ImagePackPlanItem` type updated to include optional `buyer_objection` and `suggested_layout` fields

---

## What Is Ready for Day 8

- All 6 image pack cards with full brief data (populated from audit or defaults)
- Generated prompt preview built from product context (image type, goal, headline, visual direction, text elements)
- Copy Brief button for clipboard export
- 4 generated image slots ready to receive real images
- Reference images area (shows uploaded product photos)
- Progress tracker (0 / N generated)

---

## What Is NOT Implemented Yet

- **Real image generation** — fal.ai and Replicate not connected
- **Stripe credits** — no credit gate on generation buttons
- **PNG/JPG export** — no download functionality
- **Brief save to backend** — editable brief is frontend-only state
- **Image status updates** — all items show "Planned" only
