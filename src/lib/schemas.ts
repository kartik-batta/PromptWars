// OpenAI structured-output schemas.
//
// Strict-mode json_schema does not support: minItems / maxItems / minimum /
// maximum / minLength / pattern. Constraints on stop count (4–6) and
// hidden_gem_score range (1–5) are enforced via the system prompt instead.

export const JOURNEY_SCHEMA = {
  type: "object",
  properties: {
    stops: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          hook: { type: "string" },
          narrative: { type: "string" },
          heritage_note: { type: "string" },
          hidden_gem_score: { type: "integer" },
          nearby_experience: { type: "string" },
        },
        required: [
          "name",
          "hook",
          "narrative",
          "heritage_note",
          "hidden_gem_score",
          "nearby_experience",
        ],
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
    deep_heritage: { type: "string" },
  },
  required: ["deep_narrative", "deep_heritage"],
  additionalProperties: false,
} as const;
