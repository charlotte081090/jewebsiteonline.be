const steps = [
  {
    title: "Briefing",
    time: "10 tot 15 min",
    copy: "Laat uw gegevens achter via het briefingformulier. Vertel wie u bent en wat u nodig heeft.",
  },
  {
    title: "Gratis preview",
    time: "binnen 48 uur",
    copy: "Wij maken een gratis ontwerp. U ontvangt een preview, zonder verplichtingen.",
  },
  {
    title: "Feedback",
    time: "1 revisieronde",
    copy: "Geef uw feedback wanneer het u uitkomt. We stemmen alles af op uw merk.",
  },
  {
    title: "Bijgewerkte versie",
    time: "binnen 24 uur",
    copy: "Na ontvangst van uw feedback krijgt u de aangepaste versie, klaar voor een laatste check.",
  },
  {
    title: "Live zetten",
    time: "dezelfde dag",
    copy: "Na uw goedkeuring zetten we de website live, vaak nog dezelfde dag.",
  },
];

export function HowItWorks() {
  return (
    <section id="hoe-het-werkt">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
            De oplossing
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest md:text-4xl">
            Hoe het werkt
          </h2>
          <p className="mt-4 text-lg text-muted">
            Van briefing tot live website in vijf duidelijke stappen. Preview
            binnen 48 uur, live binnen een dag na goedkeuring.
          </p>
        </div>

        <div className="relative mt-14 md:mt-16">
          <div
            className="absolute bottom-3 left-[0.6875rem] top-3 w-px bg-border md:hidden"
            aria-hidden
          />

          <ol className="flex flex-col md:grid md:grid-cols-5 md:gap-4 lg:gap-6">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative flex gap-5 pb-10 last:pb-0 md:flex-col md:gap-0 md:pb-0"
              >
                {index < steps.length - 1 ? (
                  <span
                    className="absolute top-[0.6875rem] left-3 z-0 hidden h-px bg-border md:block md:right-[calc(-1rem-0.75rem)] lg:right-[calc(-1.5rem-0.75rem)]"
                    aria-hidden
                  />
                ) : null}
                <span
                  className="relative z-10 mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-terracotta bg-cream md:mt-0"
                  aria-hidden
                >
                  <span className="h-2 w-2 rounded-full bg-terracotta" />
                </span>
                <div className="md:mt-5">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-terracotta">
                    {step.time}
                  </p>
                  <h3 className="mt-1.5 font-display text-xl font-semibold text-forest">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted lg:text-base">
                    {step.copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
