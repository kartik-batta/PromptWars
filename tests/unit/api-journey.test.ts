import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Route-handler tests for POST /api/journey. The OpenAI SDK is mocked with
 * `vi.hoisted` so imports resolve to the mock before the route module loads.
 * These tests cover: env-var check, request validation, model-shape parsing,
 * stop id assignment, stop-count cap, and every error branch (empty content,
 * malformed JSON, empty stops array, SDK exception).
 */

const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }));

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}));

// Route module imports MUST come after vi.mock (vi.mock is hoisted).
import { POST } from "@/app/api/journey/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/journey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function stopFixture(name: string, score = 3) {
  return {
    name,
    hook: "A single line hook.",
    narrative: "I stand at the threshold at dusk.",
    heritage_note: "Ancient site with layered history.",
    hidden_gem_score: score,
    nearby_experience: "Weekly evening market.",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OPENAI_API_KEY = "test-key";
});

describe("POST /api/journey — validation", () => {
  it("returns 400 when destination is missing", async () => {
    const res = await POST(makeRequest({ vibe: "heritage" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toMatch(/somewhere to wander/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for whitespace-only destination", async () => {
    const res = await POST(makeRequest({ destination: "   ", vibe: "heritage" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for destinations over 100 chars", async () => {
    const res = await POST(makeRequest({ destination: "x".repeat(101), vibe: "heritage" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown vibe", async () => {
    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "history" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 (not 200) when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "heritage" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/misconfigured/i);
  });
});

describe("POST /api/journey — happy path", () => {
  it("returns a normalized journey with server-assigned ids", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              stops: [
                stopFixture("Amer Fort", 1),
                stopFixture("Panna Meena", 4),
                stopFixture("Nahargarh", 2),
                stopFixture("Jantar Mantar", 1),
              ],
            }),
          },
        },
      ],
    });

    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "heritage" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.destination).toBe("Jaipur");
    expect(json.data.vibe).toBe("heritage");
    expect(json.data.stops).toHaveLength(4);
    expect(json.data.stops.map((s: { id: string }) => s.id)).toEqual(["s0", "s1", "s2", "s3"]);
  });

  it("trims whitespace on the destination it echoes back", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ stops: [stopFixture("A")] }) } }],
    });
    const res = await POST(makeRequest({ destination: "  Jaipur  ", vibe: "heritage" }));
    const json = await res.json();
    expect(json.data.destination).toBe("Jaipur");
  });

  it("caps stops at 6 even when the model returns more", async () => {
    const seven = Array.from({ length: 7 }, (_, i) => stopFixture(`Stop ${i}`));
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ stops: seven }) } }],
    });
    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "heritage" }));
    const json = await res.json();
    expect(json.data.stops).toHaveLength(6);
  });

  it("passes the composed system prompt (base + vibe persona) to the model", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ stops: [stopFixture("X")] }) } }],
    });
    await POST(makeRequest({ destination: "Kyoto", vibe: "spiritual" }));
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    const system = callArgs.messages[0].content;
    expect(callArgs.messages[0].role).toBe("system");
    expect(system).toMatch(/quiet pilgrim/); // spiritual persona
    expect(callArgs.messages[1]).toEqual({ role: "user", content: "Destination: Kyoto" });
    expect(callArgs.response_format.type).toBe("json_schema");
    expect(callArgs.response_format.json_schema.strict).toBe(true);
  });
});

describe("POST /api/journey — error branches", () => {
  it("returns 502 when the model returns empty content", async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: "" } }] });
    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "heritage" }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/empty/i);
  });

  it("returns 502 when the model returns malformed JSON", async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: "not json" } }] });
    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "heritage" }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/malformed/i);
  });

  it("returns 502 when the model returns zero stops", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ stops: [] }) } }],
    });
    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "heritage" }));
    expect(res.status).toBe(502);
  });

  it("returns 500 with the SDK error message when the client throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Network timeout"));
    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "heritage" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Network timeout");
  });

  it("returns 500 with a fallback message for non-Error throws", async () => {
    mockCreate.mockRejectedValueOnce("string throw");
    const res = await POST(makeRequest({ destination: "Jaipur", vibe: "heritage" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Unknown storyteller error.");
  });

  it("returns 400 when the request body is not JSON", async () => {
    const req = new Request("http://localhost/api/journey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
