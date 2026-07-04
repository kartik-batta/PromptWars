# TECH_STACK.md — Pinned Versions

Rule: before running any install command, add a row here with the exact version and a one-line reason. If it's not in this file, it's not in the project.

## Platform

- **Build platform:** Google Antigravity (event-mandated)
- **Deploy target:** Vercel (main → prod, PR → preview, wired via `.github/workflows/deploy-vercel.yml`)
- **Target browser:** latest Chrome on the demo laptop

## Language & runtime

| Thing | Version | Why |
|-------|---------|-----|
| Node.js | 20.x | Vercel default LTS; matches CI workflow. |
| Package manager | `npm` | Zero-config on Vercel and locally. |

## Framework — Next.js App Router (single stack for FE + BE)

| Package | Version | Why (one line) |
|---------|---------|----------------|
| `next`            | `14.2.x` | App Router + Route Handlers → one deploy target, no separate backend. |
| `react`           | `18.3.x` | Bundled with Next 14. |
| `react-dom`       | `18.3.x` | Bundled with Next 14. |
| `typescript`      | `5.4.x`  | Type safety on JSON-schema output pays off in a 2.5h window. |
| `@types/node`     | `20.x`   | For Node types in route handlers. |
| `@types/react`    | `18.x`   | React types. |
| `@types/react-dom`| `18.x`   | React DOM types. |

## Styling

| Package | Version | Why |
|---------|---------|-----|
| `tailwindcss` | `3.4.x` | Fastest path to the design tokens in `FRONTEND_GUIDELINES.md`. |
| `autoprefixer`| `10.x`  | Tailwind peer dep. |
| `postcss`     | `8.x`   | Tailwind peer dep. |

No component library (no shadcn, no MUI). Every component is hand-written from the design tokens. Rationale: fewer moving parts, faster to demo, prompt-review shows real thought.

## AI / LLM — OpenAI

| Thing | Value | Why |
|-------|-------|-----|
| Provider          | OpenAI | Locked per `AGENTS.md` non-negotiables. |
| Primary model     | `gpt-4o` | Best storytelling quality for demo latency. |
| Fallback model    | `gpt-4o-mini` | Cheap/fast — used for the "deepen card" second-tier call. |
| SDK — Node/TS     | `openai@4.x` (pin exact minor on install) | Official client, native fetch, streams. |
| API surface       | Responses API (`client.responses.create`) with `response_format: json_schema` | Structured output for the whole journey object. |
| Env var           | `OPENAI_API_KEY` | Vercel env var (Preview + Production). |
| Max output tokens | Generate: `2048` · Deepen: `768` | Hard cap per call. |
| Temperature       | `0.7` for narrative; `0.4` for the deepen call | High-enough for prose, low-enough to stay on-brief. |
| Timeout           | `25s` for generate; `12s` for deepen | Fail fast. |
| Retries           | `1` client-level | No exponential backoff. |
| Streaming         | Status line only (client-side simulated progression), NOT streamed tokens | Simpler wiring; full JSON needs to arrive intact for structured parsing. |
| Structured output | `response_format: { type: "json_schema", json_schema: { name, schema, strict: true } }` | See `BACKEND_STRUCTURE.md` for the schema. |

## Data / storage

| Thing | Value | Why |
|-------|-------|-----|
| Client state | React `useState` in the root page component | Journey lives in memory only. |
| Server state | None. Every request is stateless. | No DB, no cache, no sessions. |
| Cache        | In-request only; expanded-card results kept in client state | Prevents duplicate deepen calls on the same card. |

**No database.** Journeys do not survive a page reload. This is a hard design decision — persistence is out of scope in `PRD.md`.

## Utilities (only if genuinely needed — evaluate before adding)

| Package | Version | Purpose | Added? |
|---------|---------|---------|:------:|
| `zod` | `3.23.x` | Runtime validation of LLM JSON output as a belt-and-suspenders over OpenAI's `strict: true` | Only if we hit a schema mismatch during dev |
| `clsx` | `2.x` | Tailwind class composition | Yes |

## Deployment / CI

| Thing | Value |
|-------|-------|
| Hosting        | Vercel (linked project) |
| CI             | GitHub Actions (`.github/workflows/deploy-vercel.yml`) |
| Secrets in CI  | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (already documented in README) |
| Secrets at runtime | `OPENAI_API_KEY` — set in Vercel project env (Production + Preview) |

## Rules

- Pin exact minors. No `^` / `~` on primary deps during the build window.
- Zero-config libraries only. A 10-minute install is a 10-minute loss.
- No experimental / pre-release versions. Not the day to debug someone else's beta.
- Every install line in `package.json` maps to a row in this file with a one-line justification.

## Common commands (fill after `npx create-next-app`)

```
# install
npm install

# dev server
npm run dev          # http://localhost:3000

# typecheck
npx tsc --noEmit

# build
npm run build

# start production build locally
npm start
```
