import OpenAI from "openai";
import { isVibe, type Journey, type JourneyStop } from "@/lib/types";
import { JOURNEY_SCHEMA } from "@/lib/schemas";
import { JOURNEY_SYSTEM_BASE, VIBE_PERSONAS } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { ok: false, error: "Server misconfigured: OPENAI_API_KEY missing." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const destination = String(body?.destination ?? "").trim();
    const vibe = body?.vibe;

    if (!destination) {
      return Response.json(
        { ok: false, error: "We need somewhere to wander." },
        { status: 400 }
      );
    }
    if (destination.length > 100) {
      return Response.json(
        { ok: false, error: "Destination is too long." },
        { status: 400 }
      );
    }
    if (!isVibe(vibe)) {
      return Response.json(
        { ok: false, error: "Unknown vibe." },
        { status: 400 }
      );
    }

    const client = new OpenAI({ timeout: 25_000, maxRetries: 1 });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${JOURNEY_SYSTEM_BASE}\n\n${VIBE_PERSONAS[vibe]}`,
        },
        { role: "user", content: `Destination: ${destination}` },
      ],
      max_tokens: 2048,
      temperature: 0.7,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "Journey",
          schema: JOURNEY_SCHEMA as unknown as Record<string, unknown>,
          strict: true,
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { ok: false, error: "Empty response from the storyteller." },
        { status: 502 }
      );
    }

    let parsed: { stops: Array<Omit<JourneyStop, "id">> };
    try {
      parsed = JSON.parse(content);
    } catch {
      return Response.json(
        { ok: false, error: "Malformed response from the storyteller." },
        { status: 502 }
      );
    }

    if (!Array.isArray(parsed.stops) || parsed.stops.length === 0) {
      return Response.json(
        { ok: false, error: "The storyteller returned no stops." },
        { status: 502 }
      );
    }

    const stops: JourneyStop[] = parsed.stops.slice(0, 6).map((s, i) => ({
      ...s,
      id: `s${i}`,
    }));

    const journey: Journey = { destination, vibe, stops };
    return Response.json({ ok: true, data: journey });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown storyteller error.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
