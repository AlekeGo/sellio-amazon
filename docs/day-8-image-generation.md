# Day 8 — Real AI Image Generation Backend

## Goal

Connect real image generation to Image Studio so users can generate Amazon-ready product images from audit briefs.

## Provider

**fal.ai** via the `fal-client` Python package.

## Environment Variables

Add to `.env`:

```
FAL_KEY=<your fal.ai API key>
IMAGE_PROVIDER=fal
FAL_TEXT_TO_IMAGE_MODEL=fal-ai/flux-pro/v1.1
FAL_KONTEXT_MODEL=fal-ai/flux-pro/kontext
```

Get your `FAL_KEY` at https://fal.ai

## Model Strategy

| Use Case | Model |
|---|---|
| Text-to-image (default) | `fal-ai/flux-pro/v1.1` |
| Reference image editing | `fal-ai/flux-pro/kontext` (future) |

Day 8 uses text-to-image only. Reference image handling (kontext) is prepared in env but not wired — local media URLs are not publicly accessible, so passing them to fal.ai is deferred.

## Endpoints

Base path: `/api/images/`

### List Generations

```
GET /api/images/generations/
Authorization: Bearer <token>
```

Optional query param: `?audit_id=<id>`

Returns the authenticated user's image generations, newest first.

### Create Generation

```
POST /api/images/generations/
Authorization: Bearer <token>
Content-Type: application/json

{
  "audit_id": 1,
  "image_type": "Benefit Infographic",
  "prompt": "optional additional instructions",
  "brief": {
    "goal": "Show 3 key benefits clearly",
    "headline": "Clinically Proven Formula",
    "visual_direction": "Clean white background, bold icons",
    "text_elements": ["30-day guarantee", "No side effects"]
  }
}
```

- `audit_id` is optional. If provided, must belong to the requesting user.
- A prompt is built from audit data + brief + user prompt.
- Generation runs synchronously against fal.ai.
- Returns `201` with the generation detail on success.
- Returns `502` with `detail` and `generation` fields on fal.ai failure.

### Get Generation Detail

```
GET /api/images/generations/<id>/
Authorization: Bearer <token>
```

Only the owner can access.

### Retry Failed Generation

```
POST /api/images/generations/<id>/retry/
Authorization: Bearer <token>
```

Only works if generation status is `failed`. Re-runs generation with the same prompt.

## Model: ImageGeneration

| Field | Type | Notes |
|---|---|---|
| id | auto | Primary key |
| user | FK → User | Owner |
| audit | FK → Audit | Optional |
| image_type | CharField | e.g. "Benefit Infographic" |
| prompt | TextField | Full built prompt |
| status | CharField | queued / generating / completed / failed |
| provider | CharField | Default: fal |
| model_name | CharField | e.g. fal-ai/flux-pro/v1.1 |
| image_url | TextField | Remote URL from fal.ai |
| provider_response | JSONField | Full raw response |
| error_message | TextField | Clean error for display |
| created_at | DateTimeField | Auto |
| updated_at | DateTimeField | Auto |
| completed_at | DateTimeField | Set on completion |

## Prompt Builder

`images/services/prompt_builder.py` — `build_image_prompt()` assembles a structured prompt from:
- Product name and category (from audit)
- Image type, goal, headline, visual direction, text elements (from brief)
- Optional user-supplied prompt

Enforced constraints: premium Amazon product infographic, clean ecommerce composition, no Amazon logo, no fake brand logos, no misleading medical/legal claims, no messy tiny text, no copyrighted characters.

## Error Handling

| Scenario | Response |
|---|---|
| FAL_KEY missing | `502` — "Image generation API key is not configured." |
| fal.ai error | `502` — "Image generation failed. Please try again." |
| Audit not found / not owned | `404` |
| Invalid request body | `400` |

Raw fal.ai errors are never exposed to the frontend. They are stored in `provider_response` for internal debugging.

## Frontend Integration (Day 8)

### New Files

- `frontend/src/types/imageGeneration.ts` — `ImageGeneration`, `ImageGenerationStatus`, `CreateImageGenerationPayload` types
- `frontend/src/lib/imageGenerationsApi.ts` — `listImageGenerations`, `createImageGeneration`, `getImageGeneration`, `retryImageGeneration`

### Updated Files

- `frontend/src/pages/AuditImageStudioPage.tsx` — loads generations on mount, `handleGenerate` function, passes generation state to all child components
- `frontend/src/components/image-studio/ImagePackCard.tsx` — real Generate Image / Retry / Re-generate button, dynamic status badge (Planned / Generating / Generated / Failed)
- `frontend/src/components/image-studio/ImageBriefPanel.tsx` — Generate Image button at bottom, loading state, generated image preview, error message on failure
- `frontend/src/components/image-studio/GeneratedImageSlots.tsx` — real image gallery with Open / Download / Copy Prompt per card; empty slots for un-generated types
- `frontend/src/index.css` — `.gen-images-grid` responsive 1→2→3 column layout

### UI Behavior

**Image Pack Cards (`/dashboard/audits/:id/image-studio`)**
- Badge reflects live state: Planned → Generating → Generated / Failed
- "Generate Image" button calls `POST /api/images/generations/` with `audit_id`, `image_type`, and `brief`
- If previous generation failed, button label changes to "Retry" and calls `POST /api/images/generations/<id>/retry/`
- "Preparing Brief" opens the right-side panel

**Brief Panel**
- Shows full creative brief (Goal, Headline, Visual Direction, Text Elements, Buyer Objection, Suggested Layout)
- Prompt Preview with Copy Brief button
- Generate Image button (full-width lime, shows spinner + "Generating Amazon-ready visual..." while in flight)
- Error banner when generation failed ("Image generation failed. Please try again.")
- Generated image thumbnail preview on success

**Generated Images Gallery**
- Loads existing generations for the audit on page open
- One card per image type — generated card or empty slot
- Generated card: image preview, type label, status badge, date, Open / Download / Copy Prompt buttons
- Download tries the `download` attribute; cross-origin images open in a new tab
- Empty slot: image type name + "Ready for generation"
- Progress bar + counter updates in real time

**General `/image-studio` page** — unchanged; still shows overview CTA linking to audits

**Audit report** — "Generate Image Pack" CTA still routes to `/dashboard/audits/:id/image-studio`

### Routes

All generation routes proxied via `VITE_API_BASE_URL` (default `http://127.0.0.1:8000/api`):
- `GET  /images/generations/?audit_id=<id>`
- `POST /images/generations/`
- `GET  /images/generations/<id>/`
- `POST /images/generations/<id>/retry/`

### Manual Test Checklist

- [ ] Open an audit with a completed Gemini result — Image Studio loads without errors
- [ ] Open Image Studio for an audit with no prior generations — all 6 slots show "Ready for generation"
- [ ] Click "Prepare Brief" on a card — brief panel opens with correct data and prompt preview
- [ ] Click "Copy Brief" — prompt text is copied to clipboard
- [ ] Click "Generate Image" on a card — button shows spinner and "Generating..."
- [ ] Wait for generation (30–90 s typical) — status badge flips to "Generated", image appears in gallery
- [ ] Click "Open" on a generated image card — opens fal.ai URL in new tab
- [ ] Click "Download" on a generated image card — triggers download or opens in new tab
- [ ] Click "Copy Prompt" on a generated image card — backend prompt copied to clipboard
- [ ] Click "Generate Image" from brief panel — same flow, shows preview thumbnail on success
- [ ] Simulate a failed generation (e.g., invalid FAL_KEY) — badge shows "Failed", card shows error, brief panel shows error banner
- [ ] Click "Retry" on a failed card / "Retry Generation" in brief panel — retries via `/retry/` endpoint
- [ ] Reload the page — previously generated images reload from the API
- [ ] Progress bar reflects completed / total count correctly
- [ ] On mobile: cards stack single column, brief panel renders below pack list, gallery is 1–2 cols
- [ ] Auth still works; New Audit still works; Gemini analysis still works

## What Is Not Implemented Yet

- **Stripe credits** — generation is free for all authenticated users for now
- **Batch generation** — one image per request
- **Google Cloud Storage** — images are stored as remote fal.ai URLs only; URLs may expire
- **PNG/JPG export polish** — download button wiring to frontend
- **Reference image (kontext)** — deferred; local media URLs are not publicly accessible
- **Replicate previews** — not implemented; fal.ai is the sole provider

## Files Changed / Created

### New Files
- `backend/images/models.py` — ImageGeneration model
- `backend/images/serializers.py` — List, Detail, Create serializers
- `backend/images/views.py` — 3 API views
- `backend/images/urls.py` — URL routing
- `backend/images/admin.py` — Admin registration
- `backend/images/services/__init__.py`
- `backend/images/services/fal_image_service.py` — fal.ai integration
- `backend/images/services/prompt_builder.py` — prompt assembly
- `backend/images/migrations/0001_initial.py` — auto-generated

### Updated Files
- `backend/config/urls.py` — added `/api/images/` route
- `backend/requirements.txt` — added `fal-client==1.0.0`
- `.env` — added FAL_KEY, IMAGE_PROVIDER, model vars

## Setup Commands

```bash
# Install dependency (if not already)
pip install fal-client

# Run migrations
python manage.py makemigrations images
python manage.py migrate

# Verify
python manage.py check
```
