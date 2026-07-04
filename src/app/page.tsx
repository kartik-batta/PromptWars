"use client";

import { useEffect, useRef, useState } from "react";
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

/**
 * Focus-visible ring applied to every interactive element. Kept in one
 * constant so a single edit updates keyboard-focus styling everywhere.
 */
const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [vibe, setVibe] = useState<Vibe>("heritage");
  const [loading, setLoading] = useState(false);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deepeningId, setDeepeningId] = useState<string | null>(null);

  const destinationRef = useRef<HTMLInputElement>(null);
  const journeyHeadingRef = useRef<HTMLHeadingElement>(null);

  // Auto-dismiss errors after 4s so the toast doesn't linger.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  // Move keyboard focus to the journey heading when a journey renders so
  // screen-reader users are placed at the new content rather than the
  // now-hidden form. WCAG 2.4.3 (Focus Order).
  useEffect(() => {
    if (journey) journeyHeadingRef.current?.focus();
  }, [journey]);

  async function generate(nextVibe: Vibe = vibe) {
    if (!destination.trim()) {
      setError("We need somewhere to wander.");
      destinationRef.current?.focus();
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
    // Return focus to the destination input for screen-reader continuity.
    // Use rAF so the input has re-mounted before we call .focus().
    requestAnimationFrame(() => destinationRef.current?.focus());
  }

  return (
    <>
      <a
        href="#wander-main"
        className={clsx(
          "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-surface",
          FOCUS_RING
        )}
      >
        Skip to main content
      </a>

      <main
        id="wander-main"
        className="min-h-screen bg-bg text-ink"
        aria-busy={loading}
      >
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
              destinationRef={destinationRef}
            />
          )}

          {journey && (
            <JourneyView
              journey={journey}
              loading={loading}
              expandedId={expandedId}
              deepeningId={deepeningId}
              onToggleExpand={toggleExpand}
              onRegenerate={(v) => generate(v)}
              onReset={resetToForm}
              headingRef={journeyHeadingRef}
            />
          )}
        </section>

        {/* Loading overlay: role="status" + aria-live announces progress. */}
        {loading && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-bg/70 backdrop-blur-[1px]"
            role="status"
            aria-live="polite"
          >
            <div className="rounded-lg border border-border bg-surface px-6 py-4 shadow-card">
              <p className="font-serif text-base text-ink">
                Weaving your journey through {destination || "the city"}
                <span className="sr-only">, please wait</span>&hellip;
              </p>
            </div>
          </div>
        )}

        {/* Error region: role="alert" + aria-live="assertive" announces immediately. */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="fixed right-6 top-6 z-50 max-w-xs rounded-lg border border-danger bg-surface shadow-card"
          >
            <button
              type="button"
              onClick={() => setError(null)}
              className={clsx(
                "w-full rounded-lg px-4 py-3 text-left text-sm text-danger",
                FOCUS_RING
              )}
              aria-label={`Dismiss error: ${error}`}
            >
              {error}
            </button>
          </div>
        )}
      </main>
    </>
  );
}

function HomeForm(props: {
  destination: string;
  onDestinationChange: (v: string) => void;
  vibe: Vibe;
  onVibeChange: (v: Vibe) => void;
  loading: boolean;
  onSubmit: () => void;
  destinationRef: React.RefObject<HTMLInputElement>;
}) {
  const {
    destination,
    onDestinationChange,
    vibe,
    onVibeChange,
    loading,
    onSubmit,
    destinationRef,
  } = props;
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
        aria-label="Generate a new journey"
      >
        <label
          className="block text-sm font-semibold text-ink"
          htmlFor="destination"
        >
          Destination
        </label>
        <input
          id="destination"
          name="destination"
          type="text"
          ref={destinationRef}
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          placeholder="Try Jaipur, Kyoto, Lisbon…"
          className={clsx(
            "mt-2 w-full rounded-lg border border-border bg-bg px-4 py-3 font-serif text-lg text-ink placeholder:text-muted",
            "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
            "disabled:opacity-60"
          )}
          disabled={loading}
          maxLength={100}
          autoComplete="off"
          spellCheck="false"
          aria-required="true"
          aria-describedby="destination-hint"
        />
        <p id="destination-hint" className="mt-1 text-xs text-muted">
          Any city with a story. Max 100 characters.
        </p>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-ink">Vibe</legend>
          <p className="mt-1 text-xs text-muted">
            Pick a narrator. Same city, different soul.
          </p>
          {/*
           * Vibe chips are TOGGLE BUTTONS with aria-pressed for the currently
           * selected vibe. This uses native <button> semantics — no roving
           * tabindex, no custom arrow-key handling — so keyboard users get
           * standard Tab navigation and screen readers announce state
           * correctly. When one is picked the others are unpressed.
           */}
          <div className="mt-2 flex flex-wrap gap-2">
            {VIBES.map((v) => {
              const pressed = vibe === v.key;
              return (
                <VibeChip
                  key={v.key}
                  label={v.label}
                  pressed={pressed}
                  onClick={() => onVibeChange(v.key)}
                  disabled={loading}
                />
              );
            })}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "mt-8 w-full rounded-lg bg-accent px-6 py-3 text-base font-semibold text-surface transition-colors",
            "hover:bg-accent-hover disabled:opacity-60",
            FOCUS_RING
          )}
        >
          {loading ? "Weaving your journey…" : "Generate Journey"}
        </button>
      </form>
    </>
  );
}

function JourneyView(props: {
  journey: Journey;
  loading: boolean;
  expandedId: string | null;
  deepeningId: string | null;
  onToggleExpand: (stop: JourneyStop) => void;
  onRegenerate: (v: Vibe) => void;
  onReset: () => void;
  headingRef: React.RefObject<HTMLHeadingElement>;
}) {
  const {
    journey,
    loading,
    expandedId,
    deepeningId,
    onToggleExpand,
    onRegenerate,
    onReset,
    headingRef,
  } = props;
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {journey.destination} &middot; {vibeLabel(journey.vibe)}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className={clsx(
              "mt-2 font-serif text-3xl leading-tight md:text-4xl",
              FOCUS_RING
            )}
          >
            Your journey.
          </h1>
        </div>
        <button
          type="button"
          onClick={onReset}
          className={clsx(
            "whitespace-nowrap rounded text-sm font-semibold text-accent-hover hover:text-accent",
            FOCUS_RING
          )}
        >
          New destination
        </button>
      </div>

      <ol
        className="mt-10 space-y-6"
        aria-label={`Journey through ${journey.destination}`}
      >
        {journey.stops.map((stop, index) => (
          <li key={stop.id}>
            <StopCard
              stop={stop}
              index={index}
              expanded={expandedId === stop.id}
              deepening={deepeningId === stop.id}
              onClick={() => onToggleExpand(stop)}
            />
          </li>
        ))}
      </ol>

      <section
        className="mt-12 rounded-lg border border-border bg-surface-alt p-6"
        aria-labelledby="regenerate-title"
      >
        <p id="regenerate-title" className="text-sm font-semibold text-ink">
          Regenerate with a different vibe
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VIBES.map((v) => {
            const pressed = journey.vibe === v.key;
            return (
              <VibeChip
                key={v.key}
                label={v.label}
                pressed={pressed}
                onClick={() => onRegenerate(v.key)}
                disabled={loading}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}

/**
 * A single vibe toggle button. Uses `aria-pressed` so screen readers announce
 * the pressed/unpressed state; uses `aria-disabled` (rather than `disabled`)
 * during loading so the button remains focusable and its state is announced
 * as unavailable rather than vanishing from the tab order.
 */
function VibeChip(props: {
  label: string;
  pressed: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const { label, pressed, disabled, onClick } = props;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={clsx(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        pressed
          ? "border-accent bg-accent text-surface"
          : "border-accent-hover/60 bg-transparent text-accent-hover hover:border-accent-hover",
        disabled && "opacity-60 cursor-not-allowed",
        FOCUS_RING
      )}
    >
      {label}
    </button>
  );
}

/**
 * A journey stop card. The card is expandable; the trigger is a native
 * <button> that visually stretches across the article via `::before`, so
 * clicking anywhere on the card fires the expand handler. The stop name
 * lives outside the button — as a real <h2> — so heading navigation works
 * and the HTML is valid (a <button> cannot contain <h2>).
 */
function StopCard(props: {
  stop: JourneyStop;
  index: number;
  expanded: boolean;
  deepening: boolean;
  onClick: () => void;
}) {
  const { stop, index, expanded, deepening, onClick } = props;
  const detailId = `stop-${stop.id}-detail`;
  const cardId = `stop-${stop.id}-card`;
  return (
    <article
      id={cardId}
      className="relative isolate rounded-lg border border-border bg-surface p-6 shadow-card"
    >
      <p className="text-xs uppercase tracking-wider text-muted">
        Stop {index + 1}
      </p>
      <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
        {stop.name}
      </h2>

      <button
        type="button"
        onClick={onClick}
        aria-expanded={expanded}
        aria-controls={detailId}
        aria-label={`${expanded ? "Collapse" : "Expand"} deeper story for ${stop.name}`}
        className={clsx(
          "absolute inset-0 rounded-lg",
          "before:absolute before:inset-0 before:rounded-lg",
          FOCUS_RING
        )}
      />

      <p className="pointer-events-none mt-1 font-serif text-sm italic text-muted">
        {stop.hook}
      </p>
      <p className="pointer-events-none mt-4 font-serif text-base leading-relaxed text-ink">
        {stop.narrative}
      </p>

      <dl className="pointer-events-none mt-5 space-y-2 text-xs">
        <div className="flex flex-wrap gap-1">
          <dt className="uppercase tracking-wider text-muted">
            Heritage&nbsp;&middot;&nbsp;
          </dt>
          <dd className="text-ink">{stop.heritage_note}</dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div className="inline-flex items-center gap-2">
            <dt className="uppercase tracking-wider text-muted">Hidden gem</dt>
            <dd>
              <GemBadge score={stop.hidden_gem_score} />
            </dd>
          </div>
          <div className="flex flex-wrap gap-1">
            <dt className="uppercase tracking-wider text-muted">
              Nearby&nbsp;&middot;&nbsp;
            </dt>
            <dd className="text-ink">{stop.nearby_experience}</dd>
          </div>
        </div>
      </dl>

      {/*
       * The aria-live region is ALWAYS rendered so screen readers can pick up
       * subsequent changes. Its content is toggled instead of the region
       * itself — announcing content into a region that just materialized is
       * unreliable across AT implementations.
       */}
      <div
        id={detailId}
        aria-live="polite"
        className="pointer-events-none"
      >
        {expanded && (
          <div className="mt-6 border-t border-border pt-6">
            {deepening && !stop.deep_narrative && (
              <p className="font-serif text-sm text-muted" role="status">
                Deepening the story
                <span className="sr-only">, please wait</span>&hellip;
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
      </div>
    </article>
  );
}

function GemBadge({ score }: { score: number }) {
  const s = Math.max(0, Math.min(5, Math.round(score)));
  return (
    <span
      className="inline-flex items-center gap-[3px] align-middle"
      role="img"
      aria-label={`Hidden gem score ${s} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          aria-hidden="true"
          className={clsx(
            "block h-2 w-2 rounded-full",
            n <= s ? "bg-accent" : "bg-border"
          )}
        />
      ))}
    </span>
  );
}
