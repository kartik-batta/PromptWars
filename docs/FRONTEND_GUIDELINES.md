# FRONTEND_GUIDELINES.md — Design System

One visual language. The mood is **quiet, warm, editorial** — a travel journal, not a booking site.

## Design tokens

### Colors — "Wander" palette (warm ivory + ink + saffron accent)

| Token | Value | Used for |
|-------|-------|----------|
| `--bg`            | `#F7F3EC` | Page background — warm ivory, feels like aged paper |
| `--surface`       | `#FFFDF8` | Card background — slightly whiter than bg |
| `--surface-alt`   | `#EFE8DA` | Muted panels, expanded card interior |
| `--text`          | `#1B1917` | Primary text — near-black ink |
| `--text-muted`    | `#6B655D` | Meta, breadcrumbs, hints |
| `--accent`        | `#C25A1F` | Saffron / burnt-orange — buttons, active chip, badges |
| `--accent-hover`  | `#A24513` | Hover state on accent |
| `--border`        | `#E1D9C7` | Card borders, dividers |
| `--danger`        | `#A83A2A` | Errors |
| `--success`       | `#4B7A3D` | Rare — used only on gem-score fills |

Six primary colors. Do not introduce a seventh.

Tailwind config extract:

```js
// tailwind.config.js — colors
theme: {
  extend: {
    colors: {
      bg: "#F7F3EC",
      surface: "#FFFDF8",
      "surface-alt": "#EFE8DA",
      ink: "#1B1917",
      muted: "#6B655D",
      accent: "#C25A1F",
      "accent-hover": "#A24513",
      border: "#E1D9C7",
      danger: "#A83A2A",
      success: "#4B7A3D",
    },
  },
}
```

### Typography

- **Serif (headings + narrative):** `"Fraunces", "Georgia", serif` — the storytelling voice.
- **Sans (UI chrome, buttons, meta):** `"Inter", -apple-system, "Segoe UI", sans-serif`.
- **Load fonts:** Next.js `next/font/google` — `Fraunces` (weights 400/600) + `Inter` (weights 400/600). Nothing else.

Sizes (Tailwind classes):

| Use | Class |
|-----|-------|
| Hero headline (serif)         | `text-4xl md:text-5xl leading-tight` |
| Section header (serif)        | `text-2xl` |
| Stop name (serif)             | `text-xl font-semibold` |
| Narrative body (serif)        | `text-base leading-relaxed` |
| UI label (sans)               | `text-sm` |
| Meta (sans)                   | `text-xs uppercase tracking-wider` |

Weights: `400` and `600`. Nothing else.

### Spacing scale

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` px → Tailwind: `1 / 2 / 3 / 4 / 6 / 8 / 12 / 16`. Anything else is a bug.

### Border radius

`8px` (`rounded-lg`) everywhere. Cards, buttons, inputs, chips, toast. Do not mix.

### Elevation

One shadow: `shadow-[0_1px_2px_rgba(27,25,23,0.06),0_8px_24px_-12px_rgba(27,25,23,0.12)]` on cards. No other shadows anywhere.

## Components (build only these)

| Component | Rules |
|-----------|-------|
| `<Button>`      | Two variants: `primary` (accent bg, ivory text) and `ghost` (transparent, accent text). No tertiary. Height 44px. |
| `<Input>`       | Single style. Label above, hint below. Border `--border`, focus ring `--accent`. |
| `<Chip>`        | Vibe selector — pill, `rounded-full`, accent border. Active: filled accent bg. Height 36px. |
| `<Card>`        | Journey stop. `--surface` bg, `--border` 1px, one shadow. Padding `6` (24px). |
| `<Badge>`       | Hidden-gem dots — 5 filled/empty circles. Filled = `--accent`, empty = `--border`. |
| `<Toast>`       | Top-right, 4s auto-dismiss. Success or error variants. |
| `<Spinner>`     | Single spinner: 20px accent stroke on transparent bg. |
| `<StatusLine>`  | Loading status text — cycles through 3 messages during generation. |

## Layout

- **Max content width:** `640px` (`max-w-2xl`), centered. The editorial feel wants columnar text, not a dashboard.
- **Vertical rhythm:** `space-y-6` between cards, `space-y-4` inside a card.
- **Padding:** `px-4 py-8` mobile → `px-6 py-16` desktop.
- **Single column** — no grid. Even on wide screens.

## Interaction rules

- Every action must show visible feedback within 100ms — spinner appears on button click, chip color changes on tap.
- Card expand: `transition-all duration-300 ease-out`. Nothing snappier, nothing slower.
- Chip active state: immediate; no delay.
- Never leave the user staring at an unchanged screen after a click.
- Errors get a plain-English toast + a retry button. No stack traces in the UI.
- Streamed status line cycles at ~2 second intervals during generation; if the API returns faster, skip remaining messages.

## Iconography

**None.** No icons, no emoji, no illustrations, no hero images. Type carries the entire UI. This is a design decision — mixing icon libraries eats time and the editorial mood tolerates zero icons.

Exception: the hidden-gem badge uses simple filled/empty circles built from `div`s. No icon library.

## Explicit bans

- ❌ Any animation library beyond CSS transitions (`framer-motion` only if the card expand becomes janky — evaluate at Phase 2 gate)
- ❌ Custom scrollbars
- ❌ Illustrations, hero images, stock photos
- ❌ Icon libraries (lucide, heroicons, etc.)
- ❌ Emoji in UI copy
- ❌ Gradients (single flat accent only)
- ❌ Dark mode
- ❌ More than 2 font weights on any screen
- ❌ More than one shadow value in the app
