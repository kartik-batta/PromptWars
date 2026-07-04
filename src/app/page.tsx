"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { Journey, JourneyStop, Vibe } from "@/lib/types";

const VIBES: { key: Vibe; label: string }[] = [
  { key: "heritage", label: "Heritage" },
  { key: "food", label: "Food" },
  { key: "arts", label: "Arts" },
  { key: "spiritual", label: "Spiritual" },
];

function vibeLabel(v: Vibe): string {
  return VIBES.find((x) => x.key === v)?.label ?? v;
}

export default function Home() {
  const [destination, setDestination] = useState("");
  const [vibe, setVibe] = useState<Vibe>("heritage");
  const [loading, setLoading] = useState(false);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deepeningId, setDeepeningId] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  async function generate(nextVibe: Vibe = vibe) {
    if (!destination.trim()) {
      setError("We need somewhere to wander.");
      return;
    }
    setLoading(true);
    setError(null);
    setExpandedId(null);
    try {
      const res = await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination.trim(),
          vibe: nextVibe,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Journey generation failed.");
      setJourney(json.data);
      setVibe(nextVibe);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't reach the storyteller. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(stop: JourneyStop) {
    if (!journey) return;
    if (expandedId === stop.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(stop.id);
    if (stop.deep_narrative) return;
    setDeepeningId(stop.id);
    try {
      const res = await fetch("/api/deepen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: journey.destination,
          vibe: journey.vibe,
          stop,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Deepening failed.");
      setJourney((prev) =>
        prev
          ? {
              ...prev,
              stops: prev.stops.map((s) =>
                s.id === stop.id ? { ...s, ...json.data } : s
              ),
            }
          : prev
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't fetch a deeper story."
      );
    } finally {
      setDeepeningId(null);
    }
  }

  function resetToForm() {
    setJourney(null);
    setExpandedId(null);
  }

  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto max-w-wander px-4 py-16 md:px-6 md:py-24">
        <p className="mb-6 text-xs uppercase tracking-[0.22em] text-muted">
          Wander
        </p>

        {!journey && (
          <HomeForm
            destination={destination}
            onDestinationChange={setDestination}
            vibe={vibe}
            onVibeChange={setVibe}
            loading={loading}
            onSubmit={() => generate()}
          />
        )}

        {journey && (
          <JourneyView
            journey={journey}
            vibe={vibe}
            loading={loading}
            expandedId={expandedId}
            deepeningId={deepeningId}
            onToggleExpand={toggleExpand}
            onRegenerate={(v) => generate(v)}
            onReset={resetToForm}
          />
        )}
      </section>

      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-bg/70 backdrop-blur-[1px]">
          <div className="rounded-lg border border-border bg-surface px-6 py-4 shadow-card">
            <p className="font-serif text-base text-ink">
              Weaving your journey through {destination || "the city"}…
            </p>
          </div>
        </div>
      )}

      {error && (
        <button
          className="fixed right-6 top-6 z-50 max-w-xs rounded-lg border border-danger bg-surface px-4 py-3 text-left text-sm text-danger shadow-card"
          onClick={() => setError(null)}
          aria-live="polite"
        >
          {error}
        </button>
      )}
    </main>
  );
}

function HomeForm(props: {
  destination: string;
  onDestinationChange: (v: string) => void;
  vibe: Vibe;
  onVibeChange: (v: Vibe) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  const { destination, onDestinationChange, vibe, onVibeChange, loading, onSubmit } =
    props;
  return (
    <>
      <h1 className="font-serif text-4xl leading-tight md:text-5xl">
        Wander through a city&rsquo;s story.
      </h1>
      <p className="mt-4 font-serif text-lg leading-relaxed text-muted">
        Tell us where you&rsquo;re going. We&rsquo;ll write your journey.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="mt-10 rounded-lg border border-border bg-surface p-6 shadow-card"
      >
        <label
          className="block text-sm font-semibold text-ink"
          htmlFor="destination"
        >
          Destination
        </label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          placeholder="Try Jaipur, Kyoto, Lisbon…"
          className="mt-2 w-full rounded-lg border border-border bg-bg px-4 py-3 font-serif text-lg text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          disabled={loading}
          maxLength={100}
          autoComplete="off"
        />

        <p className="mt-6 text-sm font-semibold text-ink">Vibe</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => onVibeChange(v.key)}
              disabled={loading}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                vibe === v.key
                  ? "border-accent bg-accent text-surface"
                  : "border-accent/40 bg-transparent text-accent hover:border-accent"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-lg bg-accent px-6 py-3 text-base font-semibold text-surface transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Weaving your journey…" : "Generate Journey"}
        </button>
      </form>
    </>
  );
}

function JourneyView(props: {
  journey: Journey;
  vibe: Vibe;
  loading: boolean;
  expandedId: string | null;
  deepeningId: string | null;
  onToggleExpand: (stop: JourneyStop) => void;
  onRegenerate: (v: Vibe) => void;
  onReset: () => void;
}) {
  const { journey, loading, expandedId, deepeningId, onToggleExpand, onRegenerate, onReset } =
    props;
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {journey.destination} &middot; {vibeLabel(journey.vibe)}
          </p>
          <h1 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">
            Your journey.
          </h1>
        </div>
        <button
          onClick={onReset}
          className="whitespace-nowrap text-sm text-accent hover:text-accent-hover"
        >
          New destination
        </button>
      </div>

      <div className="mt-10 space-y-6">
        {journey.stops.map((stop) => (
          <StopCard
            key={stop.id}
            stop={stop}
            expanded={expandedId === stop.id}
            deepening={deepeningId === stop.id}
            onClick={() => onToggleExpand(stop)}
          />
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-surface-alt p-6">
        <p className="text-sm font-semibold text-ink">
          Regenerate with a different vibe
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v.key}
              onClick={() => onRegenerate(v.key)}
              disabled={loading}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                journey.vibe === v.key
                  ? "border-accent bg-accent text-surface"
                  : "border-accent/40 bg-transparent text-accent hover:border-accent"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StopCard(props: {
  stop: JourneyStop;
  expanded: boolean;
  deepening: boolean;
  onClick: () => void;
}) {
  const { stop, expanded, deepening, onClick } = props;
  return (
    <article className="rounded-lg border border-border bg-surface p-6 shadow-card">
      <button onClick={onClick} className="w-full text-left">
        <h2 className="font-serif text-xl font-semibold text-ink">
          {stop.name}
        </h2>
        <p className="mt-1 font-serif text-sm italic text-muted">
          {stop.hook}
        </p>
        <p className="mt-4 font-serif text-base leading-relaxed text-ink">
          {stop.narrative}
        </p>
      </button>

      <div className="mt-5 space-y-2 text-xs">
        <div className="flex flex-wrap gap-1 text-muted">
          <span className="uppercase tracking-wider">Heritage &middot;&nbsp;</span>
          <span className="text-ink">{stop.heritage_note}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-muted">
          <span className="inline-flex items-center gap-2 uppercase tracking-wider">
            Hidden gem
            <GemBadge score={stop.hidden_gem_score} />
          </span>
          <span className="flex flex-wrap gap-1">
            <span className="uppercase tracking-wider">Nearby &middot;&nbsp;</span>
            <span className="text-ink">{stop.nearby_experience}</span>
          </span>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 border-t border-border pt-6">
          {deepening && !stop.deep_narrative && (
            <p className="font-serif text-sm text-muted">
              Deepening the story…
            </p>
          )}
          {stop.deep_narrative && (
            <>
              <p className="font-serif text-base leading-relaxed text-ink">
                {stop.deep_narrative}
              </p>
              {stop.deep_heritage && (
                <p className="mt-4 font-serif text-sm leading-relaxed text-muted">
                  {stop.deep_heritage}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}

function GemBadge({ score }: { score: number }) {
  const s = Math.max(0, Math.min(5, Math.round(score)));
  return (
    <span className="inline-flex items-center gap-[3px] align-middle">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={clsx(
            "block h-2 w-2 rounded-full",
            n <= s ? "bg-accent" : "bg-border"
          )}
        />
      ))}
    </span>
  );
}
