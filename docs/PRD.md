# PRD.md — Product Requirements

## 1. Problem statement (verbatim from organizers)

> **Destination Discovery & Cultural Experiences**
>
> Build a GenAI-powered platform that helps travelers discover destinations and engage with local culture in meaningful ways.
>
> The solution must use Generative AI to recommend attractions, uncover hidden gems, generate immersive storytelling, promote heritage, suggest local events, and connect visitors with authentic cultural experiences.

## 2. One-sentence solution pitch

**Wander** — a GenAI travel companion that turns any destination into an immersive first-person cultural journey: 4–6 curated stops woven together as a narrative, each tagged with heritage significance, hidden-gem score, and a local event or authentic experience nearby.

## 3. Target user (single persona)

- **Who:** the curious traveler — someone with 24–48 hours in an unfamiliar city who wants depth over "top 10" checklists.
- **Primary pain point today:** TripAdvisor / Google give tourist-clustered results; blogs are outdated; local recommendations require insider access they don't have.
- **What they'll do with our tool:** paste a destination, pick a "vibe," get a personalized, narratively-connected cultural itinerary they can act on today.

## 4. Minimum demoable path (the happy path)

1. User lands on `/` and sees a hero prompt: **"Where are you going?"** with an input field and 4 vibe chips (Heritage · Food · Arts · Spiritual).
2. User types a destination (e.g. `Jaipur`) and taps a vibe chip (e.g. `Heritage`).
3. User taps **Generate Journey**. Loading state streams a status line: *"Weaving your journey through Jaipur…"*.
4. AI returns 4–6 story cards, each showing: stop name, one-line hook, a first-person narrative (~40 words), heritage note, hidden-gem badge (1–5), and one local event/experience.
5. User taps any card → expanded view shows a longer immersive narrative + deeper heritage context.
6. User taps **Regenerate with a different vibe** → same destination, new persona, new journey.

Wall-clock target end-to-end: **≤ 90 seconds** including one regenerate.

## 5. In-scope features (ranked)

| Rank | Feature | Why it matters for judging | Phase |
|-----:|---------|----------------------------|-------|
| 1 | Destination input + vibe selector (Heritage/Food/Arts/Spiritual) | Entry point; establishes user agency | P1 |
| 2 | AI-generated journey — 4–6 stops with narrative, heritage, hidden-gem score, local event | The core product; hits all six challenge requirements in one shot | P1 |
| 3 | Story-card list view with immersive typography | The "wow" — turns AI output into a felt experience | P1 |
| 4 | Card expand → deeper narrative + heritage context | Shows depth; second-level LLM call demonstrates architectural elegance | P2 |
| 5 | Regenerate with different vibe | Demonstrates prompt-engineering elegance (same schema, different persona) | P2 |
| 6 | Streamed status line during generation | Perceived speed on stage; hides latency | P2 |
| 7 | Preset destination chips (Jaipur / Kyoto / Lisbon / Varanasi) | Demo-day safety net — pre-tested inputs | P3 |

Rule: if it's not ranked here, it's out of scope.

## 6. Out-of-scope (hard boundary — do not build)

- ❌ User accounts / login / auth
- ❌ Saving or sharing journeys (no persistence across page reloads)
- ❌ Multi-destination or multi-day itineraries
- ❌ Maps / geospatial views (a single embedded map is also out — do NOT get pulled into Mapbox / Leaflet)
- ❌ Booking, ticketing, payment, or affiliate links
- ❌ Transport / directions between stops
- ❌ Photo galleries, image generation, or fetching real photos
- ❌ Reviews, ratings, or user-generated content
- ❌ Multi-language / translation
- ❌ Dark-mode toggle
- ❌ Onboarding flow, tutorial, tooltips
- ❌ Settings, profile, or admin screens
- ❌ Responsive design beyond the demo laptop resolution
- ❌ Analytics / telemetry
- ❌ Voice input / TTS narration
- ❌ Any external API besides OpenAI (no Places, no events APIs — the LLM produces plausible cultural events itself, framed as "typical" not "real-time")
- ❌ Anything not ranked in section 5

## 7. Success criteria

- **Effectiveness:** the happy path in section 4 completes end-to-end in under 90 seconds on the demo laptop, without a manual workaround.
- **Elegance:** one JSON schema, one main generation endpoint, one expand endpoint. Four vibes = four system-prompt personas, not four code paths. Judges can read the whole LLM layer in one screen.
- **Demo:** rehearsed with 2 destinations × 2 vibes = 4 pre-tested combinations, plus a screen-recording fallback.

## 8. Anti-goals

- Not a production travel product — no "real" event calendar, no verified attraction database.
- Not a comprehensive city guide — the journey is 4–6 stops, not 40.
- Not attempting to compete with Google Maps or TripAdvisor on breadth.
- Not optimized for anywhere except the demo laptop, current-latest Chrome.

## 9. Judging alignment (explicit)

| Criterion | How this build wins it |
|---|---|
| Solution effectiveness | Every one of the six challenge sub-goals appears in the AI output for every journey. Demo shows the full loop in <90s. |
| Prompt quality / architectural elegance | Single JSON schema across all vibes. Vibe = persona swap in the system prompt. Second-tier "deepen" prompt reuses the same stop context. Prompts are in a single `prompts.ts` file, each named and single-purpose. |
| Live demo | 2 pre-tested destinations, 2 vibe swaps, 1 card expand — 90 seconds, no keyboard fumbling. |
