# BACKEND_STRUCTURE.md — Data Model & API

Rule: model only what the demo path in `APP_FLOW.md` uses. Every extra field is a maintenance tax.

## Data model

Keep entities to the minimum needed for the happy path. Add fields lazily.

### Entity: _____

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| id    | string / uuid | yes | Primary key |
|       |      |          |       |
|       |      |          |       |

_(Repeat for each entity. Aim for ≤3 entities total.)_

## Storage

Choose the simplest thing that survives the demo. Default in-memory unless the demo requires persistence across page reloads.

- [ ] In-memory (JS map / Python dict) — restart loses everything
- [ ] Single JSON file on disk
- [ ] SQLite
- [ ] Managed DB (only if Antigravity provides one out of the box)

Justify anything beyond in-memory in one line.

## API endpoints (only what the frontend calls)

| Method | Path | Purpose | Request body | Response |
|--------|------|---------|--------------|----------|
| POST   | `/api/…` |     | `{ … }`      | `{ … }`  |
| GET    | `/api/…` |     | —            | `{ … }`  |

Rules:
- No CRUD-for-CRUD's-sake — if the UI doesn't call it, don't build it.
- All responses are JSON with shape `{ ok: true, data: … }` or `{ ok: false, error: "…" }`.
- No pagination, filtering, or sorting query params unless the UI actually uses them.

## AI integration — OpenAI

All LLM calls go through OpenAI's official SDK per `docs/TECH_STACK.md`. Provider is OpenAI; **do not swap providers mid-build.**

### Call sites

| Location | Purpose | Prompt file / const | Model | Structured output? |
|----------|---------|---------------------|-------|--------------------|
|          |         |                     |       |                    |

### Where prompts live

- One file: `src/prompts/` (or `prompts.py` / `prompts.ts`). No inline multi-line strings scattered across handlers.
- Each prompt is a **named constant** — `SUMMARIZE_SYSTEM`, `CLASSIFY_INTENT`, etc. — never `prompt1`.
- Prompts reference `docs/PRD.md` scope explicitly. Include a line like: `Refuse anything not in the following list: [<paste in-scope list>].`

### Standard OpenAI call shape (adapt to Python or Node)

```python
# Python — Responses API, structured output
resp = client.responses.create(
    model=MODEL,                          # from docs/TECH_STACK.md
    input=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_input},
    ],
    max_output_tokens=1024,
    temperature=0.2,
    response_format={
        "type": "json_schema",
        "json_schema": {"name": "Result", "schema": RESULT_SCHEMA, "strict": True},
    },
)
result = resp.output_parsed        # already a validated dict — no JSON.loads guesswork
```

```ts
// Node/TS — Responses API, structured output (via SDK zod helper if available)
const resp = await client.responses.create({
  model: MODEL,
  input: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: userInput },
  ],
  max_output_tokens: 1024,
  temperature: 0.2,
  response_format: { type: "json_schema", json_schema: { name: "Result", schema: RESULT_SCHEMA, strict: true } },
});
const result = resp.output_parsed;
```

### Rules

- One prompt does one job. Split anything longer than ~30 lines.
- **Every call the UI parses uses `response_format` with a JSON schema.** No regex-parsing model output on the demo path.
- Log every prompt + response to stdout during dev. Grep-able > pretty.
- Hard cap `max_output_tokens` on every call (see `docs/TECH_STACK.md`). A runaway loop can burn the whole build window in one session.
- Timeout every request at 20s (SDK client config). Retry once, then surface a user-visible error.
- Never fan out concurrent LLM calls on the demo path — one call, one loading state, one result.
- Reasoning models (`o4-mini` / `o3`) only where the happy-path proves they help. They are slower on stage.

### Secrets

- `OPENAI_API_KEY` in the environment. Load once at boot; never log it, never send it to the frontend.
- If Antigravity provides a secrets pane, store it there. Otherwise `.env` file that is git-ignored.

## Secrets

- Store in environment variables. Never commit.
- If Antigravity provides a secrets UI, use it.
- Document which env vars the app needs in `TECH_STACK.md`.

## Explicit bans

- ❌ Authentication middleware
- ❌ Rate limiting (unless the LLM provider forces us)
- ❌ Caching layers
- ❌ Message queues / background jobs
- ❌ Migrations framework (schema fits in one file)
- ❌ Any endpoint the UI doesn't call
