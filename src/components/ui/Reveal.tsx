"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades + rises its children into view on scroll — as a progressive enhancement
 * only. The content is fully visible by default, so a failed hydration, missing
 * IntersectionObserver, or reduced-motion preference never leaves it hidden.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  as?: React.ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  // Start hidden ONLY once we know JS is running and can animate it back in.
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    // Below the fold: hide, then reveal on scroll. In view already: leave static.
    if (el.getBoundingClientRect().top > window.innerHeight - 40) {
      setState("hidden");
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setState("shown");
            io.disconnect();
          }
        },
        { threshold: 0, rootMargin: "0px 0px -10% 0px" },
      );
      io.observe(el);
      const t = setTimeout(() => setState("shown"), 1500);
      return () => {
        io.disconnect();
        clearTimeout(t);
      };
    }
  }, []);

  const style =
    state === "static"
      ? undefined
      : {
          opacity: state === "shown" ? 1 : 0,
          transform: state === "shown" ? "translateY(0)" : "translateY(16px)",
          transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        };

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
