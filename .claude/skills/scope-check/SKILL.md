---
description: Validates a proposed change against docs/PRD.md scope. Use whenever the user proposes adding a feature, screen, endpoint, or dependency — before any code is written. Also triggers on phrases like "let's also add", "wouldn't it be cool if", "quick addition", "small tweak".
allowed-tools: Read, Grep
---

## PRD

@docs/PRD.md

## Instructions

Given the proposed change below, decide whether it is in-scope for this hackathon build.

1. Locate section 5 (in-scope ranked features) and section 6 (out-of-scope hard boundary) in the PRD above.
2. Check whether the proposed change maps to a specific ranked feature or the happy-path in section 4.
3. Check whether it appears on the out-of-scope list.
4. Return the verdict in this exact format:

```
VERDICT: <in-scope | out-of-scope | ambiguous>
REASON: <one sentence>
PRD_CITATION: <quote the specific line/rank from the PRD>
NEXT ACTION: <what the user should do — build it, drop it, or clarify PRD first>
```

## Bias

When uncertain, rule **out-of-scope**. A missing feature costs less than a missed demo.

## Do not

- Suggest alternative features.
- Approve based on "it would only take a few minutes" — every minute is budgeted in `docs/IMPLEMENTATION_PLAN.md`.
- Return a hedge; always give one of the three verdicts.
