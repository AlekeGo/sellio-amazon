# Day 9 — Generated Images UX

## Goal

Make generated image management in Sellio Image Studio feel production-ready:
gallery, preview modal, server-side download, regenerate, delete, prompt history, quality controls.

---

## Backend Endpoints Added

### GET /api/images/generations/\<id\>/download/
- Auth required; owner-only
- Fetches remote image_url from fal.media via `requests`
- Returns as `HttpResponse` with `Content-Disposition: attachment`
- Filename: `sellio-{id}-{image-type-slug}.jpg`
- Returns 502 if remote fetch fails (frontend falls back to opening original URL)

### DELETE /api/images/generations/\<id\>/
- Auth required; owner-only
- Deletes `ImageGeneration` record from database
- Does NOT attempt to delete the remote fal.media file
- Returns 204 No Content on success

### POST /api/images/generations/\<id\>/regenerate/
- Auth required; owner-only
- Creates a NEW `ImageGeneration` using same audit, image_type, prompt, brief, and quality fields
- Calls fal.ai with the existing prompt
- Returns new generation (does not overwrite original)
- Returns 201 on success, 502 if fal.ai fails (with failed generation in response)

---

## Model Changes

New fields on `ImageGeneration` (migration `0002`):
- `brief` — JSONField, optional; stores creative brief dict
- `product_visual_details` — TextField, blank=True
- `style_direction` — CharField(100), blank=True
- `background_preference` — CharField(100), blank=True
- `text_intensity` — CharField(50), blank=True

All fields are nullable/blank-safe, no old records broken.

---

## Serializer Changes

Both `ImageGenerationListSerializer` and `ImageGenerationDetailSerializer` now expose:
`id`, `audit_id`, `image_type`, `prompt`, `status`, `provider`, `model_name`,
`image_url`, `error_message`, `brief`, `product_visual_details`, `style_direction`,
`background_preference`, `text_intensity`, `created_at`, `updated_at`, `completed_at`

`ImageGenerationCreateSerializer` now accepts `product_visual_details`, `style_direction`,
`background_preference`, `text_intensity` as top-level fields (separate from `brief`).

---

## Prompt Builder Changes

`build_image_prompt()` now accepts `style_direction`, `background_preference`, `text_intensity`.
These are appended to the prompt before the style/constraints block.

---

## Frontend UX Added

### GeneratedImageSlots (rewritten)
- Gallery grid with completed images first, failed separately
- Per-card actions: Preview, Download (server-side), Regenerate, Copy Prompt, Delete
- Delete shows inline confirm (Yes/No) — no browser dialog
- Download calls backend `/download/` endpoint; fallback: opens original URL in new tab
- Regenerate calls `/regenerate/` endpoint; new image appended to gallery
- Spinner per-card during regenerate

### ImagePreviewModal (new component)
- Large image preview on click
- Image type, status badge, created/completed date, model info
- Action buttons: Download, Open Original, Regenerate, Copy Prompt, Delete
- Delete shows inline confirm with Confirm Delete / Cancel
- Expandable Prompt section (collapsed by default)
- Close on Escape key, click outside, or X button
- Scroll-lock while open

### ImageBriefPanel (updated)
- Added Quality Controls section with:
  - Product visual details (textarea)
  - Style direction (select: Premium ecommerce, Clean Amazon infographic, Luxury product ad, Minimal studio, Bold conversion-focused)
  - Background preference (select: Clean light, Dark premium, Soft gradient, Lifestyle-inspired)
  - Text intensity (select: Minimal, Balanced, More explanatory)
- Prompt preview updates live as quality controls change
- `onGenerate` now passes full `QualityOptions` object

### AuditImageStudioPage (updated)
- `handleDelete` — removes generation from local state after successful DELETE
- `handleRegenerate` — appends new generation; tracked by ID via `regeneratingIds` Set
- `handleGenerate` now passes quality options to API
- `regeneratingIds` passed to gallery for per-card loading state

### ImageStudioPage (updated)
- Removed "Coming Day 8" from workflow steps
- Updated subtitle and CTA copy

---

## Download Behavior

Images are still stored on fal.media CDN (not GCS). The download endpoint acts as a server-side proxy:
1. Backend fetches `image_url` via `requests.get(timeout=30)`
2. Returns full binary response to client
3. Browser triggers native file download
4. If backend fetch fails → returns 502 → frontend opens `image_url` in new tab

---

## Migration Commands

```bash
python manage.py makemigrations images
python manage.py migrate
python manage.py check
```

---

## Manual Test Checklist

- [ ] Generate a new image — appears in gallery
- [ ] Click image card — preview modal opens
- [ ] Preview modal: image displays correctly
- [ ] Preview modal: Close on X button
- [ ] Preview modal: Close on Escape key
- [ ] Preview modal: Close on backdrop click
- [ ] Download from card — file saves as sellio-{id}-{type}.jpg
- [ ] Download from modal — same
- [ ] Open Original — opens fal.media URL in new tab
- [ ] Copy Prompt — copies prompt text to clipboard
- [ ] Regenerate from card — spinner shows, new image appended
- [ ] Regenerate from modal — same; modal closes
- [ ] Delete from card — confirm dialog, then image removed
- [ ] Delete from modal — same; modal closes
- [ ] Quality controls: style direction changes prompt preview
- [ ] Quality controls: background preference changes prompt preview
- [ ] Quality controls: text intensity changes prompt preview
- [ ] Generate with quality controls — prompt includes the chosen values
- [ ] Failed image appears in Failed section
- [ ] Empty gallery shows empty state
- [ ] /image-studio page shows no "Coming Day 8" text
- [ ] Auth still works
- [ ] Google Sign-In still works
- [ ] New Audit flow still works
- [ ] Gemini AI audit still works
- [ ] fal.ai generation still works

---

## Not Yet Implemented

- Stripe credits / usage limits
- Batch generation (all 6 at once)
- Google Cloud Storage (images still on fal.media, may expire)
- Kontext / reference image generation
- PDF export
