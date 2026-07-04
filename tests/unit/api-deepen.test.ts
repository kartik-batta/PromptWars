import { describe, it, expect, vi, beforeEach } from "vitest";
import type { JourneyStop } from "@/lib/types";

const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }));

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}));

import { POST } from "@/app/api/deepen/route";

const validStop: JourneyStop = {
  id: "s0",
  name: "Hawa Mahal",
  hook: "A honeycomb of latticed windows.",
  narrative: "I stand below its pink façade.",
  heritage_note: "Built 1799 for the royal women.",
  hidden_gem_score: 2,
  nearby_experience: "Evening bazaar next door.",
};

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/deepen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OPENAI_API_KEY = "test-key";
});

describe("POST /api/deepen — validation", () => {
  it("returns 400 when stop is missing", async () => {
    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "heritage" }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for unknown vibe", async () => {
    const res = await POST(
      makeRequest({ destination: "Jaipur", vibe: "cinematic", stop: validStop })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing destination", async () => {
    const res = await POST(makeRequest({ vibe: "heritage", stop: validStop }));
    expect(res.status).toBe(400);
  });

  it("returns 500 when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const res = await POST(
      makeRequest({ destination: "Jaipur", vibe: "heritage", stop: validStop })
    );
    expect(res.status).toBe(500);
  });
});

describe("POST /api/deepen — happy path", () => {
  it("returns the two deep_* fields from the model", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              deep_narrative: "The lattice holds the last light.",
              deep_heritage: "Built for women who could watch without being watched.",
            }),
          },
        },
      ],
    });

    const res = await POST(
      makeRequest({ destination: "Jaipur", vibe: "heritage", stop: validStop })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.deep_narrative).toMatch(/lattice/);
    expect(json.data.deep_heritage).toMatch(/watch/);
  });

  it("uses gpt-4o-mini (cheaper, faster model for the narrower task)", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({ deep_narrative: "x", deep_heritage: "y" }),
          },
        },
      ],
    });
    await POST(makeRequest({ destination: "Jaipur", vibe: "heritage", stop: validStop }));
    expect(mockCreate.mock.calls[0][0].model).toBe("gpt-4o-mini");
  });

  it("composes deepen system prompt with the vibe persona", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({ deep_narrative: "x", deep_heritage: "y" }),
          },
        },
      ],
    });
    await POST(makeRequest({ destination: "Jaipur", vibe: "food", stop: validStop }));
    const system = mockCreate.mock.calls[0][0].messages[0].content;
    expect(system).toMatch(/continuing a story you already began/i);
    expect(system).toMatch(/hungry local/); // food persona
  });
});

describe("POST /api/deepen — error branches", () => {
  it("returns 502 on empty content", async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: "" } }] });
    const res = await POST(
      makeRequest({ destination: "Jaipur", vibe: "heritage", stop: validStop })
    );
    expect(res.status).toBe(502);
  });

  it("returns 502 on malformed JSON", async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: "nope" } }] });
    const res = await POST(
      makeRequest({ destination: "Jaipur", vibe: "heritage", stop: validStop })
    );
    expect(res.status).toBe(502);
  });

  it("returns 500 when the SDK throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Rate limit"));
    const res = await POST(
      makeRequest({ destination: "Jaipur", vibe: "heritage", stop: validStop })
    );
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Rate limit");
  });
});
