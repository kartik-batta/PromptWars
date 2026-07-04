import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { StatusLine } from "@/components/StatusLine";

describe("StatusLine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const MESSAGES = ["First", "Second", "Third"] as const;

  it("renders the first message initially", () => {
    render(<StatusLine messages={MESSAGES} />);
    expect(screen.getByText("First")).toBeInTheDocument();
  });

  it("advances through messages on each interval tick", () => {
    render(<StatusLine messages={MESSAGES} intervalMs={100} />);
    expect(screen.getByText("First")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText("Second")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("holds on the last message rather than looping", () => {
    render(<StatusLine messages={MESSAGES} intervalMs={100} />);
    // Cascade transitions — each state change spawns the next setTimeout,
    // so advance in steps rather than one big jump.
    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }
    expect(screen.getByText("Third")).toBeInTheDocument();
    expect(screen.queryByText("First")).not.toBeInTheDocument();
  });

  it("announces to screen readers via aria-live=polite", () => {
    render(<StatusLine messages={MESSAGES} />);
    const region = screen.getByText("First");
    expect(region).toHaveAttribute("aria-live", "polite");
  });
});
