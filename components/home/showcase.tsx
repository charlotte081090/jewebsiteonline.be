"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HeroPulse } from "@/components/home/hero-pulse";
import { useLocaleContext } from "@/components/locale-provider";

const VISUALS = [
  { bg: "#f3ebe3", image: "/examples/vitaminesthi.png" },
  { bg: "#e8e4dc", image: "/examples/mellow.webp" },
  { bg: "#e8eee4", image: "/examples/freebeyondborders.png" },
  { bg: "#f3e4dc", image: "/examples/salon-placeholder.webp" },
];

export function Showcase() {
  const { dict } = useLocaleContext();
  const items = dict.portfolio.items.map((item, i) => ({
    ...item,
    bg: VISUALS[i]?.bg ?? "#f3e4dc",
    image: VISUALS[i]?.image ?? "/examples/salon-placeholder.webp",
  }));
  const total = items.length;
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(2);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const nextVisible = mq.matches ? 2 : 1;
      setVisible(nextVisible);
      setIndex((i) => Math.min(i, Math.max(0, total - nextVisible)));
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [total]);

  const maxIndex = Math.max(0, total - visible);
  const canPrev = index > 0;
  const canNext = index < maxIndex;

  return (
    <section id={dict.routes.anchors.examples} className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-14">
        <div className="flex justify-center">
          <HeroPulse tone="light" className="self-center lg:self-center" />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center md:gap-10 md:px-8 md:py-20 lg:gap-14">
        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
            {dict.showcase.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {dict.showcase.title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            {dict.showcase.body}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={!canPrev}
              aria-label={dict.showcase.prev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest/20 text-forest transition-colors hover:border-forest/40 hover:bg-cream-dark/50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
              disabled={!canNext}
              aria-label={dict.showcase.next}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest/20 text-forest transition-colors hover:border-forest/40 hover:bg-cream-dark/50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" aria-live="polite">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${(total / visible) * 100}%`,
              transform: `translateX(-${(index / total) * 100}%)`,
            }}
          >
            {items.map((item) => (
              <article
                key={item.name}
                className="group box-border px-2 sm:px-3"
                style={{ width: `${100 / total}%` }}
              >
                <div
                  className="relative aspect-[4/5] overflow-hidden rounded-2xl"
                  style={{ backgroundColor: item.bg }}
                >
                  <div className="absolute inset-x-[10%] top-[6%] bottom-[5%] overflow-hidden rounded-[1.2rem] border-[3px] border-forest/15 bg-cream shadow-md transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="relative h-full w-full">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 85vw, 300px"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-terracotta">
                  {item.category}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-forest">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{item.focus}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={direction === "left" ? "rotate-180" : undefined}
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
