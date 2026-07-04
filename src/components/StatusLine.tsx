"use client";

import { useEffect, useState } from "react";

/**
 * Cycling status line shown during journey generation. Cycles through the
 * provided messages every `intervalMs` (default 2000). Stops on the last
 * message rather than looping so if generation runs long, the final message
 * feels like the plateau, not a fidget.
 *
 * Testable: pass a fake `now` clock or use vitest's fake timers to advance.
 */
export function StatusLine(props: {
  messages: readonly string[];
  intervalMs?: number;
}) {
  const { messages, intervalMs = 2000 } = props;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= messages.length - 1) return;
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, messages.length - 1)), intervalMs);
    return () => clearTimeout(t);
  }, [index, messages.length, intervalMs]);

  // Reset the index if the messages array identity changes (new generation).
  useEffect(() => {
    setIndex(0);
  }, [messages]);

  return (
    <span aria-live="polite" className="inline-block">
      {messages[index]}
    </span>
  );
}
