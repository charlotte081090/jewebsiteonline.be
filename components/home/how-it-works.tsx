"use client";

import { useEffect, useRef, useState } from "react";
import { useLocaleContext } from "@/components/locale-provider";

function LiveConfetti() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 -top-4 bottom-0 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-terracotta celebrate-particle"
          style={{
            left: `${6 + ((i * 19) % 88)}%`,
            top: `${12 + ((i * 29) % 70)}%`,
            animationDelay: `${(i % 8) * 0.07}s`,
            width: i % 3 === 0 ? 6 : 4,
            height: i % 4 === 0 ? 8 : 4,
            borderRadius: i % 2 === 0 ? 999 : 2,
          }}
        />
      ))}
    </div>
  );
}

export function HowItWorks() {
  const { dict } = useLocaleContext();
  const steps = dict.howItWorks.steps;
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRowRef = useRef<HTMLDivElement>(null);
  const firstDotRef = useRef<HTMLSpanElement>(null);
  const lastDotRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [line, setLine] = useState({ left: 12, width: 0 });
  const isLive = active === steps.length - 1;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = track.getBoundingClientRect();
        const viewH = window.innerHeight;
        const total = Math.max(track.offsetHeight - viewH, 1);
        // Start progress before the track pins at the top, so the first
        // column lights while the section is still entering the viewport.
        const lead = viewH * 0.45;
        const scrolled = Math.min(Math.max(-rect.top + lead, 0), total + lead);
        const progress = Math.min(0.999, scrolled / (total + lead));
        const next = Math.min(
          steps.length - 1,
          Math.floor(progress * steps.length),
        );
        setActive(next);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [steps.length]);

  useEffect(() => {
    function measureLine() {
      const row = dotsRowRef.current;
      const first = firstDotRef.current;
      const last = lastDotRef.current;
      if (!row || !first || !last) return;
      const rowBox = row.getBoundingClientRect();
      const firstBox = first.getBoundingClientRect();
      const lastBox = last.getBoundingClientRect();
      const firstCenter = firstBox.left + firstBox.width / 2 - rowBox.left;
      const lastCenter = lastBox.left + lastBox.width / 2 - rowBox.left;
      setLine({
        left: firstCenter,
        width: Math.max(lastCenter - firstCenter, 0),
      });
    }

    measureLine();
    const timer = window.setTimeout(measureLine, 100);
    window.addEventListener("resize", measureLine);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measureLine);
    };
  }, []);

  const fillPercent =
    steps.length <= 1 ? 0 : (active / (steps.length - 1)) * 100;

  return (
    <section
      id={dict.routes.anchors.howItWorks}
      className="border-t border-border/70 bg-cream"
    >
      <div ref={trackRef} className="relative md:h-[165vh]">
        <div className="md:sticky md:top-[var(--site-header-offset)] md:flex md:min-h-[calc(100svh-var(--site-header-offset))] md:items-center md:py-10">
          <div className="relative mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-12">
            {isLive ? <LiveConfetti /> : null}

            <div className="relative z-10 max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-forest md:text-4xl">
                {dict.howItWorks.title}
              </h2>
              <p className="mt-4 text-lg text-muted">{dict.howItWorks.intro}</p>
            </div>

            {/* Mobile: vertical timeline */}
            <ol className="relative z-10 mt-14 flex flex-col md:hidden">
              <div
                className="absolute bottom-3 left-[0.6875rem] top-3 w-px bg-border"
                aria-hidden
              />
              <div
                className="absolute left-[0.6875rem] top-3 w-px origin-top bg-terracotta transition-[height] duration-500 ease-out"
                style={{
                  height: `calc((100% - 1.5rem) * ${fillPercent / 100})`,
                }}
                aria-hidden
              />
              {steps.map((step, index) => {
                const lit = index <= active;
                const current = index === active;
                return (
                  <li
                    key={step.title}
                    className={`relative flex gap-5 pb-10 last:pb-0 transition-opacity duration-500 ${
                      lit ? "opacity-100" : "opacity-35"
                    }`}
                  >
                    <span
                      className={`relative z-10 mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-cream transition-colors duration-500 ${
                        lit ? "border-terracotta" : "border-border"
                      }`}
                      aria-hidden
                    >
                      <span
                        className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                          current
                            ? "bg-terracotta"
                            : lit
                              ? "bg-terracotta/50"
                              : "bg-transparent"
                        }`}
                      />
                    </span>
                    <div>
                      <p
                        className={`text-[0.7rem] font-semibold uppercase tracking-wider transition-colors duration-500 ${
                          lit ? "text-terracotta" : "text-muted"
                        }`}
                      >
                        {step.time}
                      </p>
                      <h3
                        className={`mt-1.5 font-display text-xl font-bold transition-colors duration-500 ${
                          current
                            ? "text-forest"
                            : lit
                              ? "text-forest-muted"
                              : "text-muted"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {step.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Desktop */}
            <div className="relative z-10 mt-16 hidden md:block">
              <div ref={dotsRowRef} className="relative mb-5 h-6">
                <div
                  className="absolute top-1/2 h-px -translate-y-1/2 bg-border"
                  style={{ left: line.left, width: line.width }}
                  aria-hidden
                />
                <div
                  className="absolute top-1/2 h-px -translate-y-1/2 bg-terracotta transition-[width] duration-500 ease-out"
                  style={{
                    left: line.left,
                    width: line.width * (fillPercent / 100),
                  }}
                  aria-hidden
                />
                <div className="relative grid h-6 grid-cols-5 gap-4 lg:gap-6">
                  {steps.map((step, index) => {
                    const lit = index <= active;
                    const current = index === active;
                    return (
                      <div key={step.title} className="flex justify-start">
                        <span
                          ref={
                            index === 0
                              ? firstDotRef
                              : index === steps.length - 1
                                ? lastDotRef
                                : undefined
                          }
                          className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-cream transition-all duration-500 ${
                            current
                              ? "border-terracotta shadow-[0_0_0_4px_rgba(255,46,0,0.12)]"
                              : lit
                                ? "border-terracotta"
                                : "border-border"
                          }`}
                          aria-hidden
                        >
                          <span
                            className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                              lit ? "bg-terracotta" : "bg-transparent"
                            }`}
                          />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <ol className="grid grid-cols-5 gap-4 lg:gap-6">
                {steps.map((step, index) => {
                  const lit = index <= active;
                  const current = index === active;
                  return (
                    <li
                      key={step.title}
                      className={`relative flex flex-col transition-opacity duration-500 ${
                        lit ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      <p
                        className={`text-[0.7rem] font-semibold uppercase tracking-wider transition-colors duration-500 ${
                          lit ? "text-terracotta" : "text-muted"
                        }`}
                      >
                        {step.time}
                      </p>
                      <h3
                        className={`mt-1.5 font-display text-xl font-bold transition-colors duration-500 ${
                          current
                            ? "text-forest"
                            : lit
                              ? "text-forest-muted"
                              : "text-muted"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`mt-2 text-sm leading-relaxed transition-colors duration-500 lg:text-base ${
                          current ? "text-muted" : "text-muted/80"
                        }`}
                      >
                        {step.body}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
