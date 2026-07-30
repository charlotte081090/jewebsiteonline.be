import Link from "next/link";

const included = [
  "Hosting inbegrepen",
  "SEO-basis",
  "SSL-certificaat",
  "Mobielvriendelijk design",
];

const packages = [
  {
    name: "1-pagina",
    price: "€199",
    originalPrice: null as string | null,
    description:
      "Een professionele landingspagina voor Belgische KMO's: wie u bent, wat u doet en hoe klanten u vinden en bereiken.",
    highlights: [
      "Eén krachtige landingspagina",
      "Contact en duidelijke knop naar actie",
      "Preview in 48 uur, live na goedkeuring",
    ],
    featured: false,
  },
  {
    name: "3-pagina",
    price: "€349",
    originalPrice: "€399",
    description:
      "Meer zichtbaarheid online met startpagina, diensten of over ons, en contact. Extra pagina's voor sterkere SEO en een completer merkverhaal.",
    highlights: [
      "Drie gerichte pagina's",
      "Meer tekst en SEO-pagina's",
      "Preview in 48 uur, live na goedkeuring",
    ],
    featured: true,
  },
];

export function Pricing() {
  return (
    <section id="prijzen">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
            Transparantie
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest md:text-4xl">
            Prijzen & pakketten
          </h2>
          <p className="mt-4 text-lg text-muted">
            Duidelijke prijzen. Geen verrassingen. Kies wat past bij uw zaak.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2 md:gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`group relative flex h-full flex-col rounded-xl border p-8 transition-transform duration-300 ${
                pkg.featured
                  ? "border-terracotta/50 bg-cream shadow-[6px_8px_0_0_rgba(27,48,34,0.12),10px_14px_28px_-8px_rgba(27,48,34,0.18)] ring-1 ring-terracotta/25 hover:-translate-y-1 hover:shadow-[8px_10px_0_0_rgba(27,48,34,0.14),12px_18px_32px_-8px_rgba(27,48,34,0.22)]"
                  : "border-border/80 bg-cream"
              }`}
            >
              <div className="min-h-5">
                {pkg.featured ? (
                  <span className="inline-flex rounded-full bg-terracotta/12 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-terracotta">
                    Meest gekozen
                  </span>
                ) : null}
              </div>

              <h3 className="mt-4 font-display text-3xl font-semibold text-forest">
                {pkg.name}
              </h3>

              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                {pkg.originalPrice ? (
                  <span className="font-display text-2xl font-semibold text-muted line-through decoration-terracotta/70">
                    {pkg.originalPrice}
                  </span>
                ) : null}
                <p className="font-display text-5xl font-semibold tracking-tight text-forest">
                  {pkg.price}
                </p>
              </div>

              <p className="mt-5 text-base leading-relaxed text-muted">
                {pkg.description}
              </p>

              <ul className="mt-6 flex flex-col gap-2.5">
                {pkg.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2.5 text-sm text-forest-muted"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <Link
                  href="/start-nu"
                  className={`inline-flex w-full items-center justify-center rounded-md px-5 py-3.5 text-sm font-semibold transition-colors ${
                    pkg.featured
                      ? "bg-terracotta text-cream hover:bg-terracotta-hover"
                      : "border border-forest/25 bg-transparent text-forest hover:border-forest/45 hover:bg-cream-dark/60"
                  }`}
                >
                  Vraag gratis preview aan
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-border/80 bg-cream-dark/40 px-6 py-5">
          <p className="text-sm font-semibold text-forest">Altijd inclusief</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {included.map((item) => (
              <li key={item} className="text-sm text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
