# BACKEND_STRUCTURE.md — Data Model & API

Backend = Next.js Route Handlers. No separate service. Everything stateless.

## Data model (client-side types, no DB)

```ts
// src/lib/types.ts

export type Vibe = "heritage" | "food" | "arts" | "spiritual";

export interface JourneyStop {
  id: string;                    // stable within a journey (uuid or index-based)
  name: string;                  // e.g. "Hawa Mahal"
  hook: string;                  // one-line teaser (≤ 90 chars)
  narrative: string;             // ~40 words, first-person immersive
  heritage_note: string;         // ~20 words on cultural/historical significance
  hidden_gem_score: 1 | 2 | 3 | 4 | 5;   // 1 = famous, 5 = truly off the beaten path
  nearby_experience: string;     // one local event OR authentic experience
  // populated only after "deepen" call:
  deep_narrative?: string;       // ~120 words
  deep_heritage?: string;        // ~60 words
}

export interface Journey {
  destination: string;
  vibe: Vibe;
  stops: JourneyStop[];          // 4–6 entries
}
```

Total entities: 2 (`Journey`, `JourneyStop`). Nothing else.

## Storage

**In-memory only.** Journey lives in the root page's React state. Reloading the page loses it. This is intentional (see `PRD.md` out-of-scope).

## API endpoints (only two)

### `POST /api/journey`

Generate a full journey.

Request:
```json
{ "destination": "Jaipur", "vibe": "heritage" }
```

Response (200):
```json
{
  "ok": true,
  "data": {
    "destination": "Jaipur",
    "vibe": "heritage",
    "stops": [ { "id": "...", "name": "...", "hook": "...", "narrative": "...", "heritage_note": "...", "hidden_gem_score": 4, "nearby_experience": "..." }, ... ]
  }
}
```

Response (error):
```json
{ "ok": false, "error": "human-readable message" }
```

Implementation: single OpenAI Responses API call with `response_format: json_schema` (see schema below).

### `POST /api/deepen`

Return deeper narrative + heritage for a single stop.

Request:
```json
{ "destination": "Jaipur", "vibe": "heritage", "stop": { /* JourneyStop */ } }
```

Response:
```json
{
  "ok": true,
  "data": { "deep_narrative": "...", "deep_heritage": "..." }
}
```

Implementation: single OpenAI call with `gpt-4o-mini`, `response_format: json_schema`.

## JSON schemas (source of truth)

```ts
// src/lib/schemas.ts

export const JOURNEY_SCHEMA = {
  type: "object",
  properties: {
    stops: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          hook: { type: "string" },
          narrative: { type: "string" },
          heritage_note: { type: "string" },
          hidden_gem_score: { type: "integer", minimum: 1, maximum: 5 },
          nearby_experience: { type: "string" },
        },
        required: ["name", "hook", "narrative", "heritage_note", "hidden_gem_score", "nearby_experience"],
        additionalProperties: false,
      },
    },
  },
  required: ["stops"],
  additionalProperties: false,
} as const;

export const DEEPEN_SCHEMA = {
  type: "object",
  properties: {
    deep_narrative: { type: "string" },
    deep_heritage:  { type: "string" },
  },
  required: ["deep_narrative", "deep_heritage"],
  additionalProperties: false,
} as const;
```

The server assigns `id` values after the LLM returns (index-based `s0`, `s1`, …). The LLM does not generate ids.

## Prompts — layout and rules

All prompts live in **one file: `src/lib/prompts.ts`**. No inline prompts in handlers.

```ts
// src/lib/prompts.ts

export const JOURNEY_SYSTEM_BASE = `
You are Wander, a cultural travel storyteller. Your one job is to produce a 4–6 stop journey through a destination
that lets a curious traveler feel the city's soul in 24–48 hours.

You may only produce content in these categories:
- attractions with cultural significance
- hidden gems (score them honestly on off-the-beaten-path 1–5)
- immersive first-person narrative (sensory, evocative, ~40 words per stop)
- heritage notes (historical or cultural significance, ~20 words)
- one nearby local event or authentic experience per stop

Refuse politely if the input is not a real place, a slur, or a request outside these categories.

Bias toward:
- lesser-known corners the average tourist misses
- specific sensory detail (smells, sounds, textures) over generic praise
- respect for local culture — no exoticizing language

Return JSON matching the provided schema exactly.
`;

export const VIBE_PERSONAS: Record<Vibe, string> = {
  heritage: `Voice: a historian-storyteller. Weave stone, dynasty, and ritual into every stop.`,
  food:     `Voice: a hungry local. Center meals, markets, and the stories in a spice tin.`,
  arts:     `Voice: an artist-in-residence. Center crafts, live music, murals, and studios.`,
  spiritual:`Voice: a quiet pilgrim. Center thresholds, silence, ritual, and light.`,
};

export const DEEPEN_SYSTEM = `
You are Wander, continuing a story you already began. Given a single stop from a journey, write:
- a longer immersive narrative (~120 words, first-person, present tense, sensory)
- a deeper heritage or cultural context (~60 words)

Match the vibe/persona used in the original journey. Do not invent new stops.

Return JSON matching the provided schema exactly.
`;
```

Rules that apply to every prompt:

- One prompt, one job. `JOURNEY_SYSTEM_BASE` produces the journey; `DEEPEN_SYSTEM` expands one stop. Nothing else.
- The vibe is a **persona swap** on top of the base prompt — not a code branch. Compose at call time: `system = JOURNEY_SYSTEM_BASE + "\n\n" + VIBE_PERSONAS[vibe]`.
- Never inject user input inside triple-backticks in the system prompt. Destination goes in the user message.
- Cap tokens per `TECH_STACK.md`. No unbounded generation.

## Standard call shape (copy into handler)

```ts
// src/app/api/journey/route.ts
import OpenAI from "openai";
import { JOURNEY_SYSTEM_BASE, VIBE_PERSONAS } from "@/lib/prompts";
import { JOURNEY_SCHEMA } from "@/lib/schemas";

const client = new OpenAI({ timeout: 25_000, maxRetries: 1 });

export async function POST(req: Request) {
  const { destination, vibe } = await req.json();

  // TODO validate destination is a non-empty string ≤ 100 chars; vibe ∈ VIBE_PERSONAS keys.

  const resp = await client.responses.create({
    model: "gpt-4o",
    input: [
      { role: "system", content: `${JOURNEY_SYSTEM_BASE}\n\n${VIBE_PERSONAS[vibe]}` },
      { role: "user",   content: `Destination: ${destination}` },
    ],
    max_output_tokens: 2048,
    temperature: 0.7,
    response_format: {
      type: "json_schema",
      json_schema: { name: "Journey", schema: JOURNEY_SCHEMA, strict: true },
    },
  });

  const parsed = resp.output_parsed as { stops: Array<Omit<JourneyStop, "id">> };
  const stops = parsed.stops.map((s, i) => ({ ...s, id: `s${i}` }));

  return Response.json({ ok: true, data: { destination, vibe, stops } });
}
```

## Secrets

- `OPENAI_API_KEY` — set once in Vercel Project Settings → Environment Variables (Production + Preview).
- Locally: `.env.local` with `OPENAI_API_KEY=sk-...` (git-ignored).
- Never referenced from client code. All OpenAI calls happen in `/api/*` route handlers.

## Explicit bans

- ❌ Authentication middleware
- ❌ Rate limiting (OpenAI's own is enough for a demo)
- ❌ Redis / caching layer
- ❌ Background jobs / queues
- ❌ Any endpoint the UI doesn't call
- ❌ Streaming tokens to the client (status line is client-side simulated)
- ❌ Function calling / tool use (single structured-output call is enough)
- ❌ External APIs beyond OpenAI
