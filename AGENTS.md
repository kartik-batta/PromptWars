# AGENTS.md

Cross-tool instructions for any coding agent working in this repo (Claude Code, Cursor, Windsurf, Copilot, Antigravity, etc.). Claude Code loads this via `@AGENTS.md` from `CLAUDE.md`.

## Context

This is a hackathon workspace, not a product codebase. Event: **PromptWars** (Google Antigravity, in-person, ~2–3 hour build window, individual entry). Problem statement is revealed on event day.

## Read these first

Every non-trivial change must reference one of these:

1. `docs/PRD.md` — what to build, what NOT to build (out-of-scope list).
2. `docs/APP_FLOW.md` — screens and demo happy-path.
3. `docs/TECH_STACK.md` — pinned versions.
4. `docs/FRONTEND_GUIDELINES.md` — design tokens.
5. `docs/BACKEND_STRUCTURE.md` — data + API.
6. `docs/IMPLEMENTATION_PLAN.md` — phased schedule.

## Non-negotiable rules

- **Out-of-scope is a hard boundary.** If it's not in `docs/PRD.md`, don't build it — even if it seems obviously useful.
- **Working demo > clean code.** Ship the happy-path first. Cleanup is optional; a broken demo is not recoverable.
- **Pin every dependency.** Record it in `docs/TECH_STACK.md` with a one-line reason.
- **Don't rewrite working code.** During the 2–3h window, running code is the most valuable asset in the repo.
- **Confirm before destructive actions** — deleting files, dropping tables, force-pushing, killing dev servers.
- **LLM provider is OpenAI, fixed.** Use the Responses API, JSON-schema structured output for anything the UI parses, `OPENAI_API_KEY` from env. Full rules in `docs/BACKEND_STRUCTURE.md` and `docs/TECH_STACK.md`.

## Judging criteria (optimize in this order)

1. Solution effectiveness (does the demo work?)
2. Prompt quality / architectural elegance
3. Live demonstration quality

## Failure modes to avoid

Documented in the reference article that shaped this repo:
- Feature creep from vague prompts → mitigated by `docs/PRD.md` out-of-scope list.
- Session-to-session inconsistency → mitigated by these foundation docs + always citing them in prompts.
- Invented navigation / made-up flows → mitigated by `docs/APP_FLOW.md`.
- Time overruns → mitigated by `docs/IMPLEMENTATION_PLAN.md` phase budgets.
