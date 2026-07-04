# APP_FLOW.md — Navigation & User Flow

## Screens (only what the demo needs)

| # | Screen name | Purpose | Route |
|--:|-------------|---------|-------|
| 1 |             |         | `/`   |
| 2 |             |         | `/…`  |
| 3 |             |         | `/…`  |

Rule: if a screen isn't here, it doesn't exist. Do NOT add settings/profile/help pages.

## Demo happy-path (linear, no branches)

Every step must be reachable via visible UI — no hidden shortcuts, no console commands.

1. **Start** — user lands on `/`. Sees: _____. Clicks: _____.
2. **Input** — user provides _____. UI shows: _____.
3. **AI call** — app calls _____ with prompt _____. Loading state: _____.
4. **Result** — user sees _____. Key visual: _____.
5. **Next action** — user can _____ (this is the "wow" moment for judges).
6. **End state** — final screen shows _____.

Wall-clock target for this flow during the live demo: **under 90 seconds**.

## State transitions

Draw arrows, keep it flat. No modals-inside-modals.

```
[Home] --submit--> [Loading] --success--> [Result] --action--> [Result v2]
                              \--error--> [Error]
```

## Error/loading states (bare minimum)

- **Loading:** one spinner + one status message. No skeleton screens.
- **Error:** one toast + a "try again" button. Nothing fancy.
- **Empty:** one line of copy + a call to action. No illustrations.

## Explicitly excluded flows

- ❌ Sign-up / sign-in
- ❌ Password reset
- ❌ Onboarding walkthrough
- ❌ Settings screen
- ❌ Profile screen
- ❌ Anything with more than one branch from the happy path
