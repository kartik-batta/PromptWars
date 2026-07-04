# PromptWars

Workspace for the **PromptWars** in-person hackathon (Google Antigravity platform, single day, ~2–3 hour build window, individual entry, live demo).

The build-window problem statement is revealed on event day; this repo holds the pre-written scaffolding so that time is spent shipping, not typing specs.

## Structure

```
├── CLAUDE.md                    Claude Code instructions (loaded every session)
├── AGENTS.md                    Cross-tool agent instructions (Cursor, Windsurf, Antigravity)
├── docs/                        Six foundation docs — fill in on event day
│   ├── PRD.md                   Scope + hard out-of-scope list
│   ├── APP_FLOW.md              Screens + demo happy-path
│   ├── TECH_STACK.md            Pinned versions (OpenAI defaults included)
│   ├── FRONTEND_GUIDELINES.md   Design tokens + component rules
│   ├── BACKEND_STRUCTURE.md     Data model + API + OpenAI integration
│   └── IMPLEMENTATION_PLAN.md   Phased build with time budgets
├── .claude/
│   ├── agents/                  prd-guardian · demo-driver · prompt-architect
│   └── skills/                  scope-check · demo-rehearse · phase-status · openai-patterns
└── .github/workflows/
    └── deploy-vercel.yml        Preview on PR, production on push to main
```

## Deploy

- Push to `main` → production deploy on Vercel.
- Open a PR → preview deploy, URL commented on the PR.
- Required GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## LLM

OpenAI, via the Responses API. See `docs/TECH_STACK.md` and `docs/BACKEND_STRUCTURE.md`.
