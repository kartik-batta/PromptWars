# IMPLEMENTATION_PLAN.md — Phased Build

Total build window: **~150 minutes** (2.5h). Budgets below sum to 150.

Rule: if a phase runs >25% over budget, cut scope, don't extend. A working Phase 2 beats a half-done Phase 3.

## Phase 0 — Setup (15 min)

Goal: green screen "hello world" on Antigravity.

- [ ] Read problem statement, fill in `docs/PRD.md` sections 1–4
- [ ] Confirm tech stack, fill in `docs/TECH_STACK.md`
- [ ] Bootstrap project on Antigravity
- [ ] Commit / snapshot: **checkpoint-0-bootstrap**

Exit criterion: dev server runs, blank page loads.

## Phase 1 — Demo happy-path skeleton (60 min)

Goal: `APP_FLOW.md` steps 1–6 work end-to-end, ugly is fine.

- [ ] Build screens from `APP_FLOW.md` (unstyled)
- [ ] Wire the one API endpoint the flow needs
- [ ] Make the one AI call the flow needs (real, not stubbed)
- [ ] Loading + error states — bare minimum only
- [ ] Walk the flow yourself once; delegate to `demo-driver` subagent to verify
- [ ] Commit / snapshot: **checkpoint-1-happy-path**

Exit criterion: judge can complete the flow without you touching the keyboard.

**⚠️ If Phase 1 isn't done by minute 75, stop and cut scope from `docs/PRD.md`.**

## Phase 2 — Design polish + prompt tightening (45 min)

Goal: it looks intentional and the AI feels sharp.

- [ ] Apply `FRONTEND_GUIDELINES.md` design tokens
- [ ] Tighten every prompt: does it do one job? does it respect PRD scope?
- [ ] Delegate prompt review to `prompt-architect` subagent
- [ ] Verify happy-path still works (delegate to `demo-driver`)
- [ ] Commit / snapshot: **checkpoint-2-polish**

Exit criterion: nothing on screen looks copy-pasted from a tutorial.

## Phase 3 — Rank-3+ features (20 min, optional)

Goal: add ranked features from `docs/PRD.md` section 5, in rank order, one at a time.

- [ ] Pick the top unbuilt feature
- [ ] Build it in ≤ 10 min or drop it
- [ ] Verify happy-path still works after each addition
- [ ] Commit after each successful add

Rule: if adding a feature breaks the demo, revert immediately.

## Phase 4 — Demo prep (10 min, non-negotiable)

Goal: two clean run-throughs + a fallback recording.

- [ ] Rehearse the demo start-to-finish, out loud, twice
- [ ] Screen-record one clean run as fallback
- [ ] Write a 3-bullet talk track (what it does / how it works / why the prompt design is elegant)
- [ ] Close all irrelevant tabs, silence notifications, plug in charger
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
