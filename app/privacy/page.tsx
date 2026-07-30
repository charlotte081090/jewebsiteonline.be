import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description:
    "Privacy- en cookiebeleid van jewebsiteonline.be — hoe wij persoonsgegevens verwerken.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://jewebsiteonline.be/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-forest">
        Privacybeleid
      </h1>
      <p className="mt-3 text-sm text-muted">Laatst bijgewerkt: 28 juli 2026</p>

      <div className="prose-privacy mt-10 space-y-10 text-base leading-relaxed text-forest-muted">
        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            1. Wie zijn wij?
          </h2>
          <p className="mt-3">
            jewebsiteonline.be (&ldquo;wij&rdquo;, &ldquo;ons&rdquo;) biedt
            professionele 1- en 3-pagina websites aan voor kleine en middelgrote
            ondernemingen in België en Nederland.
          </p>
          <p className="mt-3">
            <strong className="text-forest">Verwerkingsverantwoordelijke:</strong>
            <br />
            jewebsiteonline.be
            <br />
            E-mail:{" "}
            <a
              href="mailto:info@jewebsiteonline.be"
              className="text-terracotta underline-offset-2 hover:underline"
            >
              info@jewebsiteonline.be
            </a>
            <br />
            <span className="text-sm text-muted">
              (Volledige vennootschapsgegevens — adres en BTW-nummer — worden
              hier aangevuld zodra beschikbaar.)
            </span>
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            2. Welke gegevens verzamelen wij?
          </h2>
          <p className="mt-3">
            Via ons briefingformulier op de contactpagina kunnen wij volgende
            gegevens ontvangen:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Bedrijfsnaam</li>
            <li>Sector</li>
            <li>Hoofddoel van de website</li>
            <li>Informatie over logo/huisstijl en eventuele bestanden die u uploadt</li>
            <li>E-mailadres en telefoonnummer</li>
          </ul>
          <p className="mt-3">
            Daarnaast kunnen technische gegevens (zoals IP-adres, browsertype en
            tijdstip) kortstondig in serverlogs verschijnen via onze hosting.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            3. Doeleinden en rechtsgrond
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-forest">Preview &amp; offertes:</strong>{" "}
              verwerken van uw aanvraag en opstellen van een websitepreview
              (uitvoering van precontractuele stappen / gerechtvaardigd belang).
            </li>
            <li>
              <strong className="text-forest">Communicatie:</strong> contact
              opnemen over uw aanvraag (contract / gerechtvaardigd belang).
            </li>
            <li>
              <strong className="text-forest">Websitewerking:</strong> veilige
              hosting en essentiële cookies (gerechtvaardigd belang /
              noodzakelijk voor de dienst).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            4. Geen tracking van Google
          </h2>
          <p className="mt-3">
            Wij gebruiken momenteel{" "}
            <strong className="text-forest">geen</strong> Google Analytics, Google
            Tag Manager of Google Search Console tracking-scripts op deze
            website. Er worden geen marketing- of advertentiecookies geplaatst
            voor analyse via Google.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            5. Verwerkers &amp; technologie
          </h2>
          <p className="mt-3">
            Om deze site en het contactformulier te laten werken, gebruiken wij
            volgende diensten (verwerkers):
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-forest">Vercel Inc.</strong> — hosting,
              content delivery (CDN) en serverfuncties. Meer info:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta underline-offset-2 hover:underline"
              >
                Vercel Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong className="text-forest">Resend</strong> — verzending van
              e-mails met uw briefinggegevens naar{" "}
              <span className="text-forest">info@jewebsiteonline.be</span>. Meer
              info:{" "}
              <a
                href="https://resend.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta underline-offset-2 hover:underline"
              >
                Resend Privacy Policy
              </a>
              .
            </li>
          </ul>
          <p className="mt-3">
            Gegevens kunnen worden verwerkt buiten de EER (o.a. Verenigde
            Staten). Waar nodig gebeurt dit op basis van passende
            waarborgen (zoals standaardcontractbepalingen) van de betreffende
            aanbieder.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            6. Bewaartermijnen
          </h2>
          <p className="mt-3">
            Contact- en briefinggegevens bewaren wij zolang nodig om uw aanvraag
            te behandelen en voor een redelijke periode daarna (doorgaans max. 24
            maanden), tenzij een langere bewaartermijn wettelijk vereist is of u
            klant wordt (dan volgens onze administratieve plichten).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            7. Uw rechten
          </h2>
          <p className="mt-3">
            Onder de AVG (GDPR) heeft u onder meer recht op inzage, rectificatie,
            wissing, beperking van de verwerking, overdraagbaarheid en bezwaar.
            U mag ook een klacht indienen bij de Gegevensbeschermingsautoriteit
            (België) of de Autoriteit Persoonsgegevens (Nederland).
          </p>
          <p className="mt-3">
            Contacteer ons via{" "}
            <a
              href="mailto:info@jewebsiteonline.be"
              className="text-terracotta underline-offset-2 hover:underline"
            >
              info@jewebsiteonline.be
            </a>
            .
          </p>
        </section>

        <section id="cookies" className="scroll-mt-24">
          <h2 className="font-display text-2xl font-semibold text-forest">
            8. Cookies
          </h2>
          <p className="mt-3">
            Wij gebruiken enkel{" "}
            <strong className="text-forest">noodzakelijke cookies</strong>:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-forest">Cookievoorkeur</strong> (
              <code className="text-sm">jwo-cookie-consent</code>) — onthoudt of
              u de cookiemelding heeft bevestigd. Bewaartermijn: 1 jaar.
            </li>
            <li>
              <strong className="text-forest">Technische / hostingcookies</strong>{" "}
              — Vercel kan strikt noodzakelijke technische cookies of
              beveiligingsmaatregelen gebruiken om de site betrouwbaar te
              leveren.
            </li>
          </ul>
          <p className="mt-3">
            Er worden geen analytics- of marketingcookies geplaatst zolang wij
            geen trackingtools (zoals Google Analytics) activeren. Bij een
            wijziging werken wij dit beleid bij en vragen wij indien nodig
            opnieuw toestemming.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            9. Wijzigingen
          </h2>
          <p className="mt-3">
            Wij kunnen dit privacybeleid aanpassen. De datum bovenaan deze
            pagina geeft de laatste versie aan.
          </p>
        </section>

        <p className="pt-4">
          <Link
            href="/"
            className="font-medium text-terracotta underline-offset-2 hover:underline"
          >
            ← Terug naar home
          </Link>
        </p>
      </div>
    </article>
  );
}
