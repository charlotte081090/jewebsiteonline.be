import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bedankt",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://jewebsiteonline.be/bedankt",
  },
};

type BedanktPageProps = {
  searchParams: Promise<{ naam?: string | string[] }>;
};

export default async function BedanktPage({ searchParams }: BedanktPageProps) {
  const params = await searchParams;
  const raw = params.naam;
  const name = (Array.isArray(raw) ? raw[0] : raw)?.trim() || "";

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 88% 8%, rgba(192,127,99,0.14), transparent 55%), radial-gradient(ellipse 40% 35% at 8% 70%, rgba(27,48,34,0.05), transparent 50%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[calc(100svh-var(--site-header-height))] max-w-6xl items-center justify-center px-5 py-14 md:px-8 md:py-20">
        <div className="animate-fade-up w-full max-w-xl py-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/15 text-2xl text-terracotta">
            ✓
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold text-forest md:text-4xl">
            {name ? `Bedankt ${name}` : "Bedankt"}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted">
            We gaan aan de slag. U ontvangt uw gratis preview binnen 48 uur.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-md bg-terracotta px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
          >
            Terug naar website
          </Link>
        </div>
      </div>
    </div>
  );
}
