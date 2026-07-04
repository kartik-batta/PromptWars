export default function Home() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto max-w-wander px-4 py-16 md:px-6 md:py-24">
        <p className="mb-6 text-xs uppercase tracking-[0.22em] text-muted">
          Wander
        </p>
        <h1 className="font-serif text-4xl leading-tight md:text-5xl">
          Wander through a city's story.
        </h1>
        <p className="mt-4 font-serif text-lg leading-relaxed text-muted">
          Tell us where you're going. We'll write your journey.
        </p>

        <div className="mt-12 rounded-lg border border-border bg-surface p-6 shadow-card">
          <p className="font-serif text-base text-ink">
            The form goes here in Phase 1 — destination input, four vibe chips,
            and a Generate button. This placeholder confirms the palette, fonts,
            and Vercel deploy pipeline are wired up.
          </p>
        </div>

        <p className="mt-16 text-xs uppercase tracking-[0.22em] text-muted">
          Phase 0 · scaffold checkpoint
        </p>
      </section>
    </main>
  );
}
