---
description: Reference patterns for calling OpenAI from this codebase — Responses API, structured JSON output, streaming, retries, and error handling. Consult BEFORE writing any LLM call, and whenever the user asks about "openai", "gpt", "the AI call", "structured output", "json_schema", "prompt", or "response_format". Not user-invocable via slash by default; loaded by the model when relevant.
allowed-tools: Read, Grep
---

## Tech stack context

@docs/TECH_STACK.md

## Backend integration rules

@docs/BACKEND_STRUCTURE.md

## When you're writing an LLM call

Copy from the closest pattern below. Adapt names, not shape.

### Pattern 1 — Structured output (default for anything the UI parses)

Python:

```python
from openai import OpenAI
client = OpenAI(timeout=20.0, max_retries=1)

RESULT_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "risks":   {"type": "array", "items": {"type": "string"}},
    },
    "required": ["summary", "risks"],
    "additionalProperties": False,
}

resp = client.responses.create(
    model="gpt-4o",                       # or whatever's pinned in TECH_STACK.md
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
result = resp.output_parsed              # validated dict — no manual json.loads
```

Node/TS:

```ts
import OpenAI from "openai";
const client = new OpenAI({ timeout: 20_000, maxRetries: 1 });

const resultSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    risks:   { type: "array", items: { type: "string" } },
  },
  required: ["summary", "risks"],
  additionalProperties: false,
} as const;

const resp = await client.responses.create({
  model: "gpt-4o",
  input: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: userInput },
  ],
  max_output_tokens: 1024,
  temperature: 0.2,
  response_format: { type: "json_schema", json_schema: { name: "Result", schema: resultSchema, strict: true } },
});
const result = resp.output_parsed;
```

### Pattern 2 — Free-text generation, streamed to UI (use for the ONE customer-facing call)

Python:

```python
with client.responses.stream(
    model="gpt-4o",
    input=[{"role": "system", "content": SYSTEM_PROMPT},
           {"role": "user",   "content": user_input}],
    max_output_tokens=1024,
) as stream:
    for event in stream:
        if event.type == "response.output_text.delta":
            yield event.delta                  # push to the client
    final = stream.get_final_response()
```

Node/TS (server-sent events to the browser):

```ts
const stream = await client.responses.stream({
  model: "gpt-4o",
  input: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: userInput },
  ],
  max_output_tokens: 1024,
});
for await (const event of stream) {
  if (event.type === "response.output_text.delta") res.write(`data: ${event.delta}\n\n`);
}
```

### Pattern 3 — Reasoning model (only when the happy-path proves it helps)

```python
resp = client.responses.create(
    model="o4-mini",
    input=[{"role": "user", "content": problem}],
    reasoning={"effort": "medium"},     # low | medium | high
    max_output_tokens=2048,
)
answer = resp.output_text
```

Do not use reasoning models for classification, extraction, or short-turn UI. They are slower on stage.

## Prompt style (mandatory)

Every system prompt on the demo path follows this skeleton:

```
You are <role> for <app>. Your one job is <single, verifiable outcome>.

You may only help with:
- <bullet from PRD.md section 5>
- <bullet from PRD.md section 5>

Refuse anything else in one polite sentence.

Return output as <format spec matching response_format>.
```

Rules:
- One job per prompt. If the prompt hedges ("also, if the user asks…"), split it.
- Paste the PRD scope list verbatim — do not paraphrase it.
- Never inject user input inside triple-backticks in the system prompt; put it in the `user` message.
- Do not include few-shot examples unless a single call demonstrably fails without them.

## Anti-patterns (do not do)

- ❌ `JSON.parse(resp.output_text)` — use `response_format` + `output_parsed`.
- ❌ Retry loops of your own on top of the SDK — set `max_retries=1` and stop.
- ❌ Chained LLM calls where step 2 depends on step 1's parsed output, unless the happy-path REQUIRES it. Every hop is a demo failure point.
- ❌ Storing `OPENAI_API_KEY` in code, in the frontend, or in a git-tracked file.
- ❌ Removing the `max_output_tokens` cap "just for testing." Tests become prod on hackathon day.
- ❌ `temperature > 0.4` on structured-output calls.
- ❌ Passing large context blobs (whole files, whole DB dumps). Extract → summarize → pass the summary.

## When something's wrong

- **Empty `output_parsed`** → schema mismatch. Print `resp.output_text` and diff the shape.
- **`400 invalid_request_error` on `response_format`** → schema has `additionalProperties: true` implicitly. Add `"additionalProperties": false` and mark every field `required`.
- **Timeouts** → the demo laptop's network is not your dev network. Lower `max_output_tokens` before raising the timeout.
- **Model saying "I can't help with that"** → the system prompt is over-restricting. Check the "You may only help with" list matches `docs/PRD.md` section 5.
