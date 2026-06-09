# Day 13.4 — Product-Locked Image Generation UX

## Goal

Make it clear to users that Sellio generates images from their uploaded product photos, not from random text prompts. Users should immediately understand whether their product identity is locked or not, and what that means for output quality.

---

## Backend (no changes — already complete from Day 13)

The backend already returns all fields needed for this UX:

| Field | Values | Meaning |
|---|---|---|
| `generation_mode` | `reference_based` / `text_fallback` | Whether a reference image was used |
| `product_locked` | `true` / `false` | Whether a product photo was found at generation time |
| `reference_image_url` | URL or empty | The uploaded image URL passed to fal.ai |
| `warning` | string or null | Set when `generation_mode == text_fallback` |

These fields are exposed on `ImageGenerationListSerializer` and `ImageGenerationDetailSerializer`.

The fal service sets `generation_mode`:
- `reference_based` — fal-ai/flux-pro/kontext with `image_url` reference
- `text_fallback` — fal-ai/flux/schnell text-to-image only

---

## Frontend changes

### New component: `ProductReferenceStatus`

**File:** `frontend/src/components/image-studio/ProductReferenceStatus.tsx`

Placed near the top of `AuditImageStudioPage`, immediately below the progress bar.

**When product photos exist:**
- Green bordered panel
- 64×64 thumbnail of first uploaded photo
- "Reference product detected" heading with ShieldCheck icon
- "Using your uploaded product photo" (teal) + "Product identity locked" (muted) lines
- If multiple photos: "Using 1 of N product reference photos"
- Additional 32×32 thumbnails for photos 2–4 (with +N overflow count if > 4)
- "Photorealistic ecommerce mode" badge (teal, Camera icon)

**When no product photos:**
- Amber dashed border warning panel
- AlertTriangle icon
- "No product reference photo found" heading
- "Sellio will generate an approximate product from text only. For best accuracy, upload 1–3 clean product photos on a clean background."
- CTA link: "Add product photos in New Audit →" (links to `/dashboard/new-audit`)

Props: `images: AuditImage[]`, `auditId?: number`

---

### Updated component: `ImageBriefPanel`

**File:** `frontend/src/components/image-studio/ImageBriefPanel.tsx`

Changes:

1. **New prop:** `hasReference?: boolean` (default `false`) — controls all reference-aware UX

2. **Header badge:** "Photorealistic ecommerce mode" badge added to panel header
   - Teal when `hasReference === true`
   - Gray when `hasReference === false`

3. **Field rename:** "Product visual details" → **"Extra visual instruction — optional"**
   - Helper text below: "Sellio already builds the prompt from your product and audit. Use this only for extra style or layout direction."

4. **Reference status strip** (above generate button):
   - With reference: green strip, Camera icon — "Your product photo will be used as the visual reference."
   - Without reference: amber strip, AlertTriangle icon — "No reference photo detected. Result may be less accurate."

5. **Error state preserved** — `generation?.status === 'failed'` message stays visible; page/form state is not cleared on error.

6. **Prompt preview** — buildPrompt() includes `PRODUCT IDENTITY LOCK` instruction when `hasReference === true`.

---

### Updated component: `GeneratedImageSlots` / `GeneratedCard`

**File:** `frontend/src/components/image-studio/GeneratedImageSlots.tsx`

Each completed image card now shows:

- **`generation_mode` badge:**
  - `reference_based` → "Reference-based" (teal)
  - `text_fallback` → "Text fallback" (amber)
- **`product_locked` badge:** "Product locked: Yes" (lime) / "Product locked: No" (gray)
- **`warning`** — if backend returns a warning string, shown as amber inline alert with AlertTriangle icon
- **Model info** — if `model_name` present: `{provider} · {model_name}` (small muted line)

Mobile: `.gen-images-grid` CSS class — 1 col → 2 col at 640px → 3 col at 1024px.

---

### Updated page: `AuditImageStudioPage`

**File:** `frontend/src/pages/AuditImageStudioPage.tsx`

- `<ProductReferenceStatus images={audit.images ?? []} />` placed after progress bar
- `hasReference={(audit.images ?? []).length > 0}` passed to `<ImageBriefPanel>`
- **DEFAULT_ITEMS updated** to use clean spec-aligned type names:
  - Hero Image
  - Benefit Infographic
  - Lifestyle
  - Comparison
  - How-to
  - A+ Brand Visual

The backend `_get_type_instruction()` in `prompt_builder.py` handles all these names via keyword matching (`'hero' in t`, `'lifestyle' in t`, `'comparison' in t`, `'how' in t`, `'brand' in t`).

---

### Updated types: `ImageGeneration`

**File:** `frontend/src/types/imageGeneration.ts`

Added fields:
- `generation_mode?: string`
- `product_locked?: boolean`
- `reference_image_url?: string`
- `warning?: string | null`

---

## How the user sees product lock status

| Where | What they see |
|---|---|
| Top of Image Studio | Green panel with thumbnail + "Reference product detected" / OR amber warning |
| Brief panel header | "Photorealistic ecommerce mode" badge (teal = locked, gray = not) |
| Above generate button | Green strip "Your product photo will be used..." / OR amber "No reference detected..." |
| Each generated image card | "Reference-based" teal badge + "Product locked: Yes" lime badge / OR fallback variants |
| Card warning line | Amber inline alert if backend sets `warning` |

---

## Test checklist

### Reference status panel

- [ ] Open Image Studio for an audit with 1 uploaded photo → green panel shows with thumbnail, "Reference product detected", "Using your uploaded product photo", "Product identity locked"
- [ ] Open Image Studio for an audit with 3 uploaded photos → shows "Using 1 of 3 product reference photos", shows 2 secondary thumbnails
- [ ] Open Image Studio for an audit with no uploaded photos → amber dashed warning panel shows with "No product reference photo found" message and "Add product photos in New Audit →" link
- [ ] Click "Add product photos in New Audit →" → navigates to `/dashboard/new-audit`

### ImageBriefPanel

- [ ] Select any image type with reference photos → green strip above generate button: "Your product photo will be used as the visual reference."
- [ ] Select any image type without reference photos → amber strip: "No reference photo detected. Result may be less accurate."
- [ ] Textarea label shows "Extra visual instruction — optional"
- [ ] Helper text visible below textarea: "Sellio already builds the prompt from your product and audit..."
- [ ] "Photorealistic ecommerce mode" badge visible in panel header (teal when reference, gray otherwise)

### Image type selection

- [ ] Image Pack shows 6 types: Hero Image, Benefit Infographic, Lifestyle, Comparison, How-to, A+ Brand Visual
- [ ] Each type opens a pre-built creative brief (goal, headline, visual direction, text elements)
- [ ] No manual prompt required — textarea is optional and labeled as such

### Generated image cards

- [ ] Generate an image with reference photo → card shows "Reference-based" teal badge and "Product locked: Yes" lime badge
- [ ] Generate an image without reference photo → card shows "Text fallback" amber badge and "Product locked: No" gray badge
- [ ] If warning returned from backend → shown as amber inline alert in the card
- [ ] Model name line shows `fal · fal-ai/flux-pro/kontext` (reference) or `fal · fal-ai/flux/schnell` (fallback)

### Error handling

- [ ] If generation fails → error message appears in ImageBriefPanel, image type selection preserved, extra instruction preserved, page state not cleared
- [ ] Failed generations appear in collapsible "Failed generations" section in gallery

### Billing / paywall

- [ ] Paywall still triggers at 0 image credits
- [ ] PaywallBlock renders correctly above the studio

### Mobile

- [ ] ProductReferenceStatus panel wraps correctly on narrow screens (flexWrap: wrap)
- [ ] Generated image cards use 1-col on mobile, 2-col at 640px
- [ ] Badge rows wrap instead of overflow on small cards

### Build

- [ ] `npm run build` passes with zero TypeScript errors

---

## Commands to run

```bash
# Frontend dev server
cd frontend && npm run dev

# Build check
cd frontend && npm run build

# Backend dev server (separate terminal)
cd backend && python manage.py runserver

# Apply migration (if not already done)
cd backend && python manage.py migrate
```
