# APP_FLOW.md — Navigation & User Flow

## Screens (only what the demo needs)

| # | Screen name | Purpose | Route |
|--:|-------------|---------|-------|
| 1 | Home         | Destination input + vibe chips + Generate button   | `/` |
| 2 | Journey      | List of 4–6 story cards (same route, state change) | `/` |
| 3 | Card detail  | Expanded card modal / inline expand                | `/` (inline, not a route) |

There is only one route. State transitions render different views. Do NOT add a router.

## Demo happy-path (linear, no branches)

Every step is reachable via visible UI — no hidden shortcuts, no console commands.

1. **Land** — user opens `/`. Sees:
   - Hero headline: *"Wander through a city's story."*
   - Subhead: *"Tell us where you're going. We'll write your journey."*
   - Input field with placeholder: *"Try Jaipur, Kyoto, Lisbon…"*
   - 4 vibe chips beneath: **Heritage · Food · Arts · Spiritual** (one is pre-selected: Heritage).
   - Primary button: **Generate Journey**.
2. **Input** — user types `Jaipur` and taps the **Heritage** chip (already selected). Vibe chip shows active state.
3. **Submit** — user taps **Generate Journey**.
   - Button becomes disabled + spinner.
   - Streamed status line appears below: *"Weaving your journey through Jaipur…"* → *"Uncovering hidden corners…"* → *"Bringing the story to life…"*.
   - Wall-clock: 6–12 seconds total.
4. **Result** — home view transitions to journey view:
   - Header collapses (destination + vibe shown as a small breadcrumb).
   - Vertical stack of 4–6 story cards, each showing:
     - Stop name (bold, larger)
     - One-line hook (italic muted)
     - Narrative paragraph (~40 words)
     - Small row: `Heritage: <one-line note>` · `Hidden-gem: ●●●○○` · `Nearby: <event/experience>`
   - Below the last card: **Regenerate with a different vibe** with vibe chips.
5. **Expand** — user taps any card. Card expands inline (framer-motion or CSS height transition):
   - Longer immersive narrative (~120 words)
   - Deeper heritage context (~60 words)
   - Second LLM call fires on first expand; subsequent expands cached in memory.
6. **Regenerate** — user picks a different vibe chip (e.g. **Spiritual**), taps **Regenerate**. New journey renders in place with a subtle transition.
7. **End state** — judge is looking at the second, spiritually-flavored journey. Talk-track ends here.

Wall-clock target for this flow during live demo: **≤ 90 seconds**.

## State transitions

```
[Home form] --submit--> [Loading (streamed status)] --success--> [Journey list]
                                                     \--error--> [Error toast, form re-enabled]

[Journey list] --tap card--> [Card expanded] --tap again--> [Card collapsed]
[Journey list] --regenerate--> [Loading] --> [Journey list v2]
```

## Error / loading / empty states (bare minimum)

- **Loading (generate):** cycling status line + centered spinner. Never blank.
- **Loading (expand):** in-place shimmer on the expand area. No page-level spinner.
- **Error:** red toast top-right, 4s, message: *"Couldn't reach the storyteller. Try again."* + Retry button that just resubmits.
- **Empty destination:** input goes red, hint text below: *"We need somewhere to wander."* No modal.

## Explicitly excluded flows

- ❌ Sign-up / sign-in
- ❌ Saving a journey
- ❌ Sharing a journey (no share button, no copy link)
- ❌ Editing a stop after generation
- ❌ Reordering stops
- ❌ "Similar destinations" carousel
- ❌ Any second route or page
- ❌ Any modal deeper than one level
