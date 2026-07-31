import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description:
    "Algemene voorwaarden van jewebsiteonline.be voor de gratis preview en websitepakketten.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://jewebsiteonline.be/voorwaarden",
  },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-forest">
        Algemene voorwaarden
      </h1>
      <p className="mt-3 text-sm text-muted">Laatst bijgewerkt: 31 juli 2026</p>

      <div className="prose-privacy mt-10 space-y-10 text-base leading-relaxed text-forest-muted">
        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            1. Wie zijn wij?
          </h2>
          <p className="mt-3">
            Deze algemene voorwaarden gelden voor alle diensten van
            jewebsiteonline.be (&ldquo;wij&rdquo;, &ldquo;ons&rdquo;): de gratis
            websitepreview en de levering van 1- of 3-pagina websites voor
            kleine en middelgrote ondernemingen in België en Nederland.
          </p>
          <p className="mt-3">
            Contact:{" "}
            <a
              href="mailto:info@jewebsiteonline.be"
              className="text-terracotta underline-offset-2 hover:underline"
            >
              info@jewebsiteonline.be
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            2. Gratis preview
          </h2>
          <p className="mt-3">
            Via het briefingformulier kunt u een gratis websitepreview aanvragen.
            De preview is vrijblijvend: u zit nergens aan vast tot u een pakket
            bevestigt en betaalt.
          </p>
          <p className="mt-3">
            Wij streven ernaar de preview binnen 48 uur na een volledige briefing
            te leveren. Die termijn is indicatief en kan langer zijn bij incomplete
            gegevens, hoge vraag of overmacht.
          </p>
          <p className="mt-3">
            De preview blijft eigendom van jewebsiteonline.be tot er een
            overeenkomst is voor een betaald pakket. U mag de preview niet
            commercieel hergebruiken of doorgeven zonder onze toestemming.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            3. Pakketten en prijzen
          </h2>
          <p className="mt-3">
            Na goedkeuring van de preview kunt u kiezen voor een 1-pagina of
            3-pagina websitepakket. De actuele prijzen staan op onze website. Alle
            bedragen zijn exclusief of inclusief btw zoals vermeld bij de
            prijsvermelding.
          </p>
          <p className="mt-3">
            Een overeenkomst komt tot stand wanneer u het pakket bevestigt en de
            betaling (of het overeengekomen voorschot) is ontvangen, tenzij
            schriftelijk anders afgesproken.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            4. Uw medewerking
          </h2>
          <p className="mt-3">
            Voor een goede preview en oplevering heeft u ons nodig: correcte
            bedrijfsgegevens, teksten, logo, foto&apos;s en snelle feedback. Als
            gegevens ontbreken of onjuist zijn, kan dat de planning en het
            resultaat beïnvloeden.
          </p>
          <p className="mt-3">
            U garandeert dat u rechten heeft op alle materialen die u aanlevert
            (teksten, logo&apos;s, beelden) en dat die geen rechten van derden
            schenden.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            5. Levering en revisions
          </h2>
          <p className="mt-3">
            Na betaling leveren wij de website volgens het gekozen pakket. Kleine
            tekst- of beeldcorrecties binnen de scope van het pakket zijn
            inbegrepen zoals afgesproken bij bestelling. Extra pagina&apos;s,
            functionaliteit of grote herontwerpen vallen buiten het standaardpakket
            en worden vooraf besproken.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            6. Domein, hosting en onderhoud
          </h2>
          <p className="mt-3">
            Tenzij anders overeengekomen, regelen wij hosting en publicatie zoals
            in het pakket beschreven. Domeinnaamregistratie kan apart verlopen
            (via u of via ons). Kosten van derden (domein, e-mail, extra
            diensten) zijn voor uw rekening tenzij anders vermeld.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            7. Intellectuele eigendom
          </h2>
          <p className="mt-3">
            Na volledige betaling krijgt u een gebruiksrecht op de opgeleverde
            website voor uw onderneming. Ons ontwerpproces, templates en
            niet-opgeleverde concepten blijven van jewebsiteonline.be, tenzij
            schriftelijk anders afgesproken.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            8. Aansprakelijkheid
          </h2>
          <p className="mt-3">
            Wij leveren de dienst met zorg. Onze aansprakelijkheid is beperkt tot
            het bedrag dat u voor het betreffende pakket heeft betaald, voor zover
            de wet dat toelaat. Wij zijn niet aansprakelijk voor indirecte schade,
            omzetverlies of problemen bij derden (hosting, domein, e-mail).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            9. Privacy
          </h2>
          <p className="mt-3">
            Hoe wij persoonsgegevens verwerken, staat in ons{" "}
            <Link
              href="/privacy"
              className="text-terracotta underline-offset-2 hover:underline"
            >
              privacybeleid
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">
            10. Wijzigingen en toepasselijk recht
          </h2>
          <p className="mt-3">
            Wij kunnen deze voorwaarden aanpassen. De datum bovenaan deze pagina
            toont de laatste versie. Op nieuwe bestellingen geldt de versie die
            op dat moment online staat.
          </p>
          <p className="mt-3">
            Op deze voorwaarden is Belgisch recht van toepassing. Geschillen
            horen bij de bevoegde rechtbanken in België, tenzij dwingend recht
            anders bepaalt.
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
