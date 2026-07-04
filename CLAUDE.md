# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Repository purpose

Workspace for **PromptWars** — a Google-sponsored, in-person AI hackathon on the Antigravity platform. Single day, individual entry, ~2–3 hour build window, problem statement revealed on event day, judged on effectiveness → prompt/architectural elegance → live demo.

The six foundation docs in `docs/` are pre-written scaffolding so build-window time is spent shipping, not typing specs.

## Foundation docs — always consult before acting

Reference these by filename in prompts so decisions stay consistent across sessions.

- `docs/PRD.md` — scope + explicit **out-of-scope** list. Read before adding any feature.
- `docs/APP_FLOW.md` — screens, routes, demo happy-path. Read before adding user-facing state.
- `docs/TECH_STACK.md` — pinned versions. Read before `npm install` / `pip install` / equivalent.
- `docs/FRONTEND_GUIDELINES.md` — design tokens, component rules. Read before writing UI.
- `docs/BACKEND_STRUCTURE.md` — data model, API surface. Read before touching persistence or endpoints.
- `docs/IMPLEMENTATION_PLAN.md` — phased sequence with time boxes. Read to know which phase we're in.

## Judging-driven priorities (in this exact order)

1. **Effectiveness** — the demo path must run end-to-end. A rough working app beats a polished half-app.
2. **Prompt / architectural elegance** — small, legible code and clear prompts. No abstraction "for later."
3. **Live demo** — reserve the final 20 minutes for rehearsal + a fallback screen recording.

## Operating rules for the build window

- Time-box hard. If a phase in `docs/IMPLEMENTATION_PLAN.md` runs 25% over budget, cut scope — don't extend.
- Do not add features outside `docs/PRD.md`. The out-of-scope list is a hard boundary.
- Before installing a package: update `docs/TECH_STACK.md` with the pinned version and one-line reason.
- Never break the last working demo state. Commit or snapshot after every phase completes.
- Don't refactor working code during the build window. Ship first, then clean if time remains.
- If asked to do something risky (delete files, force-push, drop tables, rewrite working code), confirm first.

## LLM provider: OpenAI

All AI calls go through **OpenAI** — see `docs/TECH_STACK.md` for the pinned model IDs and SDK version, and `docs/BACKEND_STRUCTURE.md` for the standard call shape. Rules that apply everywhere:

- Use the **Responses API** (`client.responses.create`) unless a dependency forces Chat Completions.
- Every UI-parsed call uses `response_format` with a strict JSON schema. Do not regex-parse model output on the demo path.
- `OPENAI_API_KEY` comes from env; never inline it, never send it to the frontend.
- Cap `max_output_tokens` on every call. A runaway generation can eat the remaining build-window budget in one shot.
- Reasoning models (`o4-mini`, `o3`) only where they demonstrably help the happy-path — they add latency the live demo can't afford.
- One LLM call per user action on the demo path. No concurrent fan-out on stage.

## Subagents available

- `prd-guardian` — checks a proposed change against `docs/PRD.md` out-of-scope list. Delegate before adding any feature.
- `demo-driver` — walks the demo happy-path in `docs/APP_FLOW.md` and reports what's broken. Delegate before every phase gate.
- `prompt-architect` — reviews prompts and AI-integration code for elegance/judging criteria. Delegate before demo prep.

## Skills available

- `/scope-check` — validates a proposed change against PRD out-of-scope list.
- `/demo-rehearse` — dry-runs the demo happy-path and lists breakages.
- `/phase-status` — reports current phase, time elapsed vs. budget, and next milestone.
- `/openai-patterns` — reference for OpenAI SDK usage (Responses API, structured output, streaming, retries). Consult before writing any LLM call.

## Common commands

To be filled in on event day once `docs/TECH_STACK.md` is finalized. Placeholders:

```
# install       — TBD
# dev server    — TBD
# tests         — TBD
# build         — TBD
```

## What this repo is NOT

- Not production code — optimize for a working demo, not long-term maintainability.
- Not a reusable template — event-specific decisions live here.
- Not a refactor playground — every change must move the demo path forward.
