# Sellio Design System — Calm Premium Commerce SaaS

## Brand Mood

Sellio is an AI Amazon Conversion Studio. The visual language should communicate **clarity, precision, and commercial confidence** — the feeling of a professional tool that makes sellers look and feel smarter.

Not dark. Not neon. Not generic AI. Not cluttered.
Think: a polished SaaS product a CFO would trust, that a first-time seller would still find approachable.

---

## Color Palette

### Primary (Calm Indigo-Purple)

| Token | Value | Use |
|---|---|---|
| `--sl-primary` | `#5B5BD6` | CTA buttons, active states, links |
| `--sl-primary-deep` | `#4747B8` | Button hover, pressed state |
| `--sl-primary-soft` | `#7C7CF8` | Chart highlights, icon accents |
| `--sl-primary-subtle` | `#EEEEFF` | Chip backgrounds, soft highlights |
| `--sl-primary-muted` | `#C8C8F8` | Chip borders, decorative rings |

### Surfaces

| Token | Value | Use |
|---|---|---|
| `--sl-surface` | `#FFFFFF` | Default page background |
| `--sl-surface-soft` | `#F8F8FC` | Feature bands, form section backgrounds |
| `--sl-surface-warm` | `#F2EEFF` | Alternating warm band, hero interlude |

### Text

| Token | Value | Use |
|---|---|---|
| `--sl-ink` | `#1C1C3A` | Body text — deep navy-purple, not pure black |
| `--sl-ink-secondary` | `#3D3D5C` | Secondary labels, descriptions |
| `--sl-ink-muted` | `#7A7A9A` | Captions, helper text, placeholders |

### Borders & Lines

| Token | Value | Use |
|---|---|---|
| `--sl-border` | `#E2E2EE` | Card borders, dividers |
| `--sl-border-input` | `#C0C0D8` | Form input borders |

### Semantic

| Token | Value | Use |
|---|---|---|
| `--sl-score-hi` | `#059669` | High score bars, success states |
| `--sl-score-mid` | `#D97706` | Mid score bars, warning states |
| `--sl-score-low` | `#DC2626` | Low score bars, critical issues |
| `--sl-accent-amber` | `#F59E0B` | Pro badge, upgrade highlights |

### What NOT to use
- No pure black (`#000000`) anywhere
- No neon green, lime, or cyan
- No dark backgrounds for marketing surfaces
- No red/orange as primary CTA color
- No gradient-heavy button fills (gradients only on score bars and the mesh hero)

---

## Typography

### Font Family

**Inter** — already loaded via Google Fonts. Use only Inter.

- Display: weight 300 with negative letter-spacing
- UI text: weight 400 (readable, standard)
- Labels/headings: weight 500–600
- Tabular data (scores, credits, prices): `font-variant-numeric: tabular-nums`

Apply globally: `font-feature-settings: "cv11", "ss01"` (Inter's clean variants).

### Type Scale

| Role | Size | Weight | Tracking | Line Height |
|---|---|---|---|---|
| Display XXL | `clamp(2rem, 5vw, 3.25rem)` | 300 | -0.04em | 1.04 |
| Display XL | `clamp(1.75rem, 4vw, 2.625rem)` | 300 | -0.03em | 1.1 |
| Display LG | `clamp(1.25rem, 2.5vw, 2rem)` | 400 | -0.02em | 1.15 |
| Display MD | `1.5rem` | 400 | -0.01em | 1.2 |
| Heading LG | `1.25rem` | 600 | 0 | 1.3 |
| Heading MD | `1.0625rem` | 600 | 0 | 1.35 |
| Body Lead | `1rem` | 400 | 0 | 1.65 |
| Body | `0.9375rem` | 400 | 0 | 1.6 |
| Caption | `0.8125rem` | 400 | 0 | 1.5 |
| Micro Cap | `0.6875rem` | 600 | +0.08em | 1.15 (uppercase) |

### Principles
- Display sizes always render at weight 300 — the editorial lightness is the brand signature
- Negative tracking on large text (display tiers), zero tracking on body
- `tabular-nums` on all scores, credits, prices — never free-width digits next to data
- No center alignment in forms or tables — reserve centering for hero/CTA sections

---

## Buttons

### Primary (filled, pill)
- Background: `--sl-primary`
- Text: white, 500 weight, 0.9375rem
- Padding: `0.625rem 1.5rem`
- Radius: `9999px` (pill)
- Hover: darken to `--sl-primary-deep`, lift -1px, shadow `0 6px 20px rgba(91,91,214,0.30)`
- Active: background `#3F3FA8`
- Disabled: opacity 0.5, no hover effects

### Secondary (outline, pill)
- Background: transparent
- Border: `1.5px solid --sl-primary`
- Text: `--sl-primary`, 500 weight
- Hover: fill `--sl-primary-subtle`, lift -1px
- Same radius and padding as primary

### Ghost
- Background: transparent
- Text: `--sl-ink-secondary`
- Hover: background `--sl-surface-soft`
- No border

### Danger
- Background: `#DC2626`
- Text: white
- Hover: `#B91C1C`

### Rules
- One filled primary button per section band
- No gradient fills on buttons (reserved for score bars)
- Minimum tap target: 40×44px on mobile

---

## Cards

### Standard Card
- Background: `--sl-surface`
- Border: `1px solid --sl-border`
- Radius: `16px`
- Padding: `1.5rem`
- Shadow: `0 1px 3px rgba(28,28,58,0.06), 0 4px 12px rgba(28,28,58,0.04)`
- Hover: lift `-2px`, stronger shadow

### Featured Card (pricing, CTA bands)
- Background: `--sl-ink` (`#1C1C3A`)
- Text: white
- Border: `1px solid rgba(255,255,255,0.08)`
- Same radius and shadow — only the fill inverts

### Soft Card (secondary context)
- Background: `--sl-surface-soft`
- Border: `1px solid --sl-border`
- Radius: `12px`
- Hover lift but no strong shadow

### Score Card
- White background
- Score number in Display LG, colored by score range (hi/mid/lo)
- Sub-score bars use `dp-score-bar-track` / `dp-score-bar-fill`
- Diagnosis section in Surface Soft `#F8F8FC`

### Dashboard Stat Widget
- White background, standard card shadow
- Stat value: Display MD, tabular-nums
- Label: Caption, `--sl-ink-muted`
- Trend: small badge (success/warning) with arrow icon

---

## Forms & Inputs

### Text Input
- Background: white
- Border: `1.5px solid --sl-border-input`
- Radius: `8px`
- Padding: `0.625rem 0.875rem`
- Focus: border becomes `--sl-primary`, box-shadow `0 0 0 3px rgba(91,91,214,0.12)`
- Error: border `--sl-score-low`, box-shadow with red tint
- Label: above field, `0.875rem`, weight 500, `--sl-ink-secondary`
- Helper text: below field, `0.8125rem`, `--sl-ink-muted`

### Textarea
- Same as text input
- Min height: 100px, resize: vertical

### Select
- Same as text input
- Arrow icon in `--sl-ink-muted`

### Step Indicator (multi-step forms)
- Active step: filled circle `--sl-primary` with white number
- Inactive step: bordered circle `--sl-border` with muted number
- Completed step: filled circle `--sl-score-hi` with check icon
- Connector line: `--sl-border` (completed segments: `--sl-primary`)

---

## Badges & Chips

### Standard Badge
- Radius: `9999px`
- Padding: `0.25rem 0.625rem`
- Font: `0.75rem`, weight 500

Variants:
- **Primary**: background `--sl-primary-subtle`, text `--sl-primary-deep`
- **Success**: background `#D1FAE5`, text `#065F46`
- **Warning**: background `#FEF3C7`, text `#92400E`
- **Danger**: background `#FEE2E2`, text `#991B1B`
- **Pro**: gradient `#7C3AED → #4F46E5`, text white

### Eyebrow Label (section openers)
- Uppercase, 0.6875rem, 600 weight, +0.08em tracking
- Background: `--sl-primary-subtle`
- Border: `1px solid --sl-primary-muted`
- Text: `--sl-primary-deep`
- Used once per section to introduce the topic

---

## Gradient Mesh Hero

The hero area uses a soft multi-stop radial/linear mesh. Unlike a harsh full-screen gradient, it only covers the upper area and is very subtle.

```css
background: radial-gradient(ellipse 80% 60% at 20% -10%, #DCDCFF 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 0%, #E8E0FF 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 30%, #EDE8FF 0%, transparent 50%),
            #F8F8FC;
```

- Does NOT extend to the full page — only the hero section
- Footer, feature bands, and pricing use white or `--sl-surface-soft`
- Orb elements (blurred circles with `blur(80px)`) can be layered for depth

---

## Landing Page Style

1. **Navbar** — white/blur background, `--sl-ink` text, primary pill CTA on the right
2. **Hero** — gradient mesh backdrop, Display XXL headline (weight 300), body lead, 2 CTAs (primary + secondary), social proof badge below
3. **Problem/Solution** — white background, 3-column feature cards with icon + title + body
4. **How It Works** — `--sl-surface-soft` background, numbered step cards
5. **Demo/Preview** — large card mockup of audit result
6. **Pricing** — white background, 3-column cards with featured (dark) center
7. **CTA Band** — `--sl-surface-warm` background, centered headline + primary button
8. **Footer** — white, 4-column link grid, ink-muted text

---

## Dashboard Style

- **Sidebar**: white, `1px solid --sl-border` right edge, `--sl-ink` nav text
- **Active nav item**: `--sl-primary-subtle` background, `--sl-primary` text
- **Topbar**: white, shadow below, page title in Display MD
- **Content area**: `--sl-surface-soft` background
- **Stat widgets**: white cards with standard shadow
- **Tables**: white background, hairline `--sl-border` rows, header in Micro Cap

---

## Audit Report Style

- **Score circle**: large number in Display XXL, color by score range
- **Score grade badge**: pill chip (A/B/C/D/F), colored
- **Sub-score bars**: thin 5px tracks with colored fills
- **Fix First table**: clean table, issue column bold, impact column with badge
- **Diagnosis block**: `--sl-surface-soft` background card
- **Buyer Objections**: danger-tinted chips
- **Competitor Insights**: soft card with competitor list

---

## New Audit Form Style

- 3-step wizard with progress stepper
- Clean white form card, standard shadow
- Step 1: Amazon URL / ASIN
- Step 2: Product details + seller context
- Step 3: Review + submit
- Prominently display credit cost before submit
- Input labels above fields (never floating/placeholder-only)

---

## Image Studio Style

- Product Reference panel: white card, lock icon, `--sl-primary` accents when locked
- Image slot cards: white, dashed border when empty
- Generated image cards: white, tight radius, `generation_mode` badge
- Quality controls: horizontal row of pill selectors
- Primary CTA: "Generate Images" — primary pill button

---

## Pricing & Billing Style

- 3 plan cards horizontal (1-col mobile, 3-col desktop)
- Featured/recommended plan: `--sl-ink` background (dark card), white text
- Price: Display LG, `--sl-tabular` rendering
- Feature list: checkmark icons in `--sl-score-hi` green
- Plan badge on featured card: `--sl-accent-amber` Pro badge
- CTA at bottom of each card: full-width primary pill button

---

## Animation Rules

### Allowed
- **Fade-up on scroll**: `opacity 0 → 1`, `translateY(24px) → 0`, 0.5–0.6s, stagger 0.08s per card
- **Card hover lift**: `translateY(-2px)`, 0.25s ease
- **Button hover**: lift + shadow, 0.2s ease
- **Score bars**: animate width on enter, 0.8s ease
- **Gradient mesh**: very subtle `background-position` drift at 12s interval (optional, only if safe)
- **Skeleton loading**: shimmer scan 1.5s infinite linear
- **Page transitions**: fade in, 0.3s

### Not Allowed
- No bounce, spring overshoot, or elastic effects
- No rotation on hover
- No scale > 1.03 (too aggressive)
- No flashing / strobe
- No heavy particle systems
- No continuous infinite motion (except skeletons and the mesh drift)
- No `animation-iteration-count: infinite` on anything the user sees for more than 3 seconds

---

## Mobile & Responsive Rules

| Breakpoint | Name | Key Changes |
|---|---|---|
| `< 640px` | Mobile | Single column, reduced paddings (3rem), hero stacks vertically |
| `640px–1023px` | Tablet | 2-column cards, pricing 2-up |
| `≥ 1024px` | Desktop | Full 3-column grids, sidebar visible |
| `≥ 1440px` | Wide | Max-width container (1160px) centered |

- Dashboard sidebar: drawer on mobile, fixed on desktop
- Pricing: 1-up → 2-up → 3-up
- Hero: text + button stack on mobile, split layout on desktop
- Display text size: clamp() scales automatically between 2rem and 3.25rem
- All tap targets: minimum 44×44px

---

## What to Avoid

| Pattern | Reason |
|---|---|
| Dark backgrounds (except featured pricing card) | Breaks the "calm commerce" mood, reads as developer tool |
| Neon/lime green | Current dark theme accent; must not appear in the new design |
| Glass blur cards | Works on dark only; looks muddied on white backgrounds |
| Gradient button fills | Busy, distracting; primary button is a clean solid fill |
| All-caps body text | Aggressive, hard to read |
| Centered body text blocks (not hero) | Feels generic SaaS landing page |
| More than 2 accent colors | Palette confusion |
| Tight line-height on body text | Reduces readability for sellers |
| Animated background particles | Distracting, performance heavy |
| Cyber / terminal / code aesthetic | Wrong audience — Amazon sellers, not developers |
