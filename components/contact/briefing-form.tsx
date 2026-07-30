"use client";

import { submitBriefing } from "@/app/actions/contact";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

const SECTORS = [
  "Beauty & wellness",
  "Horeca",
  "Coaching & consulting",
  "Bouw & ambacht",
  "Retail",
  "Gezondheid",
  "Anders",
] as const;

const PAGE_OPTIONS = [
  "Home",
  "Over ons",
  "Diensten",
  "Menu",
  "Galerij",
  "Contact",
  "Tarieven",
  "Team",
  "Portfolio",
  "Andere",
] as const;

const COUNTRY_CODES = [
  { code: "BE", dial: "+32", label: "België" },
  { code: "NL", dial: "+31", label: "Nederland" },
  { code: "DE", dial: "+49", label: "Duitsland" },
  { code: "FR", dial: "+33", label: "Frankrijk" },
  { code: "LU", dial: "+352", label: "Luxemburg" },
  { code: "AT", dial: "+43", label: "Oostenrijk" },
  { code: "CH", dial: "+41", label: "Zwitserland" },
  { code: "IT", dial: "+39", label: "Italië" },
  { code: "ES", dial: "+34", label: "Spanje" },
  { code: "PT", dial: "+351", label: "Portugal" },
  { code: "IE", dial: "+353", label: "Ierland" },
  { code: "GB", dial: "+44", label: "Verenigd Koninkrijk" },
  { code: "DK", dial: "+45", label: "Denemarken" },
  { code: "SE", dial: "+46", label: "Zweden" },
  { code: "NO", dial: "+47", label: "Noorwegen" },
  { code: "FI", dial: "+358", label: "Finland" },
  { code: "PL", dial: "+48", label: "Polen" },
  { code: "CZ", dial: "+420", label: "Tsjechië" },
  { code: "SK", dial: "+421", label: "Slowakije" },
  { code: "HU", dial: "+36", label: "Hongarije" },
  { code: "RO", dial: "+40", label: "Roemenië" },
  { code: "BG", dial: "+359", label: "Bulgarije" },
  { code: "GR", dial: "+30", label: "Griekenland" },
  { code: "HR", dial: "+385", label: "Kroatië" },
  { code: "SI", dial: "+386", label: "Slovenië" },
  { code: "EE", dial: "+372", label: "Estland" },
  { code: "LV", dial: "+371", label: "Letland" },
  { code: "LT", dial: "+370", label: "Litouwen" },
  { code: "MT", dial: "+356", label: "Malta" },
  { code: "CY", dial: "+357", label: "Cyprus" },
] as const;

type PackageChoice = "1-pagina" | "3-pagina" | "";
type BrandChoice = "ja" | "nee" | "";
type SectionId = "contact" | "company" | "website" | "review";
type EditBlock = "contact" | "company" | "website" | null;
type Step = number;

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_CUSTOM_PAGE = 50;

const SECTION_LABELS: Record<SectionId, string> = {
  contact: "Contactgegevens",
  company: "Bedrijfsgegevens",
  website: "Website & branding",
  review: "Overzicht",
};

const SECTION_SHORT: Record<SectionId, string> = {
  contact: "Contact",
  company: "Bedrijf",
  website: "Website",
  review: "Check",
};

function sectionForStep(step: Step): SectionId | null {
  if (step >= 1 && step <= 3) return "contact";
  if (step >= 4 && step <= 8) return "company";
  if (step >= 9 && step <= 12) return "website";
  if (step === 13) return "review";
  return null;
}

export function BriefingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [maxReached, setMaxReached] = useState(0);
  const [editingBlock, setEditingBlock] = useState<EditBlock>(null);

  const [contactPerson, setContactPerson] = useState("");
  const [countryCode, setCountryCode] = useState("BE");
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(true);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [showAddress, setShowAddress] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [otherSocial, setOtherSocial] = useState("");
  const [sector, setSector] = useState("");
  const [sectorOther, setSectorOther] = useState("");
  const [businessInfo, setBusinessInfo] = useState("");
  const [packageChoice, setPackageChoice] = useState<PackageChoice>("");
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [customPage, setCustomPage] = useState("");
  const [hasLogo, setHasLogo] = useState<BrandChoice>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [brandNotes, setBrandNotes] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const contentRef = useRef<HTMLDivElement>(null);

  const isIntro = step === 0;
  const isSummary = step === 13;
  const section = sectionForStep(step);

  const activeSteps = useMemo(
    () =>
      packageChoice === "1-pagina"
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    [packageChoice],
  );

  const stepIndex = activeSteps.indexOf(step);
  const totalQuestions = activeSteps.length;
  const questionNumber = stepIndex >= 0 ? stepIndex + 1 : 0;

  const dialCode =
    COUNTRY_CODES.find((c) => c.code === countryCode)?.dial ?? "+32";
  const fullPhone = `${dialCode} ${phone.trim()}`.trim();
  const sectorLabel = sector === "Anders" ? sectorOther.trim() : sector;

  const resolvedPages = selectedPages.map((page) =>
    page === "Andere" ? customPage.trim() || "Andere" : page,
  );
  const pagesLabel =
    packageChoice === "3-pagina"
      ? resolvedPages.join(", ")
      : "Home (1-pagina)";

  const imagePreviews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [imagePreviews]);

  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true });
  }, [step]);

  function goTo(nextStep: Step, dir: "forward" | "back") {
    setDirection(dir);
    setError("");
    setEditingBlock(null);
    setStep(nextStep);
    setMaxReached((m) => Math.max(m, nextStep));
  }

  function jumpToStep(target: Step) {
    if (target > maxReached && target !== step) return;
    goTo(target, target < step ? "back" : "forward");
  }

  function next() {
    setError("");

    if (step === 1 && !contactPerson.trim()) {
      setError("Vul de naam van de contactpersoon in.");
      return;
    }
    if (step === 2 && !phone.trim()) {
      setError("Vul een telefoonnummer in.");
      return;
    }
    if (step === 3) {
      if (!email.trim()) {
        setError("Vul een e-mailadres in.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Ongeldig e-mailadres.");
        return;
      }
    }
    if (step === 4 && !companyName.trim()) {
      setError("Vul de bedrijfsnaam in.");
      return;
    }
    if (step === 5 && !address.trim()) {
      setError("Vul het adres van uw zaak in.");
      return;
    }
    if (step === 7) {
      if (!sector) {
        setError("Kies een sector.");
        return;
      }
      if (sector === "Anders" && !sectorOther.trim()) {
        setError("Beschrijf kort uw sector.");
        return;
      }
    }
    if (step === 8 && businessInfo.trim().length < 20) {
      setError("Vertel iets meer over uw zaak (min. 20 tekens).");
      return;
    }
    if (step === 9 && !packageChoice) {
      setError("Kies 1-pagina of 3-pagina.");
      return;
    }
    if (step === 10) {
      if (selectedPages.length !== 3) {
        setError("Selecteer precies 3 pagina’s.");
        return;
      }
      if (selectedPages.includes("Andere") && !customPage.trim()) {
        setError("Vul de naam van de andere pagina in.");
        return;
      }
    }
    if (step === 11) {
      if (!hasLogo) {
        setError("Geef aan of u een logo heeft.");
        return;
      }
      if (hasLogo === "nee" && !brandNotes.trim()) {
        setError("Deel kort uw kleuren- of brandingvoorkeur.");
        return;
      }
    }
    if (step === 13) {
      if (!validateSummary()) return;
      submit();
      return;
    }

    if (step === 9 && packageChoice === "1-pagina") {
      goTo(11, "forward");
      return;
    }

    goTo(step + 1, "forward");
  }

  function validateSummary() {
    if (!contactPerson.trim() || !phone.trim() || !email.trim()) {
      setError("Vul de contactgegevens volledig in.");
      setEditingBlock("contact");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ongeldig e-mailadres.");
      setEditingBlock("contact");
      return false;
    }
    if (!companyName.trim() || !address.trim() || !sectorLabel || businessInfo.trim().length < 20) {
      setError("Vul de bedrijfsgegevens volledig in.");
      setEditingBlock("company");
      return false;
    }
    if (!packageChoice || !hasLogo) {
      setError("Vul de websitegegevens volledig in.");
      setEditingBlock("website");
      return false;
    }
    if (packageChoice === "3-pagina") {
      if (selectedPages.length !== 3) {
        setError("Selecteer precies 3 pagina’s.");
        setEditingBlock("website");
        return false;
      }
      if (selectedPages.includes("Andere") && !customPage.trim()) {
        setError("Vul de naam van de andere pagina in.");
        setEditingBlock("website");
        return false;
      }
    }
    if (hasLogo === "nee" && !brandNotes.trim()) {
      setError("Deel kort uw kleuren- of brandingvoorkeur.");
      setEditingBlock("website");
      return false;
    }
    return true;
  }

  function back() {
    if (step <= 0) return;
    if (step === 11 && packageChoice === "1-pagina") {
      goTo(9, "back");
      return;
    }
    goTo(step - 1, "back");
  }

  function submit() {
    const formData = new FormData();
    formData.set("contactPerson", contactPerson.trim());
    formData.set("phone", fullPhone);
    formData.set("showPhone", showPhone ? "ja" : "nee");
    formData.set("email", email.trim());
    formData.set("companyName", companyName.trim());
    formData.set("address", address.trim());
    formData.set("showAddress", showAddress ? "ja" : "nee");
    formData.set("instagram", instagram.trim());
    formData.set("facebook", facebook.trim());
    formData.set("otherSocial", otherSocial.trim());
    formData.set("sector", sectorLabel);
    formData.set("businessInfo", businessInfo.trim());
    formData.set("packageChoice", packageChoice);
    formData.set("selectedPages", pagesLabel);
    formData.set(
      "hasLogo",
      hasLogo === "ja"
        ? logoFile
          ? "Ja, bestand geüpload"
          : "Ja, geen bestand"
        : "Nee",
    );
    formData.set("brandNotes", brandNotes.trim());
    formData.set("imageCount", String(images.length));
    formData.set("website", honeypot);
    if (logoFile) formData.set("logo", logoFile);
    images.forEach((file) => formData.append("images", file));

    startTransition(async () => {
      const result = await submitBriefing(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const naam = encodeURIComponent(contactPerson.trim());
      router.push(`/bedankt?naam=${naam}`);
    });
  }

  function togglePage(page: string) {
    setSelectedPages((current) => {
      if (current.includes(page)) {
        if (page === "Andere") setCustomPage("");
        return current.filter((p) => p !== page);
      }
      if (current.length >= 3) return current;
      return [...current, page];
    });
  }

  function selectPackage(value: PackageChoice) {
    setPackageChoice(value);
    if (value === "1-pagina") {
      setSelectedPages([]);
      setCustomPage("");
    }
  }

  function addImages(fileList: FileList | null) {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList);
    const invalid = incoming.find(
      (f) =>
        !(
          /^(image\/(jpeg|png|webp|gif))$/i.test(f.type) ||
          /\.(jpe?g|png|webp|gif)$/i.test(f.name)
        ),
    );
    if (invalid) {
      setError(
        `“${invalid.name}”: enkel JPG, PNG, WebP of GIF toegestaan.`,
      );
      return;
    }
    const tooBig = incoming.find((f) => f.size > MAX_IMAGE_BYTES);
    if (tooBig) {
      setError(`“${tooBig.name}” is groter dan 3 MB.`);
      return;
    }
    setError("");
    setImages((current) => {
      const room = MAX_IMAGES - current.length;
      if (room <= 0) return current;
      return [...current, ...incoming.slice(0, room)];
    });
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  const animClass =
    direction === "forward" ? "animate-fade-up" : "animate-fade-in";

  const socialSummary =
    [instagram, facebook, otherSocial].filter(Boolean).join(", ") ||
    "Niet ingevuld";

  return (
    <div className="mx-auto w-full max-w-2xl">
      {!isIntro && (
        <StepTimeline
          activeSteps={activeSteps}
          currentStep={step}
          maxReached={Math.max(maxReached, step)}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          section={section}
          onJump={jumpToStep}
        />
      )}

      <div
        key={isSummary ? "summary" : step}
        ref={contentRef}
        tabIndex={-1}
        className={`${animClass} min-h-[320px] outline-none`}
      >
        {isIntro && (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
              Gratis preview
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Klaar voor uw nieuwe website?
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Neem 10 tot 15 minuten om deze briefing in te vullen. Hoe
              vollediger uw antwoorden, hoe beter wij een gratis preview kunnen
              maken die past bij uw zaak. U ontvangt die binnen 48 uur.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Geen technische kennis nodig",
                "Gratis preview binnen 48 uur",
                "Live na goedkeuring",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm font-medium text-forest-muted"
                >
                  <span
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <Question title="Wie is de contactpersoon?">
            <TextInput
              id="contactPerson"
              label="Voor- en achternaam"
              value={contactPerson}
              onChange={setContactPerson}
              onEnter={next}
              placeholder="Jan Janssen"
              autoFocus
            />
          </Question>
        )}

        {step === 2 && (
          <Question
            title="Wat is uw telefoonnummer?"
            hint="Kies eerst de landcode. Handig voor contact, tenzij u dit liever verborgen houdt."
          >
            <PhoneFields
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              phone={phone}
              setPhone={setPhone}
              showPhone={showPhone}
              setShowPhone={setShowPhone}
              onEnter={next}
              autoFocus
            />
          </Question>
        )}

        {step === 3 && (
          <Question title="Wat is uw e-mailadres?">
            <TextInput
              id="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              onEnter={next}
              placeholder="naam@bedrijf.be"
              autoFocus
            />
          </Question>
        )}

        {step === 4 && (
          <Question title="Wat is de naam van uw bedrijf?">
            <TextInput
              id="companyName"
              label="Bedrijfsnaam"
              value={companyName}
              onChange={setCompanyName}
              onEnter={next}
              placeholder="Uw bedrijfsnaam"
              autoFocus
            />
          </Question>
        )}

        {step === 5 && (
          <Question
            title="Wat is het adres van uw zaak?"
            hint="Handig voor Google Maps en lokale SEO, tenzij u dit liever verborgen houdt."
          >
            <TextInput
              id="address"
              label="Adres"
              value={address}
              onChange={setAddress}
              onEnter={next}
              placeholder="Straat 1, 1000 Brussel"
              autoFocus
            />
            <PrivacyToggle
              label="Adres niet tonen op de website"
              checked={!showAddress}
              onChange={(hidden) => setShowAddress(!hidden)}
            />
          </Question>
        )}

        {step === 6 && (
          <Question
            title="Heeft u social media of een bestaande site?"
            hint="Optioneel: plak de links die we mogen gebruiken."
          >
            <div className="space-y-5">
              <TextInput
                id="instagram"
                label="Instagram"
                value={instagram}
                onChange={setInstagram}
                placeholder="instagram.com/uwzaak"
              />
              <TextInput
                id="facebook"
                label="Facebook"
                value={facebook}
                onChange={setFacebook}
                placeholder="facebook.com/uwzaak"
              />
              <TextInput
                id="otherSocial"
                label="Andere link (LinkedIn, TikTok, website…)"
                value={otherSocial}
                onChange={setOtherSocial}
                onEnter={next}
                placeholder="https://"
              />
            </div>
          </Question>
        )}

        {step === 7 && (
          <Question title="In welke sector bent u actief?">
            <SectorPicker
              sector={sector}
              setSector={setSector}
              sectorOther={sectorOther}
              setSectorOther={setSectorOther}
              onEnter={next}
            />
          </Question>
        )}

        {step === 8 && (
          <Question
            title="Vertel iets over uw zaak"
            hint="Wat doet u, voor wie, welke diensten of producten? Wat wilt u zeker op de website zien, en wat is voor u belangrijk? Hoe meer context, hoe sterker de preview."
          >
            <label className="sr-only" htmlFor="businessInfo">
              Bedrijfsinfo
            </label>
            <textarea
              id="businessInfo"
              rows={6}
              autoFocus
              value={businessInfo}
              onChange={(e) => setBusinessInfo(e.target.value)}
              className="mt-2 w-full resize-y rounded-xl border border-border/80 bg-cream-dark/30 px-4 py-3.5 text-base leading-relaxed text-forest outline-none transition-colors placeholder:text-muted/70 focus:border-terracotta"
              placeholder="Wij helpen … met … Onze klanten zijn … Op de website willen we zeker …"
            />
          </Question>
        )}

        {step === 9 && (
          <Question
            title="Welk pakket past bij u?"
            hint="U kunt later nog bijsturen. Dit helpt ons de preview te richten."
          >
            <PackagePicker
              packageChoice={packageChoice}
              onSelect={selectPackage}
            />
          </Question>
        )}

        {step === 10 && (
          <Question
            title="Welke 3 pagina’s wilt u?"
            hint={`Kies precies 3 pagina’s. Geselecteerd: ${selectedPages.length}/3`}
          >
            <PagePicker
              selectedPages={selectedPages}
              customPage={customPage}
              setCustomPage={setCustomPage}
              onToggle={togglePage}
            />
          </Question>
        )}

        {step === 11 && (
          <Question title="Heeft u al een logo?">
            <BrandingFields
              hasLogo={hasLogo}
              setHasLogo={setHasLogo}
              logoFile={logoFile}
              setLogoFile={setLogoFile}
              brandNotes={brandNotes}
              setBrandNotes={setBrandNotes}
            />
          </Question>
        )}

        {step === 12 && (
          <Question
            title="Heeft u beelden voor de website?"
            hint="Upload tot 5 foto’s of visuals. Meer beelden kunt u later toevoegen, nadat de eerste versie klaar is."
          >
            <ImageUpload
              images={images}
              imagePreviews={imagePreviews}
              onAdd={addImages}
              onRemove={removeImage}
            />
          </Question>
        )}

        {isSummary && (
          <div className="relative">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-forest md:text-3xl">
              Controleer uw briefing
            </h2>
            <p className="mt-3 text-base text-muted">
              Klopt alles? Pas iets aan via Wijzig, of bevestig om te versturen.
            </p>

            <div className="mt-8 space-y-5">
              <SummaryBlock
                title="Contactgegevens"
                editing={editingBlock === "contact"}
                onEdit={() => setEditingBlock("contact")}
                onDone={() => setEditingBlock(null)}
                rows={[
                  { label: "Contactpersoon", value: contactPerson },
                  {
                    label: "Telefoon",
                    value: `${fullPhone}${showPhone ? "" : " (niet tonen)"}`,
                  },
                  { label: "E-mail", value: email },
                ]}
              >
                <div className="space-y-5">
                  <TextInput
                    id="edit-contactPerson"
                    label="Contactpersoon"
                    value={contactPerson}
                    onChange={setContactPerson}
                  />
                  <PhoneFields
                    countryCode={countryCode}
                    setCountryCode={setCountryCode}
                    phone={phone}
                    setPhone={setPhone}
                    showPhone={showPhone}
                    setShowPhone={setShowPhone}
                  />
                  <TextInput
                    id="edit-email"
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />
                </div>
              </SummaryBlock>

              <SummaryBlock
                title="Bedrijfsgegevens"
                editing={editingBlock === "company"}
                onEdit={() => setEditingBlock("company")}
                onDone={() => setEditingBlock(null)}
                rows={[
                  { label: "Bedrijf", value: companyName },
                  {
                    label: "Adres",
                    value: `${address}${showAddress ? "" : " (niet tonen)"}`,
                  },
                  { label: "Sociale media", value: socialSummary },
                  { label: "Sector", value: sectorLabel || "Niet ingevuld" },
                  { label: "Over de zaak", value: businessInfo },
                ]}
              >
                <div className="space-y-5">
                  <TextInput
                    id="edit-companyName"
                    label="Bedrijfsnaam"
                    value={companyName}
                    onChange={setCompanyName}
                  />
                  <TextInput
                    id="edit-address"
                    label="Adres"
                    value={address}
                    onChange={setAddress}
                  />
                  <PrivacyToggle
                    label="Adres niet tonen op de website"
                    checked={!showAddress}
                    onChange={(hidden) => setShowAddress(!hidden)}
                  />
                  <TextInput
                    id="edit-instagram"
                    label="Instagram"
                    value={instagram}
                    onChange={setInstagram}
                  />
                  <TextInput
                    id="edit-facebook"
                    label="Facebook"
                    value={facebook}
                    onChange={setFacebook}
                  />
                  <TextInput
                    id="edit-otherSocial"
                    label="Andere link"
                    value={otherSocial}
                    onChange={setOtherSocial}
                  />
                  <SectorPicker
                    sector={sector}
                    setSector={setSector}
                    sectorOther={sectorOther}
                    setSectorOther={setSectorOther}
                  />
                  <div>
                    <label
                      htmlFor="edit-businessInfo"
                      className="block text-sm font-medium text-forest-muted"
                    >
                      Over de zaak
                    </label>
                    <textarea
                      id="edit-businessInfo"
                      rows={5}
                      value={businessInfo}
                      onChange={(e) => setBusinessInfo(e.target.value)}
                      className="mt-2 w-full resize-y rounded-xl border border-border/80 bg-cream px-4 py-3.5 text-base leading-relaxed text-forest outline-none focus:border-terracotta"
                    />
                  </div>
                </div>
              </SummaryBlock>

              <SummaryBlock
                title="Website & branding"
                editing={editingBlock === "website"}
                onEdit={() => setEditingBlock("website")}
                onDone={() => setEditingBlock(null)}
                rows={[
                  { label: "Pakket", value: packageChoice || "Niet gekozen" },
                  { label: "Pagina’s", value: pagesLabel },
                  {
                    label: "Logo",
                    value:
                      hasLogo === "ja"
                        ? logoFile
                          ? `Ja, ${logoFile.name}`
                          : "Ja"
                        : hasLogo === "nee"
                          ? "Nee"
                          : "Niet ingevuld",
                  },
                  {
                    label: "Branding",
                    value: brandNotes || "Niet ingevuld",
                  },
                  {
                    label: "Beelden",
                    value:
                      images.length > 0
                        ? `${images.length} bestand${images.length === 1 ? "" : "en"}`
                        : "Geen upload",
                  },
                ]}
              >
                <div className="space-y-6">
                  <PackagePicker
                    packageChoice={packageChoice}
                    onSelect={selectPackage}
                  />
                  {packageChoice === "3-pagina" && (
                    <PagePicker
                      selectedPages={selectedPages}
                      customPage={customPage}
                      setCustomPage={setCustomPage}
                      onToggle={togglePage}
                    />
                  )}
                  <BrandingFields
                    hasLogo={hasLogo}
                    setHasLogo={setHasLogo}
                    logoFile={logoFile}
                    setLogoFile={setLogoFile}
                    brandNotes={brandNotes}
                    setBrandNotes={setBrandNotes}
                  />
                  <ImageUpload
                    images={images}
                    imagePreviews={imagePreviews}
                    onAdd={addImages}
                    onRemove={removeImage}
                  />
                </div>
              </SummaryBlock>
            </div>

            <div
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
              aria-hidden
            >
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
          </div>
        )}

      </div>

      {error && (
        <p className="mt-6 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border/60 pt-8">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              disabled={pending}
              className="text-sm font-medium text-muted transition-colors hover:text-forest disabled:opacity-50"
            >
              Terug
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={next}
            disabled={pending || Boolean(editingBlock)}
            className="rounded-md bg-terracotta px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover disabled:opacity-60"
          >
            {pending
              ? "Verzenden…"
              : isIntro
                ? "Start de briefing"
                : isSummary
                  ? "Bevestigen & versturen"
                  : step === 12
                    ? "Naar overzicht"
                    : "Volgende"}
          </button>
        </div>
    </div>
  );
}

function StepTimeline({
  activeSteps,
  currentStep,
  maxReached,
  questionNumber,
  totalQuestions,
  section,
  onJump,
}: {
  activeSteps: number[];
  currentStep: number;
  maxReached: number;
  questionNumber: number;
  totalQuestions: number;
  section: SectionId | null;
  onJump: (step: Step) => void;
}) {
  const groups = (
    [
      { id: "contact" as const, steps: [1, 2, 3] },
      { id: "company" as const, steps: [4, 5, 6, 7, 8] },
      { id: "website" as const, steps: [9, 10, 11, 12] },
      { id: "review" as const, steps: [13] },
    ] as const
  )
    .map((group) => ({
      ...group,
      steps: group.steps.filter((s) => activeSteps.includes(s)),
    }))
    .filter((group) => group.steps.length > 0);

  const currentIndex = Math.max(0, activeSteps.indexOf(currentStep));

  return (
    <div className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
          {section ? SECTION_LABELS[section] : "Briefing"}
        </p>
        <p className="text-xs font-medium tracking-wide text-muted">
          Stap {questionNumber} van {totalQuestions}
        </p>
      </div>

      <div className="relative pt-1" aria-label="Voortgang briefing">
        <div className="absolute top-[1.15rem] right-2 left-2 h-px bg-border" />
        <div
          className="absolute top-[1.15rem] left-2 h-px bg-terracotta/45 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width:
              totalQuestions <= 1
                ? "0%"
                : `calc(${(currentIndex / (totalQuestions - 1)) * 100}% )`,
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-2 sm:gap-3">
          {groups.map((group) => {
            const activeGroup = group.id === section;
            return (
              <div
                key={group.id}
                className={`flex min-w-0 flex-col items-center gap-2 ${
                  group.id === "review" ? "shrink-0" : "flex-1"
                }`}
              >
                <p
                  className={`text-[0.65rem] font-semibold uppercase tracking-wider transition-colors ${
                    activeGroup ? "text-terracotta" : "text-muted/70"
                  }`}
                >
                  {SECTION_SHORT[group.id]}
                </p>
                <ol className="flex w-full items-center justify-center gap-2 sm:gap-2.5">
                  {group.steps.map((s) => {
                    const index = activeSteps.indexOf(s);
                    const done = index < currentIndex;
                    const active = index === currentIndex;
                    const clickable = s <= maxReached;
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          disabled={!clickable}
                          onClick={() => onJump(s)}
                          aria-label={`${SECTION_LABELS[group.id]}, stap ${index + 1}`}
                          aria-current={active ? "step" : undefined}
                          title={`${SECTION_SHORT[group.id]} · stap ${index + 1}`}
                          className={`relative flex items-center justify-center rounded-full border-2 bg-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            active
                              ? "h-5 w-5 scale-125 border-terracotta"
                              : done
                                ? "h-3.5 w-3.5 border-terracotta hover:scale-110"
                                : "h-3.5 w-3.5 border-border"
                          } ${clickable ? "cursor-pointer" : "cursor-default opacity-70"}`}
                        >
                          {active ? (
                            <>
                              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-terracotta/40" />
                              <span className="absolute inset-0 animate-pulse-ring-delayed rounded-full bg-terracotta/25" />
                              <span className="relative h-2 w-2 scale-110 rounded-full bg-terracotta shadow-[0_0_0_3px_rgba(192,127,99,0.2)]" />
                            </>
                          ) : (
                            <span
                              className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                                done ? "bg-terracotta" : "bg-border"
                              }`}
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Question({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-forest md:text-3xl">
        {title}
      </h2>
      {hint ? (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          {hint}
        </p>
      ) : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function PhoneFields({
  countryCode,
  setCountryCode,
  phone,
  setPhone,
  showPhone,
  setShowPhone,
  onEnter,
  autoFocus = false,
}: {
  countryCode: string;
  setCountryCode: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  showPhone: boolean;
  setShowPhone: (value: boolean) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-[11.5rem]">
          <label
            htmlFor="countryCode"
            className="block text-sm font-medium text-forest-muted"
          >
            Landcode
          </label>
          <select
            id="countryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="mt-2 w-full appearance-none border-b-2 border-border bg-transparent py-3 text-lg text-forest outline-none transition-colors focus:border-terracotta"
          >
            <optgroup label="Vaak gekozen">
              {COUNTRY_CODES.slice(0, 3).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.dial} {c.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Europa">
              {COUNTRY_CODES.slice(3).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.dial} {c.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className="flex-1">
          <TextInput
            id="phone"
            label="Nummer"
            type="tel"
            autoComplete="tel-national"
            value={phone}
            onChange={setPhone}
            onEnter={onEnter}
            placeholder="470 12 34 56"
            autoFocus={autoFocus}
          />
        </div>
      </div>
      <PrivacyToggle
        label="Telefoonnummer niet tonen op de website"
        checked={!showPhone}
        onChange={(hidden) => setShowPhone(!hidden)}
      />
    </>
  );
}

function SectorPicker({
  sector,
  setSector,
  sectorOther,
  setSectorOther,
  onEnter,
}: {
  sector: string;
  setSector: (value: string) => void;
  sectorOther: string;
  setSectorOther: (value: string) => void;
  onEnter?: () => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {SECTORS.map((option) => (
          <ChoiceButton
            key={option}
            selected={sector === option}
            onClick={() => setSector(option)}
            label={option}
          />
        ))}
      </div>
      {sector === "Anders" && (
        <div className="mt-6">
          <TextInput
            id="sectorOther"
            label="Uw sector"
            value={sectorOther}
            onChange={setSectorOther}
            onEnter={onEnter}
            placeholder="Bijv. interieuradvies"
            autoFocus
          />
        </div>
      )}
    </>
  );
}

function PackagePicker({
  packageChoice,
  onSelect,
}: {
  packageChoice: PackageChoice;
  onSelect: (value: PackageChoice) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(
        [
          {
            value: "1-pagina" as const,
            title: "1-pagina",
            price: "€199",
            desc: "Eén sterke landingspagina met alles wat telt.",
          },
          {
            value: "3-pagina" as const,
            title: "3-pagina",
            price: "€349",
            desc: "Meer ruimte voor verhaal, diensten en SEO.",
          },
        ] as const
      ).map((pkg) => (
        <button
          key={pkg.value}
          type="button"
          onClick={() => onSelect(pkg.value)}
          className={`rounded-xl border p-5 text-left transition-all duration-300 ${
            packageChoice === pkg.value
              ? "border-terracotta bg-terracotta/[0.08] shadow-[4px_6px_0_0_rgba(27,48,34,0.1)] ring-1 ring-terracotta/30"
              : "border-border/80 bg-cream hover:border-terracotta/40"
          }`}
        >
          <span className="font-display text-2xl font-semibold text-forest">
            {pkg.title}
          </span>
          <span className="mt-1 block text-sm font-semibold text-terracotta">
            {pkg.price}
          </span>
          <span className="mt-2 block text-sm leading-relaxed text-muted">
            {pkg.desc}
          </span>
        </button>
      ))}
    </div>
  );
}

function PagePicker({
  selectedPages,
  customPage,
  setCustomPage,
  onToggle,
}: {
  selectedPages: string[];
  customPage: string;
  setCustomPage: (value: string) => void;
  onToggle: (page: string) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {PAGE_OPTIONS.map((page) => {
          const selected = selectedPages.includes(page);
          const locked = !selected && selectedPages.length >= 3;
          return (
            <button
              key={page}
              type="button"
              disabled={locked}
              onClick={() => onToggle(page)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                selected
                  ? "border-terracotta bg-terracotta text-cream"
                  : locked
                    ? "cursor-not-allowed border-border/50 text-muted/50"
                    : "border-border text-forest-muted hover:border-terracotta/50"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
      {selectedPages.includes("Andere") && (
        <div className="mt-5">
          <label
            htmlFor="customPage"
            className="block text-sm font-medium text-forest-muted"
          >
            Naam van de andere pagina
          </label>
          <input
            id="customPage"
            type="text"
            maxLength={MAX_CUSTOM_PAGE}
            value={customPage}
            onChange={(e) => setCustomPage(e.target.value.slice(0, MAX_CUSTOM_PAGE))}
            className="mt-2 w-full border-b-2 border-border bg-transparent py-3 text-lg text-forest outline-none focus:border-terracotta"
            placeholder="Bijv. Workshops"
            autoFocus
          />
          <p className="mt-2 text-xs text-muted">
            {customPage.length}/{MAX_CUSTOM_PAGE} tekens
          </p>
        </div>
      )}
    </div>
  );
}

function BrandingFields({
  hasLogo,
  setHasLogo,
  logoFile,
  setLogoFile,
  brandNotes,
  setBrandNotes,
}: {
  hasLogo: BrandChoice;
  setHasLogo: (value: BrandChoice) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  brandNotes: string;
  setBrandNotes: (value: string) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        {(
          [
            { value: "ja" as const, label: "Ja, ik heb een logo" },
            { value: "nee" as const, label: "Nee, nog geen logo" },
          ] as const
        ).map((option) => (
          <ChoiceButton
            key={option.value}
            selected={hasLogo === option.value}
            onClick={() => setHasLogo(option.value)}
            label={option.label}
            className="flex-1"
          />
        ))}
      </div>

      {hasLogo === "ja" && (
        <div className="mt-6 rounded-xl border border-dashed border-terracotta/40 bg-terracotta/[0.06] p-5">
          <label htmlFor="logo" className="block text-sm font-medium text-forest">
            Upload uw logo (JPG, PNG, WebP of PDF · max. 3 MB)
          </label>
          <input
            id="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
            className="mt-3 block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-terracotta file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (!file) {
                setLogoFile(null);
                return;
              }
              const okType =
                /^(image\/(jpeg|png|webp)|application\/pdf)$/i.test(file.type) ||
                /\.(jpe?g|png|webp|pdf)$/i.test(file.name);
              if (!okType) {
                setLogoFile(null);
                e.target.value = "";
                return;
              }
              setLogoFile(file);
            }}
          />
          {logoFile && <p className="mt-2 text-sm text-muted">{logoFile.name}</p>}
          <div className="mt-5">
            <TextInput
              id="brandNotesYes"
              label="Extra brandinginfo (optioneel)"
              value={brandNotes}
              onChange={setBrandNotes}
              placeholder="Lettertypes, kleuren, sfeer…"
            />
          </div>
        </div>
      )}

      {hasLogo === "nee" && (
        <div className="mt-6">
          <label
            htmlFor="brandNotes"
            className="block text-sm font-medium text-forest-muted"
          >
            Kleurenvoorkeur of andere brandingwensen
          </label>
          <textarea
            id="brandNotes"
            rows={4}
            value={brandNotes}
            onChange={(e) => setBrandNotes(e.target.value)}
            className="mt-2 w-full resize-y rounded-xl border border-border/80 bg-cream-dark/30 px-4 py-3.5 text-base leading-relaxed text-forest outline-none transition-colors placeholder:text-muted/70 focus:border-terracotta"
            placeholder="Bijv. warme beige en terracotta, rustig, geen felle kleuren…"
          />
        </div>
      )}
    </>
  );
}

function ImageUpload({
  images,
  imagePreviews,
  onAdd,
  onRemove,
}: {
  images: File[];
  imagePreviews: { file: File; url: string }[];
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <>
      <label
        htmlFor="gallery"
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-terracotta/40 bg-terracotta/[0.06] px-4 py-10 text-center transition-colors hover:border-terracotta/60 hover:bg-terracotta/[0.1]"
      >
        <span className="font-display text-lg font-semibold text-forest">
          Sleep of kies bestanden
        </span>
        <span className="mt-1 text-sm text-muted">
          Max. {MAX_IMAGES} beelden (JPG, PNG, WebP, GIF), max. 3 MB per bestand
        </span>
        <span className="mt-3 text-sm font-semibold text-terracotta">
          {images.length}/{MAX_IMAGES} toegevoegd
        </span>
        <input
          id="gallery"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          multiple
          className="sr-only"
          onChange={(e) => {
            onAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {imagePreviews.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {imagePreviews.map((item, index) => (
            <li
              key={`${item.file.name}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-border/80 bg-cream-dark/40"
            >
              <img
                src={item.url}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 rounded-md bg-forest/80 px-2 py-1 text-xs font-semibold text-cream opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
              >
                Verwijder
              </button>
              <p className="truncate px-2 py-1.5 text-[0.7rem] text-muted">
                {item.file.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function PrivacyToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="mt-6 flex w-full items-center justify-between gap-4 rounded-xl border border-border/80 bg-cream-dark/40 px-4 py-3.5 text-left transition-colors hover:border-terracotta/40"
    >
      <span className="text-sm font-medium text-forest">{label}</span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-terracotta" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-cream shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function SummaryBlock({
  title,
  rows,
  editing,
  onEdit,
  onDone,
  children,
}: {
  title: string;
  rows: { label: string; value: string }[];
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-cream-dark/30 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-forest">
          {title}
        </h3>
        <button
          type="button"
          onClick={editing ? onDone : onEdit}
          className="text-sm font-semibold text-terracotta transition-colors hover:text-terracotta-hover"
        >
          {editing ? "Klaar" : "Wijzig"}
        </button>
      </div>

      {editing ? (
        <div className="mt-5">{children}</div>
      ) : (
        <dl className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                {row.label}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-forest">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function TextInput({
  id,
  label,
  value,
  onChange,
  onEnter,
  placeholder,
  type = "text",
  autoComplete,
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-forest-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className="mt-2 w-full border-b-2 border-border bg-transparent py-3 text-lg text-forest outline-none transition-colors placeholder:text-muted/60 focus:border-terracotta"
        placeholder={placeholder}
      />
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  label,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3.5 text-left text-base font-medium transition-all ${
        selected
          ? "border-terracotta bg-terracotta/10 text-forest shadow-[3px_4px_0_0_rgba(27,48,34,0.08)]"
          : "border-border/80 text-forest-muted hover:border-terracotta/50"
      } ${className}`}
    >
      {label}
    </button>
  );
}
