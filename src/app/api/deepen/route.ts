import OpenAI from "openai";
import { isVibe, type JourneyStop } from "@/lib/types";
import { DEEPEN_SCHEMA } from "@/lib/schemas";
import { DEEPEN_SYSTEM, VIBE_PERSONAS } from "@/lib/prompts";

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
    const stop = body?.stop as JourneyStop | undefined;

    if (!destination || !stop || !stop.name || !isVibe(vibe)) {
      return Response.json(
        { ok: false, error: "Missing destination, vibe, or stop." },
        { status: 400 }
      );
    }

    const client = new OpenAI({ timeout: 12_000, maxRetries: 1 });

    const stopContext = JSON.stringify(
      {
        name: stop.name,
        hook: stop.hook,
        narrative: stop.narrative,
        heritage_note: stop.heritage_note,
        nearby_experience: stop.nearby_experience,
      },
      null,
      2
    );

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${DEEPEN_SYSTEM}\n\n${VIBE_PERSONAS[vibe]}`,
        },
        {
          role: "user",
          content: `Destination: ${destination}\n\nStop:\n${stopContext}`,
        },
      ],
      max_tokens: 768,
      temperature: 0.4,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "Deepen",
          schema: DEEPEN_SCHEMA as unknown as Record<string, unknown>,
          strict: true,
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { ok: false, error: "Empty response while deepening." },
        { status: 502 }
      );
    }

    let parsed: { deep_narrative: string; deep_heritage: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      return Response.json(
        { ok: false, error: "Malformed response while deepening." },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, data: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown deepen error.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
