"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Example = {
  sector: string;
  title: string;
  focus: string;
  bg: string;
  image: string;
  alt: string;
};

const examples: Example[] = [
  {
    sector: "Kapper",
    title: "Salon",
    focus: "Afspraak boeken & openingstijden",
    bg: "#f3e4dc",
    image: "/examples/salon-placeholder.webp",
    alt: "Mobiele website preview van Salon",
  },
  {
    sector: "Pilates studio",
    title: "Mellow",
    focus: "Wellnessboutique, lessen en sfeer",
    bg: "#e8e4dc",
    image: "/examples/mellow.webp",
    alt: "Mobiele website preview van Mellow wellbeing boutique",
  },
  {
    sector: "Voedingscoaching",
    title: "VitaminEsthi",
    focus: "Holistische voedingstherapie, Esther",
    bg: "#f3ebe3",
    image: "/examples/vitaminesthi.png",
    alt: "Mobiele website preview van VitaminEsthi",
  },
  {
    sector: "Community",
    title: "FreeBeyondBorders",
    focus: "Vrijheid, impact en inkomen, webinar",
    bg: "#e8eee4",
    image: "/examples/freebeyondborders.png",
    alt: "Mobiele website preview van FreeBeyondBorders",
  },
];

export function Portfolio() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const nextVisible = mq.matches ? 3 : 1;
      setVisible(nextVisible);
      setIndex((i) => Math.min(i, Math.max(0, examples.length - nextVisible)));
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const maxIndex = Math.max(0, examples.length - visible);
  const canPrev = index > 0;
  const canNext = index < maxIndex;

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    setIndex((i) => Math.min(maxIndex, i + 1));
  }

  return (
    <section
      id="voorbeelden"
      className="border-y border-border/70 bg-cream-dark/35"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
              Zij gingen u voor
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest md:text-4xl">
              Voorbeelden die werken
            </h2>
            <p className="mt-4 text-lg text-muted">
              Elke site is mobielvriendelijk, snel en klaar om klanten binnen te
              halen, of u nu kapper, studio of coach bent.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={!canPrev}
              aria-label="Vorige voorbeelden"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-forest/20 text-forest transition-colors hover:border-forest/40 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              aria-label="Volgende voorbeelden"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-forest/20 text-forest transition-colors hover:border-forest/40 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div className="mt-14 overflow-hidden" aria-live="polite">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${(examples.length / visible) * 100}%`,
              transform: `translateX(-${(index / examples.length) * 100}%)`,
            }}
          >
            {examples.map((item) => (
              <article
                key={item.title}
                className="group box-border px-2 sm:px-3 md:px-4"
                style={{ width: `${100 / examples.length}%` }}
              >
                <div
                  className="relative aspect-[4/5] overflow-hidden rounded-2xl"
                  style={{ backgroundColor: item.bg }}
                >
                  <div className="absolute inset-x-[16%] top-[8%] bottom-[6%] overflow-hidden rounded-[1.35rem] border-[3px] border-forest/15 bg-cream shadow-md transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="relative h-full w-full">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 80vw, 280px"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-terracotta">
                  {item.sector}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-forest">
                  {item.title}
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
