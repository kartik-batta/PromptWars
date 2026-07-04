---
description: Reports current phase from docs/IMPLEMENTATION_PLAN.md, time elapsed vs budget, and the next milestone. Use at the start of every session and whenever the user asks "where are we", "how much time left", "what's next", or "are we on track".
allowed-tools: Read, Bash
---

## Plan

@docs/IMPLEMENTATION_PLAN.md

## Current time

!`date`

## Instructions

Read `docs/IMPLEMENTATION_PLAN.md` and identify:

1. Which phase we're currently in (by checking which checkboxes are checked vs. unchecked).
2. Minutes budgeted vs. minutes elapsed (ask the user for start time if not already known — record it once, then compute forward).
3. Whether we're on track, behind, or ahead.
4. What the next milestone/exit criterion is.

Return the report in this exact format:

```
CURRENT PHASE: <phase number and name>
BUDGET: <X of Y minutes used>
STATUS: <ON TRACK | BEHIND | AHEAD | OVERRUN>
NEXT MILESTONE: <the next unchecked checkbox and its exit criterion>

IF BEHIND — SCOPE-CUT CANDIDATES (from docs/PRD.md section 5, lowest rank first):
- <feature that could be dropped>
- <feature that could be dropped>

REMINDER: <the one rule from IMPLEMENTATION_PLAN.md that's most relevant right now>
```

## Bias

- 25% over budget on any phase = **OVERRUN**, and the recommendation must include scope-cut candidates, not "keep going."
- Phase 4 (demo prep) is non-negotiable. Never recommend borrowing from Phase 4.

## Do not

- Add tasks to the plan.
- Recompute budgets. The numbers in `docs/IMPLEMENTATION_PLAN.md` are frozen once event day starts.
- Encourage optimism. Hackathon plans always slip; the skill's job is to say so early.
