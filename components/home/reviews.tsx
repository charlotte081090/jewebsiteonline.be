"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocaleContext } from "@/components/locale-provider";
import { startHref } from "@/lib/i18n/path";

const PHOTOS = [
  "/reviews/evelien-photo.webp",
  "/reviews/charlotte-photo.webp",
  "/reviews/esther-photo.webp",
];

function Stars({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-terracotta"
          aria-hidden
        >
          <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.77l-5.8 3.05 1.11-6.47-4.7-4.58 6.49-.94L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

export function Reviews() {
  const { locale, dict } = useLocaleContext();

  return (
    <section
      id={dict.routes.anchors.reviews}
      className="relative overflow-hidden bg-forest text-cream"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(192,127,99,0.28), transparent 55%), radial-gradient(ellipse 50% 60% at 100% 20%, rgba(250,245,240,0.08), transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,245,240,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(250,245,240,0.35) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 70% 50%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta-soft">
            {dict.reviews.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {dict.reviews.title}
          </h2>
          <p className="mt-3 text-base text-cream/75 md:text-lg">
            {dict.reviews.intro}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {dict.reviews.items.map((review, i) => (
            <blockquote
              key={review.name}
              className="flex flex-col rounded-xl border border-cream/10 bg-cream/[0.06] p-5 backdrop-blur-[2px]"
            >
              <Stars label={dict.reviews.starsAria} />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-cream/90 md:text-[0.95rem]">
                “{review.quote}”
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-terracotta/40">
                  <Image
                    src={PHOTOS[i] ?? PHOTOS[0]}
                    alt={dict.reviews.photoAlt.replace("{name}", review.name)}
                    fill
                    className="object-cover object-top"
                    sizes="56px"
                  />
                </div>
                <cite className="not-italic">
                  <span className="block text-sm font-semibold text-cream">
                    {review.name}
                  </span>
                  <span className="text-xs text-cream/65">{review.role}</span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 border-t border-cream/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl font-semibold md:text-2xl">
            {dict.reviews.ctaTitle}
          </p>
          <Link
            href={startHref(locale, dict)}
            className="inline-flex rounded-md bg-terracotta px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
          >
            {dict.reviews.ctaButton}
          </Link>
        </div>
      </div>
    </section>
  );
}
