# PRD.md — Product Requirements

Fill in on event day, in order, from the top down. Every field matters; do not skip.

## 1. Problem statement (verbatim from organizers)

> _Paste the exact prompt handed out at the event here. Do not paraphrase._

## 2. One-sentence solution pitch

_What are we building, for whom, and what changes for them because of it?_

Example format: `A [thing] that lets [user] do [action] so that [outcome], powered by [AI capability].`

## 3. Target user (single persona)

- **Who:**
- **Primary pain point they hit today:**
- **What they'll do with our tool:**

Pick ONE persona. Multi-persona apps do not finish in 2–3 hours.

## 4. Minimum demoable path (the "happy path")

The one flow the judges will see. Number every step; if it's not numbered here, it doesn't get built in Phase 1.

1. User opens the app and sees _____
2. User does _____
3. AI does _____
4. User sees result _____
5. User can then _____

## 5. In-scope features (ranked)

| Rank | Feature | Why it matters for judging | Phase |
|-----:|---------|----------------------------|-------|
| 1    |         |                            | P1    |
| 2    |         |                            | P1    |
| 3    |         |                            | P2    |
| 4    |         |                            | P2    |
| 5    |         |                            | P3    |

Rule: if it's not ranked here, it's out of scope.

## 6. Out-of-scope (hard boundary — do not build)

Common temptations that eat the clock. Add domain-specific items on event day.

- ❌ Authentication / login / user accounts (unless demo requires it)
- ❌ Multi-user or collaboration features
- ❌ Admin panel or settings screen
- ❌ Onboarding flow / tutorial
- ❌ Dark mode toggle
- ❌ Responsive design beyond the demo screen size
- ❌ Analytics / telemetry
- ❌ Email / notifications
- ❌ Payment / billing
- ❌ Internationalization
- ❌ Any feature not ranked in section 5

## 7. Success criteria (how we'll know it works)

- **Effectiveness:** the happy path in section 4 completes without a manual workaround.
- **Elegance:** each AI call has a clearly-scoped prompt; no monster prompt doing five jobs.
- **Demo:** rehearsed twice, screen recording saved as fallback.

## 8. Anti-goals

Things a reasonable person might expect but we're explicitly NOT optimizing for:

- Production readiness
- Test coverage
- Edge-case handling beyond the demo path
- Performance beyond "feels responsive on the demo laptop"
