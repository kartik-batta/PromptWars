---
description: Dry-runs the demo happy-path defined in docs/APP_FLOW.md and lists breakages. Use before every phase gate in the implementation plan, and immediately before the live demo. Triggers on "check the demo", "does the flow work", "am I ready to present", "run through the app".
allowed-tools: Read, Grep, Glob, Bash
---

## App flow

@docs/APP_FLOW.md

## Tech stack (for how to run the app)

@docs/TECH_STACK.md

## Instructions

Walk the happy-path in `docs/APP_FLOW.md` from step 1 to end, verifying each step against the running application.

1. Check the dev server is running. If not, start it per `docs/TECH_STACK.md` and wait until ready.
2. For each numbered step in the happy-path:
   - Verify the required UI element exists (grep source, curl the route, or inspect logs).
   - Verify the underlying handler / API endpoint responds correctly.
   - Note anything slow, ugly, or confusing.
3. Time the full flow end-to-end (target: under 90 seconds).
4. Report using the format below.

## Output

```
HAPPY-PATH STATUS: <READY | NOT READY>
TOTAL STEPS: <N>   PASSING: <M>   FAILING: <K>
END-TO-END TIME: <seconds> (target: <90s)

STEP-BY-STEP:
1. <step name> — <PASS | FAIL> — <evidence>
2. …

TOP 3 BLOCKERS (fix in this order):
1. <biggest demo-killer>
2. …

DEMO-DAY REMINDERS:
- <anything that would embarrass us on stage>
```

## Bias

- Assume the judge is skeptical. Any hesitation on stage = FAIL for that step.
- If a step relies on typing a specific input, note the exact string — reduce cognitive load during the live demo.

## Do not

- Fix issues yourself. Report them for the main agent.
- Suggest new steps or features.
- Skip steps because "I checked that last time."
