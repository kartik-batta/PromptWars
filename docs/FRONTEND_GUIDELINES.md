# FRONTEND_GUIDELINES.md — Design System

Rule: one visual language across every screen. Judges notice inconsistency in 3 seconds.

## Design tokens

Fill in on event day, then treat as read-only for the rest of the build.

### Colors

| Token | Value | Used for |
|-------|-------|----------|
| `--bg`           | `#…` | Page background |
| `--surface`      | `#…` | Cards / panels  |
| `--text`         | `#…` | Primary text    |
| `--text-muted`   | `#…` | Secondary text  |
| `--accent`       | `#…` | Primary action  |
| `--accent-hover` | `#…` | Hover state     |
| `--danger`       | `#…` | Errors          |
| `--success`      | `#…` | Confirmations   |

Pick 6 colors max. No gradients unless the accent needs one.

### Typography

- **Font family:** system stack (`-apple-system, Segoe UI, sans-serif`) unless the demo needs branding.
- **Sizes:** `12 / 14 / 16 / 20 / 28` px. Nothing else.
- **Weights:** `400` and `600`. Nothing else.

### Spacing scale

`4 / 8 / 12 / 16 / 24 / 32 / 48` px. Any value not on this scale is a bug.

### Border radius

Pick one: `4px` OR `8px` OR `12px`. Apply everywhere. Do not mix.

## Components (build only these)

| Component | Rules |
|-----------|-------|
| Button    | One primary variant, one secondary. No tertiary. |
| Input     | One style. Label above, error below. |
| Card      | `--surface` bg, spacing scale padding, one radius. |
| Toast     | Top-right, 3s auto-dismiss, success or error only. |
| Spinner   | One spinner, used everywhere loading is needed. |

## Layout

- **Max content width:** 720px, centered. Wider only if data viz needs it.
- **Padding:** `24px` on mobile, `48px` on desktop.
- **Grid:** single column unless data requires two.

## Interaction rules

- Loading states must show within 100ms of any user action.
- Never leave the user staring at an unchanged screen after a click.
- Errors get a plain-English message + a "try again" button. No stack traces in the UI.

## Explicit bans

- ❌ Animations beyond `transition: 150ms ease` on hover/focus
- ❌ Custom scrollbars
- ❌ Illustrations, hero images, or stock photos
- ❌ Emoji as UI decoration
- ❌ More than 2 font weights on any screen
