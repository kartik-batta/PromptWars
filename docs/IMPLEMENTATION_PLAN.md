# IMPLEMENTATION_PLAN.md — Phased Build

Total build window: **~150 minutes** (2.5h). Budgets below sum to 150.

Rule: if a phase runs >25% over budget, cut scope, don't extend. A working Phase 2 beats a half-done Phase 3.

## Phase 0 — Setup (15 min)

Goal: green screen "hello Wander" on Antigravity, deployed to Vercel.

- [x] Read problem statement, fill in `docs/PRD.md` sections 1–8
- [x] Confirm tech stack, fill in `docs/TECH_STACK.md` (Next.js 14 + Tailwind + OpenAI)
- [ ] Bootstrap: `npx create-next-app@14 . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"`
- [ ] Add Tailwind config from `docs/FRONTEND_GUIDELINES.md` (colors, fonts via `next/font`)
- [ ] `npm install openai clsx`
- [ ] Add `OPENAI_API_KEY` to `.env.local` and to Vercel env (Production + Preview)
- [ ] Vercel link project + confirm `.vercel/project.json` values, then set the three GitHub Actions secrets
- [ ] Push → confirm Vercel preview deploy succeeds on a placeholder home page
- [ ] Commit / snapshot: **checkpoint-0-bootstrap**

Exit criterion: `/` renders "Wander" hero with ivory background at both `localhost:3000` and on Vercel preview URL.

## Phase 1 — Demo happy-path skeleton (60 min)

Goal: `APP_FLOW.md` steps 1–6 work end-to-end, ugly is fine.

- [ ] Create `src/lib/types.ts` — `Vibe`, `JourneyStop`, `Journey`
- [ ] Create `src/lib/schemas.ts` — `JOURNEY_SCHEMA`, `DEEPEN_SCHEMA`
- [ ] Create `src/lib/prompts.ts` — `JOURNEY_SYSTEM_BASE`, `VIBE_PERSONAS`, `DEEPEN_SYSTEM`
- [ ] Create `src/app/api/journey/route.ts` — POST handler per `BACKEND_STRUCTURE.md`
- [ ] Create `src/app/api/deepen/route.ts` — POST handler
- [ ] Build `src/app/page.tsx` — home form (destination input + vibe chips + generate button), unstyled
- [ ] Wire form submit → `/api/journey` → render stops as plain `<div>`s
- [ ] Add card-tap → `/api/deepen` → append deep_* fields to that stop in state
- [ ] Wire regenerate → same endpoint with the new vibe
- [ ] Bare-minimum loading state (single spinner) + error toast
- [ ] Run the flow yourself once with `Jaipur / Heritage`
- [ ] Delegate to `demo-driver` subagent to verify all 6 happy-path steps
- [ ] Commit / snapshot: **checkpoint-1-happy-path**

Exit criterion: `Jaipur / Heritage / Generate → card list → expand a card → regenerate as Spiritual` works without touching the keyboard between steps.

**⚠️ If Phase 1 isn't done by minute 75, cut Rank 4 (card expand) and ship without it.**

## Phase 2 — Design polish + prompt tightening (45 min)

Goal: it looks intentional and the AI feels sharp.

- [ ] Wire Fraunces + Inter via `next/font/google`, apply to `body` and `.serif`
- [ ] Apply Wander palette to Tailwind config (`docs/FRONTEND_GUIDELINES.md`)
- [ ] Restyle `<Button>`, `<Chip>`, `<Input>`, `<Card>` per guidelines — no icon library
- [ ] Build `<Badge>` hidden-gem dots (5 circles, accent/border)
- [ ] Build `<StatusLine>` cycling loader (3 messages, 2s interval)
- [ ] Card expand transition: `transition-all duration-300 ease-out`
- [ ] Delegate prompt review to `prompt-architect` subagent — apply top fix only
- [ ] Verify happy-path still works (delegate to `demo-driver`)
- [ ] Commit / snapshot: **checkpoint-2-polish**

Exit criterion: opens like a travel journal, not a form.

## Phase 3 — Rank-5+ features (20 min, optional)

Goal: add remaining ranked features from `docs/PRD.md` section 5, in rank order.

- [ ] Rank 6: streamed status line polish — verify the 3-message cycle looks intentional
- [ ] Rank 7: preset destination chips (Jaipur / Kyoto / Lisbon / Varanasi) below the input
- [ ] Verify happy-path still works after each addition
- [ ] Commit after each successful add

Rule: if adding a feature breaks the demo, revert immediately.

## Phase 4 — Demo prep (10 min, non-negotiable)

Goal: two clean run-throughs + a fallback recording.

- [ ] Pre-warm the app: run `Jaipur / Heritage` once so OpenAI's connection is warm on the demo laptop
- [ ] Rehearse the full demo out loud, twice — target ≤ 90 seconds:
  1. Type `Jaipur`, tap `Heritage`, tap Generate
  2. Point out hidden-gem score and heritage note on card 2 while it renders
  3. Tap card 2 to expand → show deeper narrative
  4. Scroll to bottom, tap `Spiritual`, tap Regenerate → same city, different soul
- [ ] Screen-record one clean 90-second run as fallback (with narration if possible)
- [ ] Write a 3-bullet talk track:
  1. **What:** one JSON schema, one destination, four narrator personas — a city's story reshaped by who you ask
  2. **How:** OpenAI Responses API with strict JSON schema; vibe = system-prompt persona swap, not a code branch
  3. **Why elegant:** entire LLM layer fits in one file (`prompts.ts`); adding a 5th vibe is 3 lines
- [ ] Close all irrelevant tabs, silence notifications, plug in charger, disable VPN
- [ ] Final commit / snapshot: **checkpoint-final**

Exit criterion: if the internet dies mid-demo, you can talk through the recording without panic.

## Time-check table (copy into scratchpad on event day)

| Minute | Should be | Actually is |
|-------:|-----------|-------------|
|  15    | Phase 0 done |         |
|  75    | Phase 1 done |         |
| 120    | Phase 2 done |         |
| 140    | Phase 3 done |         |
| 150    | Phase 4 done |         |
