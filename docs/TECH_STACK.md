# TECH_STACK.md — Pinned Versions

Rule: before running any install command, add a row here with the exact version and a one-line reason. If it's not in this file, it's not in the project.

## Platform

- **Build platform:** Google Antigravity (event-mandated)
- **Runtime OS:** whatever Antigravity provides — do not assume local dev environment
- **Target browser:** latest Chrome on the demo laptop

## Language & runtime

| Thing | Version | Why |
|-------|---------|-----|
| Node.js |  |  |
| Python  |  |  |

## Frontend

| Package | Version | Why (one line) |
|---------|---------|----------------|
| React   |         |                |
| …       |         |                |

## Backend

| Package | Version | Why |
|---------|---------|-----|
|         |         |     |

## AI / LLM — OpenAI (default)

| Thing | Value | Why |
|-------|-------|-----|
| Provider          | OpenAI | Event-neutral, works from Antigravity; SDKs are stable. |
| Primary model     | `gpt-4o` _(or `gpt-4.1` / `gpt-5` — pin exact ID on event day)_ | Best quality/latency balance for demo tasks. |
| Fallback model    | `gpt-4o-mini` | Cheap/fast fallback for classification, extraction, and non-demo-path calls. |
| Reasoning model   | `o4-mini` _(only if the problem needs planning/multi-step logic)_ | Skip unless the happy-path clearly benefits — reasoning models are slower and pricier per demo second. |
| SDK — Python      | `openai` (pin exact minor on install day) | Official client. |
| SDK — Node/TS     | `openai` (pin exact minor on install day) | Official client. |
| API surface       | **Responses API** (`client.responses.create`) preferred; Chat Completions (`client.chat.completions.create`) if any dependency requires it | Responses API is the current default surface; only fall back if a library forces Chat Completions. |
| Env var           | `OPENAI_API_KEY` | Store in Antigravity secrets; never commit. |
| Max output tokens | `1024` for demo-path calls; `256` for classification | Hard cap to protect budget + latency. |
| Temperature       | `0.2` for structured output; `0.7` only if the demo requires creativity | Low temp = predictable demos. |
| Timeout           | `20s` per request | Fail fast; retry once, then surface an error. |
| Retries           | `1` (client-level), no exponential backoff | Second retry burns wall-clock we don't have. |
| Streaming         | Only on the ONE customer-facing generation call in the happy-path | Streaming everywhere = more bugs than "wow." |
| Structured output | Use `response_format={"type": "json_schema", ...}` for any call the UI parses | No regex-parsing free-form text on the demo path. |

## Data / storage

| Thing | Value | Why |
|-------|-------|-----|
|       |       |     |

Default: in-memory or a single JSON file. Do NOT add a database unless the demo requires persistence across sessions.

## Rules

- Pin exact versions (`^` and `~` are banned during the build window).
- Prefer libraries with zero-config setup. A 10-minute install is a 10-minute loss.
- If a library needs a config file, that config lives in the repo, not in someone's head.
- No experimental / pre-release versions. This is not the day to debug someone else's beta.
