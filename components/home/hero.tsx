"use client";

import Image from "next/image";
import { SectionLink } from "@/components/section-link";
import { useLocaleContext } from "@/components/locale-provider";
import { anchorHref } from "@/lib/i18n/path";

const SOCIAL_PROOF_PHOTOS = [
  "/reviews/evelien-photo.webp",
  "/reviews/charlotte-photo.webp",
  "/reviews/esther-photo.webp",
] as const;

function SocialProofStars({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-amber-300"
          aria-hidden
        >
          <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.77l-5.8 3.05 1.11-6.47-4.7-4.58 6.49-.94L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

export function Hero() {
  const { locale, dict } = useLocaleContext();

  return (
    <section
      id={dict.routes.anchors.top}
      className="bg-cream p-3 md:p-4"
    >
      <div className="relative flex min-h-[calc(100svh-1.5rem)] items-center justify-center overflow-hidden rounded-[1.5rem] md:min-h-[calc(100svh-2rem)] md:rounded-[2rem]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-cover-workspace.jpg"
            alt={dict.hero.imageAlt}
            fill
            priority
            fetchPriority="high"
            quality={72}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1440px"
            className="object-cover object-[center_40%]"
          />
        </div>

        <div
          className="absolute inset-0 z-[1]"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0.52) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-24 text-center md:px-8 md:py-28">
          <h1 className="animate-fade-up max-w-3xl font-display text-4xl font-bold leading-[1.15] tracking-tight text-cream sm:text-5xl md:text-6xl lg:text-[3.5rem] drop-shadow-[0_2px_18px_rgba(27,48,34,0.35)]">
            {dict.hero.title}
          </h1>

          <p className="animate-fade-up delay-1 mt-6 max-w-lg whitespace-pre-line text-base leading-relaxed text-cream/90 sm:text-lg">
            {dict.hero.body}
          </p>

          <div className="animate-fade-up delay-2 mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <SectionLink
              href={anchorHref(locale, dict, "pricing")}
              className="inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover sm:text-base"
            >
              {dict.hero.ctaPrimary}
            </SectionLink>
            <SectionLink
              href={anchorHref(locale, dict, "examples")}
              className="inline-flex items-center justify-center rounded-full border border-cream/55 bg-cream/10 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:border-cream hover:bg-cream/20 sm:text-base"
            >
              {dict.hero.ctaSecondary}
            </SectionLink>
          </div>

          <div className="animate-fade-up delay-3 mt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-2.5" aria-hidden>
              {SOCIAL_PROOF_PHOTOS.map((src, i) => (
                <div
                  key={src}
                  className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-cream/90"
                  style={{ zIndex: SOCIAL_PROOF_PHOTOS.length - i }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="36px"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-start gap-0.5 text-left">
              <SocialProofStars label={dict.hero.socialProofStarsAria} />
              <p className="text-xs font-medium text-cream/85 sm:text-sm">
                {dict.hero.socialProof}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
