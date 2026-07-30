import Image from "next/image";
import Link from "next/link";

const reviews = [
  {
    quote:
      "De preview voelde meteen als Mellow. Na goedkeuring stonden we de dag erna live, precies in onze sfeer en klaar voor nieuwe leden.",
    name: "Evelien",
    role: "Oprichter van Mellow",
    image: "/reviews/evelien-photo.webp",
  },
  {
    quote:
      "Snel, helder en zonder technisch gedoe. De site straalt meteen de energie van FreeBeyondBorders uit.",
    name: "Charlotte",
    role: "Oprichter van FreeBeyondBorders",
    image: "/reviews/charlotte-photo.webp",
  },
  {
    quote:
      "Ik had eindelijk een professionele site die vertrouwen wekt. Klanten vinden me sneller en boeken eenvoudiger een consult.",
    name: "Esther",
    role: "Voedingscoach, VitaminEsthi",
    image: "/reviews/esther-photo.webp",
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5" aria-label="5 van 5 sterren">
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
  return (
    <section id="reviews" className="relative overflow-hidden bg-forest text-cream">
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
            Reviews
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Wat ondernemers zeggen
          </h2>
          <p className="mt-3 text-base text-cream/75 md:text-lg">
            Zo ervaren ondernemers hun nieuwe website: helder proces, snelle
            oplevering en meer aanvragen.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {reviews.map((review) => (
            <blockquote
              key={review.name}
              className="flex flex-col rounded-xl border border-cream/10 bg-cream/[0.06] p-5 backdrop-blur-[2px]"
            >
              <Stars />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-cream/90 md:text-[0.95rem]">
                “{review.quote}”
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-terracotta/40">
                  <Image
                    src={review.image}
                    alt={`Profielfoto van ${review.name}`}
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
            Klaar voor uw gratis preview?
          </p>
          <Link
            href="/start-nu"
            className="inline-flex rounded-md bg-terracotta px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
          >
            Start uw briefing
          </Link>
        </div>
      </div>
    </section>
  );
}
