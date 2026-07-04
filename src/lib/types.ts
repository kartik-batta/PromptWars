export type Vibe = "heritage" | "food" | "arts" | "spiritual";

export interface JourneyStop {
  id: string;
  name: string;
  hook: string;
  narrative: string;
  heritage_note: string;
  hidden_gem_score: number;
  nearby_experience: string;
  deep_narrative?: string;
  deep_heritage?: string;
}

export interface Journey {
  destination: string;
  vibe: Vibe;
  stops: JourneyStop[];
}

export const VIBE_KEYS: Vibe[] = ["heritage", "food", "arts", "spiritual"];

export function isVibe(v: unknown): v is Vibe {
  return typeof v === "string" && (VIBE_KEYS as string[]).includes(v);
}
