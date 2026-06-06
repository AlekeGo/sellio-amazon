# Day 4 — New Audit Flow

## Goal

Implement the full New Audit flow: backend API + frontend multi-step UI. Users can start an audit either by pasting an Amazon product URL or by uploading product photos, fill in listing details, and submit it for future AI analysis.

---

## Backend

### Models

#### Audit

| Field | Type | Notes |
|---|---|---|
| id | BigAutoField | PK |
| user | ForeignKey → accounts.User | CASCADE |
| entry_type | CharField | `amazon_url` or `product_photos` |
| status | CharField | see Status Flow |
| amazon_url | URLField | optional |
| product_name | CharField(500) | |
| category | CharField(255) | |
| main_benefit | TextField | |
| current_title | CharField(500) | |
| bullet_points | TextField | |
| description | TextField | |
| backend_keywords | TextField | |
| price | CharField(50) | stored as string |
| rating | CharField(20) | stored as string |
| review_count | CharField(20) | stored as string |
| target_audience | TextField | |
| seller_goal | TextField | |
| notes | TextField | |
| created_at | DateTimeField | auto |
| updated_at | DateTimeField | auto |
| submitted_at | DateTimeField | nullable |

#### AuditImage

| Field | Type | Notes |
|---|---|---|
| id | BigAutoField | PK |
| audit | ForeignKey → Audit | CASCADE |
| image | ImageField | uploaded to `media/audit_images/` |
| original_filename | CharField(255) | |
| uploaded_at | DateTimeField | auto |

---

### Status Flow

```
draft → pending_analysis → completed
                        ↘ failed
```

- **draft** — created, still being edited
- **pending_analysis** — submitted via POST /submit/
- **completed** — AI analysis done (Day 5+)
- **failed** — something went wrong (Day 5+)

Only `draft` and `ready_for_analysis` audits can be submitted.

---

### Endpoints

All require `Authorization: Bearer <access_token>`.

| Method | URL | Description |
|---|---|---|
| GET | /api/audits/ | List user's audits (newest first) |
| POST | /api/audits/ | Create audit |
| GET | /api/audits/:id/ | Get full audit detail + images |
| PATCH | /api/audits/:id/ | Partial update |
| POST | /api/audits/:id/submit/ | Submit → pending_analysis |
| POST | /api/audits/:id/images/ | Upload images (multipart) |
| DELETE | /api/audits/:id/images/:image_id/ | Delete image |

---

## Frontend

### New Files

| File | Purpose |
|---|---|
| `src/types/audit.ts` | TypeScript types: `AuditDetail`, `AuditListItem`, `AuditImage`, `CreateAuditPayload`, `EntryType`, `AuditStatus` |
| `src/lib/auditsApi.ts` | API client: `listAudits`, `createAudit`, `getAudit`, `updateAudit`, `submitAudit`, `uploadAuditImages`, `deleteAuditImage` |
| `src/components/ui/StatusBadge.tsx` | Shared status badge component with color coding for all 5 statuses |
| `src/pages/AuditDetailPage.tsx` | Route: `/dashboard/audits/:id` |
| `src/pages/AuditsListPage.tsx` | Route: `/dashboard/audits` |

### Modified Files

| File | Change |
|---|---|
| `src/pages/NewAuditPage.tsx` | Full rewrite: 3-step multi-step flow |
| `src/pages/DashboardPage.tsx` | Recent audits section fetches real API data |
| `src/components/layout/DashboardLayout.tsx` | Updated nav: Results → Audits (`/dashboard/audits`) |
| `src/App.tsx` | Added routes for `/dashboard/audits` and `/dashboard/audits/:id` |

---

### Routes

| Route | Component | Description |
|---|---|---|
| `/dashboard` | DashboardPage | Shows real recent audits from API |
| `/dashboard/new-audit` | NewAuditPage | 3-step multi-step audit creation |
| `/dashboard/audits` | AuditsListPage | Full audit history list |
| `/dashboard/audits/:id` | AuditDetailPage | Single audit detail + pending notice |
| `/dashboard/results` | ResultsPage | Kept for backwards compatibility |
| `/dashboard/image-studio` | ImageStudioPage | Unchanged |
| `/dashboard/billing` | BillingPage | Unchanged |
| `/dashboard/settings` | SettingsPage | Unchanged |

---

### New Audit UX Flow

**Step 1 — Choose type**
Two clickable option cards:
- Paste Amazon URL (for existing listings)
- Upload Product Photos (from scratch)

**Step 2A — Amazon URL**
- URL input with Amazon domain validation
- Note: "Auto-fill will be connected soon. For now, confirm or add the missing listing details manually."
- Back + Continue

**Step 2B — Product Photos**
- Drag-and-drop file upload zone with image previews
- Product name (required), category (required), main benefit (required)
- Back + Continue

**Step 3 — Confirm & Submit**

For `amazon_url`:
- Amazon URL (editable)
- Product name, category
- Price, rating, review count
- Current title, bullet points, description
- Main benefit, seller goal (optional), notes (optional)

For `product_photos`:
- Image previews
- Product name, category, main benefit
- Target audience (optional), seller goal (optional), notes (optional)

**Submit action:**
1. `POST /api/audits/` — create audit with all form data
2. `POST /api/audits/:id/images/` — upload images if product_photos flow
3. `POST /api/audits/:id/submit/` — move to pending_analysis
4. Redirect to `/dashboard/audits/:id`

---

### Status Badge Colors

| Status | Color |
|---|---|
| draft | Gray |
| ready_for_analysis | Blue |
| pending_analysis | Amber/Yellow |
| completed | Green |
| failed | Red |

---

## Commands

```bash
# Backend (run from backend/)
python manage.py runserver

# Frontend (run from frontend/)
npm run dev

# Build check
npm run build
```

---

## Manual Test Checklist

### Backend
- [ ] `GET /api/audits/` with Bearer token returns `[]`
- [ ] `POST /api/audits/` with `amazon_url` entry creates audit (201)
- [ ] `POST /api/audits/` with `product_photos` + image upload creates audit with image
- [ ] `POST /api/audits/` without `amazon_url` when `entry_type=amazon_url` returns 400
- [ ] `GET /api/audits/<id>/` returns full detail with images
- [ ] `POST /api/audits/<id>/submit/` sets status to `pending_analysis`
- [ ] `POST /api/audits/<id>/submit/` again returns 400
- [ ] `POST /api/audits/<id>/images/` uploads additional images
- [ ] `DELETE /api/audits/<id>/images/<image_id>/` removes image (204)

### Frontend

**New Audit flow:**
- [ ] `/dashboard/new-audit` shows Step 1 with two option cards
- [ ] Clicking "Paste Amazon URL" card → Step 2A
- [ ] Clicking "Upload Product Photos" card → Step 2B
- [ ] Step indicator shows correct current step
- [ ] Amazon URL step: invalid URL shows error, valid URL advances to Step 3
- [ ] Product Photos step: empty required fields show error, filled fields advance
- [ ] File upload zone accepts drag-and-drop and click-to-browse
- [ ] Image previews show in upload zone with remove (×) button
- [ ] Back buttons navigate back without losing form data
- [ ] Step 3 (amazon_url): all listing fields are visible and editable
- [ ] Step 3 (product_photos): images shown, optional fields marked
- [ ] "Analyze Listing" button disabled/loading during submit
- [ ] On success, redirects to `/dashboard/audits/:id`
- [ ] On error, shows error banner with message

**Audit detail page:**
- [ ] `/dashboard/audits/:id` loads and shows audit data
- [ ] Status badge shows correct color and label
- [ ] Uploaded images shown in grid
- [ ] Amazon URL shown as clickable external link
- [ ] "Awaiting AI analysis" notice is displayed
- [ ] "Back to Dashboard" and "Create Another Audit" CTAs work

**Audits list page:**
- [ ] `/dashboard/audits` loads and shows all audits
- [ ] Empty state shown when no audits
- [ ] Each row shows name, category, status badge, entry type, date
- [ ] Clicking a row navigates to detail page

**Dashboard:**
- [ ] Recent audits section fetches and shows real data
- [ ] "View all" link shown when audits exist, links to `/dashboard/audits`
- [ ] Empty state shown when no audits
- [ ] Sidebar nav shows "Audits" pointing to `/dashboard/audits`

**Auth & routes:**
- [ ] Unauthenticated users redirected to `/login` for all `/dashboard/*` routes
- [ ] Google Sign-In still works
- [ ] `/`, `/login`, `/signup` still work
- [ ] `npm run build` passes with no TypeScript errors

---

## Not Implemented Yet (Postponed to Day 5+)

- **Gemini / AI analysis** — no AI calls, no report generation
- **Real Amazon scraping** — `amazon_url` saved as-is, no data fetching
- **Image generation** — no AI image creation
- **Stripe credits** — no payment gating
- **PATCH audit** — update endpoint exists in backend but not wired to frontend edit flow
- **Token refresh** — access tokens expire after 1h, users re-login
