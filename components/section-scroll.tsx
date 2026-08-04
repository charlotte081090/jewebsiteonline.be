"use client";

import { useEffect } from "react";

export function SectionScroll({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timer = window.setTimeout(() => {
      if (sectionId === "home") {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        return;
      }
      const el = document.getElementById(sectionId);
      if (!el) return;
      el.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [sectionId]);

  return null;
}
