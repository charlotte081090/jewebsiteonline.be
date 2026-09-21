"use client";

import { submitBriefing } from "@/app/actions/contact";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useLocaleContext } from "@/components/locale-provider";
import type {
  CountryCode,
  FormDictionary,
} from "@/lib/i18n/dictionaries/types";
import type { PaidAccess } from "@/lib/paid-access";
import { privacyHref, termsHref, thankYouHref } from "@/lib/i18n/path";

/** Dial codes stay in code; the country names come from the dictionary. */
const COUNTRY_DIAL_CODES: readonly { code: CountryCode; dial: string }[] = [
  { code: "BE", dial: "+32" },
  { code: "NL", dial: "+31" },
  { code: "DE", dial: "+49" },
  { code: "FR", dial: "+33" },
  { code: "LU", dial: "+352" },
  { code: "AT", dial: "+43" },
  { code: "CH", dial: "+41" },
  { code: "IT", dial: "+39" },
  { code: "ES", dial: "+34" },
  { code: "PT", dial: "+351" },
  { code: "IE", dial: "+353" },
  { code: "GB", dial: "+44" },
  { code: "DK", dial: "+45" },
  { code: "SE", dial: "+46" },
  { code: "NO", dial: "+47" },
  { code: "FI", dial: "+358" },
  { code: "PL", dial: "+48" },
  { code: "CZ", dial: "+420" },
  { code: "SK", dial: "+421" },
  { code: "HU", dial: "+36" },
  { code: "RO", dial: "+40" },
  { code: "BG", dial: "+359" },
  { code: "GR", dial: "+30" },
  { code: "HR", dial: "+385" },
  { code: "SI", dial: "+386" },
  { code: "EE", dial: "+372" },
  { code: "LV", dial: "+371" },
  { code: "LT", dial: "+370" },
  { code: "MT", dial: "+356" },
  { code: "CY", dial: "+357" },
];

type PackageChoice = "1-pagina" | "3-pagina" | "5-pagina" | "";
type BrandChoice = "ja" | "nee" | "";
type SectionId = "contact" | "company" | "website" | "review";
type EditBlock = "contact" | "company" | "website" | null;
type Step = number;

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_CUSTOM_PAGE = 50;
const MIN_ABOUT = 20;
const MIN_PAGE_NOTE = 3;

function pageLimitForPackage(packageChoice: PackageChoice) {
  if (packageChoice === "5-pagina") return 5;
  if (packageChoice === "3-pagina") return 3;
  return 1;
}

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function sectionForStep(step: Step): SectionId | null {
  if (step >= 1 && step <= 3) return "contact";
  if (step >= 4 && step <= 9) return "company";
  if (step === 11 || step === 15 || step === 12 || step === 13) return "website";
  if (step === 14) return "review";
  return null;
}

export function BriefingForm({ paidAccess }: { paidAccess: PaidAccess }) {
  const { locale, dict } = useLocaleContext();
  const t = dict.form;
  const otherSector = t.sectors[t.sectors.length - 1] ?? "";
  const otherPage = t.pages[t.pages.length - 1] ?? "";
  const homePage = t.pages[0] ?? "Home";
  const emailLocked = Boolean(paidAccess.email);

  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [maxReached, setMaxReached] = useState(0);
  const [editingBlock, setEditingBlock] = useState<EditBlock>(null);

  const [contactPerson, setContactPerson] = useState("");
  const [countryCode, setCountryCode] = useState("BE");
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(true);
  const [email, setEmail] = useState(paidAccess.email);
  const [address, setAddress] = useState("");
  const [showAddress, setShowAddress] = useState(true);
  const [openingHours, setOpeningHours] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [otherSocial, setOtherSocial] = useState("");
  const [sector, setSector] = useState("");
  const [sectorOther, setSectorOther] = useState("");
  const [aboutBusiness, setAboutBusiness] = useState("");
  const [pageNotes, setPageNotes] = useState<Record<string, string>>({});
  const packageChoice: PackageChoice = paidAccess.packageChoice;
  const [selectedPages, setSelectedPages] = useState<string[]>([homePage]);
  const [customPage, setCustomPage] = useState("");
  const [hasLogo, setHasLogo] = useState<BrandChoice>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [brandNotes, setBrandNotes] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const contentRef = useRef<HTMLDivElement>(null);
  const summaryBlockRefs = useRef<Partial<Record<NonNullable<EditBlock>, HTMLDivElement | null>>>({});

  const isIntro = step === 0;
  const isSummary = step === 14;
  const section = sectionForStep(step);

  const activeSteps = useMemo(
    () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 15, 12, 13, 14],
    [],
  );

  const pageLimit = pageLimitForPackage(packageChoice);

  const stepIndex = activeSteps.indexOf(step);
  const totalQuestions = activeSteps.length;
  const questionNumber = stepIndex >= 0 ? stepIndex + 1 : 0;

  const dialCode =
    COUNTRY_DIAL_CODES.find((c) => c.code === countryCode)?.dial ?? "+32";
  const fullPhone = `${dialCode} ${phone.trim()}`.trim();
  const sectorLabel = sector === otherSector ? sectorOther.trim() : sector;

  const resolvedPages = selectedPages.map((page) =>
    page === otherPage ? customPage.trim() || otherPage : page,
  );
  const pagesLabel = resolvedPages.join(", ") || homePage;

  const packageLabel =
    packageChoice === "1-pagina"
      ? t.packages.onePage.label
      : packageChoice === "3-pagina"
        ? t.packages.threePage.label
        : packageChoice === "5-pagina"
          ? t.packages.fivePage.label
          : t.summary.notChosen;

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
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
      setError(t.errors.contactPerson);
      return;
    }
    if (step === 2 && !phone.trim()) {
      setError(t.errors.phone);
      return;
    }
    if (step === 3) {
      if (!email.trim()) {
        setError(t.errors.email);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError(t.errors.emailInvalid);
        return;
      }
    }
    if (step === 4 && !companyName.trim()) {
      setError(t.errors.companyName);
      return;
    }
    if (step === 5 && !address.trim()) {
      setError(t.errors.address);
      return;
    }
    if (step === 8) {
      if (!sector) {
        setError(t.errors.sector);
        return;
      }
      if (sector === otherSector && !sectorOther.trim()) {
        setError(t.errors.sectorOther);
        return;
      }
    }
    if (step === 9) {
      if (aboutBusiness.trim().length < MIN_ABOUT) {
        setError(t.errors.aboutBusiness);
        return;
      }
    }
    if (step === 11) {
      if (selectedPages.length !== pageLimit) {
        setError(fill(t.errors.pagesExactly3, { count: pageLimit }));
        return;
      }
      if (selectedPages.includes(otherPage) && !customPage.trim()) {
        setError(t.errors.customPage);
        return;
      }
    }
    if (step === 15 && !pageNotesComplete()) {
      setError(t.errors.pageNotes);
      return;
    }
    if (step === 12) {
      if (!hasLogo) {
        setError(t.errors.logoChoice);
        return;
      }
      if (hasLogo === "ja" && !logoFile) {
        setError(t.errors.logoUpload);
        return;
      }
      if (hasLogo === "nee" && !brandNotes.trim()) {
        setError(t.errors.brandNotes);
        return;
      }
    }
    if (step === 14) {
      setEditingBlock(null);
      if (!validateSummary()) return;
      if (!privacyConsent) {
        setError(t.errors.consent);
        return;
      }
      submit();
      return;
    }

    const idx = activeSteps.indexOf(step);
    const following = idx >= 0 ? activeSteps[idx + 1] : activeSteps[0];
    if (following == null) return;
    goTo(following, "forward");
  }

  function openSummaryBlock(block: NonNullable<EditBlock>, message: string) {
    setError(message);
    setEditingBlock(block);
    requestAnimationFrame(() => {
      summaryBlockRefs.current[block]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function finishSummaryBlock(block: NonNullable<EditBlock>) {
    if (!validateSummaryBlock(block)) return;
    setError("");
    setEditingBlock(null);
  }

  function updateHasLogo(value: BrandChoice) {
    setHasLogo(value);
    // Switching answer always drops any previous upload so Check and logo step stay aligned.
    setLogoFile(null);
  }

  function validateSummaryBlock(block: NonNullable<EditBlock>) {
    if (block === "contact") {
      if (!contactPerson.trim() || !phone.trim() || !email.trim()) {
        openSummaryBlock("contact", t.errors.contactIncomplete);
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        openSummaryBlock("contact", t.errors.emailInvalid);
        return false;
      }
      return true;
    }

    if (block === "company") {
      if (
        !companyName.trim() ||
        !address.trim() ||
        !sectorLabel ||
        aboutBusiness.trim().length < MIN_ABOUT
      ) {
        openSummaryBlock("company", t.errors.companyIncomplete);
        return false;
      }
      return true;
    }

    if (!hasLogo) {
      openSummaryBlock("website", t.errors.websiteIncomplete);
      return false;
    }
    if (selectedPages.length !== pageLimit) {
      openSummaryBlock(
        "website",
        fill(t.errors.pagesExactly3, { count: pageLimit }),
      );
      return false;
    }
    if (selectedPages.includes(otherPage) && !customPage.trim()) {
      openSummaryBlock("website", t.errors.customPage);
      return false;
    }
    if (!pageNotesComplete()) {
      openSummaryBlock("website", t.errors.pageNotes);
      return false;
    }
    if (hasLogo === "ja" && !logoFile) {
      openSummaryBlock("website", t.errors.logoUpload);
      return false;
    }
    if (hasLogo === "nee" && !brandNotes.trim()) {
      openSummaryBlock("website", t.errors.brandNotes);
      return false;
    }
    return true;
  }

  function validateSummary() {
    if (!validateSummaryBlock("contact")) return false;
    if (!validateSummaryBlock("company")) return false;
    if (!validateSummaryBlock("website")) return false;
    return true;
  }

  function back() {
    if (step <= 0) return;
    const idx = activeSteps.indexOf(step);
    const previous = idx > 0 ? activeSteps[idx - 1] : 0;
    goTo(previous, "back");
  }

  function submit() {
    const formData = new FormData();
    formData.set("locale", locale);
    formData.set("contactPerson", contactPerson.trim());
    formData.set("phone", fullPhone);
    formData.set("showPhone", showPhone ? "ja" : "nee");
    formData.set("email", email.trim());
    formData.set("companyName", companyName.trim());
    formData.set("vatNumber", vatNumber.trim());
    formData.set("address", address.trim());
    formData.set("showAddress", showAddress ? "ja" : "nee");
    formData.set("openingHours", openingHours.trim());
    formData.set("instagram", instagram.trim());
    formData.set("facebook", facebook.trim());
    formData.set("otherSocial", otherSocial.trim());
    formData.set("sector", sectorLabel);
    formData.set("aboutBusiness", aboutBusiness.trim());
    formData.set("packageChoice", paidAccess.packageChoice);
    formData.set("selectedPages", pagesLabel);
    formData.set(
      "pageNotes",
      JSON.stringify(
        selectedPages.map((page, index) => ({
          page: resolvedPages[index],
          note: (pageNotes[page] ?? "").trim(),
        })),
      ),
    );
    formData.set("hasLogo", hasLogo);
    formData.set("brandNotes", brandNotes.trim());
    formData.set("privacyConsent", privacyConsent ? "ja" : "nee");
    formData.set("imageCount", String(images.length));
    formData.set("website", honeypot);
    formData.set("checkoutSessionId", paidAccess.checkoutSessionId);
    formData.set("formReferenceId", paidAccess.formReferenceId);
    if (logoFile) formData.set("logo", logoFile);
    images.forEach((file) => formData.append("images", file));

    startTransition(async () => {
      const result = await submitBriefing(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const naam = encodeURIComponent(contactPerson.trim());
      const order = result.orderNumber
        ? `&order=${encodeURIComponent(result.orderNumber)}`
        : "";
      router.push(`${thankYouHref(locale, dict)}?naam=${naam}${order}`);
    });
  }

  function pageNotesComplete() {
    return selectedPages.every(
      (page) => (pageNotes[page] ?? "").trim().length >= MIN_PAGE_NOTE,
    );
  }

  function updatePageNote(page: string, value: string) {
    setPageNotes((current) => ({ ...current, [page]: value }));
  }

  function prunePageNotes(pages: string[]) {
    setPageNotes((current) => {
      const next: Record<string, string> = {};
      for (const page of pages) {
        if (current[page]) next[page] = current[page];
      }
      return next;
    });
  }

  function togglePage(page: string) {
    setSelectedPages((current) => {
      if (page === homePage) {
        const next = current.includes(homePage) ? current : [homePage, ...current];
        prunePageNotes(next);
        return next;
      }
      if (current.includes(page)) {
        if (page === otherPage) setCustomPage("");
        const next = current.filter((p) => p !== page);
        prunePageNotes(next);
        return next;
      }
      const withHome = current.includes(homePage) ? current : [homePage, ...current];
      if (withHome.length >= pageLimit) return withHome;
      const next = [...withHome, page];
      prunePageNotes(next);
      return next;
    });
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
      setError(fill(t.errors.imageType, { name: invalid.name }));
      return;
    }
    const tooBig = incoming.find((f) => f.size > MAX_IMAGE_BYTES);
    if (tooBig) {
      setError(fill(t.errors.fileTooBig, { name: tooBig.name }));
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
    t.summary.notFilled;

  const logoSummary =
    hasLogo === "ja"
      ? logoFile
        ? fill(t.logo.selected, { name: logoFile.name })
        : t.logo.yes
      : hasLogo === "nee"
        ? t.logo.no
        : t.summary.notFilled;

  return (
    <div className="mx-auto w-full max-w-2xl">
      {!isIntro && (
        <StepTimeline
          t={t}
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
              {t.intro.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-forest md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              {t.intro.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {t.intro.body}
            </p>
            <p className="mt-3 font-mono text-sm font-semibold tracking-wide text-forest">
              {fill(t.intro.paidReference, { order: paidAccess.formReferenceId })}
            </p>
            <ul className="mt-8 space-y-3">
              {t.intro.bullets.map((item) => (
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
          <Question title={t.questions.q1title}>
            <TextInput
              id="contactPerson"
              label={t.labels.contactPerson}
              value={contactPerson}
              onChange={setContactPerson}
              onEnter={next}
              placeholder={t.placeholders.contactPerson}
              autoFocus
            />
          </Question>
        )}

        {step === 2 && (
          <Question title={t.questions.q2title} hint={t.questions.q2hint}>
            <PhoneFields
              t={t}
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
          <Question title={t.questions.q3title}>
            <TextInput
              id="email"
              label={t.labels.email}
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              readOnly={emailLocked}
              onEnter={next}
              placeholder={t.placeholders.email}
              autoFocus
            />
          </Question>
        )}

        {step === 4 && (
          <Question title={t.questions.q4title}>
            <TextInput
              id="companyName"
              label={t.labels.companyName}
              value={companyName}
              onChange={setCompanyName}
              onEnter={next}
              placeholder={t.placeholders.companyName}
              autoFocus
            />
            <div className="mt-6">
              <TextInput
                id="vatNumber"
                label={`${t.labels.vat} (${t.labels.optional})`}
                value={vatNumber}
                onChange={setVatNumber}
                onEnter={next}
                placeholder={t.placeholders.vat}
              />
            </div>
          </Question>
        )}

        {step === 5 && (
          <Question title={t.questions.q5title} hint={t.questions.q5hint}>
            <TextInput
              id="address"
              label={t.labels.address}
              value={address}
              onChange={setAddress}
              onEnter={next}
              placeholder={t.placeholders.address}
              autoFocus
            />
            <PrivacyToggle
              label={t.labels.hideAddress}
              checked={!showAddress}
              onChange={(hidden) => setShowAddress(!hidden)}
            />
          </Question>
        )}

        {step === 6 && (
          <Question title={t.questions.q6title} hint={t.questions.q6hint}>
            <label className="sr-only" htmlFor="openingHours">
              {t.labels.openingHours} ({t.labels.optional})
            </label>
            <textarea
              id="openingHours"
              rows={4}
              autoFocus
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="mt-2 w-full resize-y rounded-xl border border-border/80 bg-cream-dark/30 px-4 py-3.5 text-base leading-relaxed text-forest outline-none transition-colors placeholder:text-muted/70 focus:border-terracotta"
              placeholder={t.placeholders.openingHours}
            />
          </Question>
        )}

        {step === 7 && (
          <Question title={t.questions.q7title} hint={t.questions.q7hint}>
            <div className="space-y-5">
              <TextInput
                id="instagram"
                label={t.labels.instagram}
                value={instagram}
                onChange={setInstagram}
                placeholder={t.placeholders.instagram}
              />
              <TextInput
                id="facebook"
                label={t.labels.facebook}
                value={facebook}
                onChange={setFacebook}
                placeholder={t.placeholders.facebook}
              />
              <TextInput
                id="otherSocial"
                label={t.labels.otherSocial}
                value={otherSocial}
                onChange={setOtherSocial}
                onEnter={next}
                placeholder={t.placeholders.otherSocial}
              />
            </div>
          </Question>
        )}

        {step === 8 && (
          <Question title={t.questions.q8title}>
            <SectorPicker
              t={t}
              sector={sector}
              setSector={setSector}
              sectorOther={sectorOther}
              setSectorOther={setSectorOther}
              onEnter={next}
            />
          </Question>
        )}

        {step === 9 && (
          <Question title={t.questions.q9title} hint={t.questions.q9hint}>
            <AreaField
              id="aboutBusiness"
              label={t.labels.aboutBusiness}
              hideLabel
              value={aboutBusiness}
              onChange={setAboutBusiness}
              placeholder={t.placeholders.aboutBusiness}
              rows={6}
              autoFocus
            />
          </Question>
        )}

        {step === 11 && (
          <Question
            title={t.questions.q11title}
            hint={fill(t.questions.q11hint, {
              count: selectedPages.length,
              required: pageLimit,
              package: packageLabel,
            })}
          >
            <PagePicker
              t={t}
              maxPages={pageLimit}
              lockedPage={homePage}
              selectedPages={selectedPages}
              customPage={customPage}
              setCustomPage={setCustomPage}
              onToggle={togglePage}
            />
          </Question>
        )}

        {step === 15 && (
          <Question title={t.questions.q15title} hint={t.questions.q15hint}>
            <PageNotesFields
              t={t}
              selectedPages={selectedPages}
              resolvedPages={resolvedPages}
              pageNotes={pageNotes}
              onChange={updatePageNote}
              autoFocus
            />
          </Question>
        )}

        {step === 12 && (
          <Question title={t.questions.q12title}>
            <BrandingFields
              key={`logo-step-${hasLogo}-${logoFile?.name ?? "none"}-${logoFile?.lastModified ?? 0}`}
              t={t}
              inputId="logo-step"
              hasLogo={hasLogo}
              setHasLogo={updateHasLogo}
              logoFile={logoFile}
              setLogoFile={setLogoFile}
              brandNotes={brandNotes}
              setBrandNotes={setBrandNotes}
              onError={setError}
            />
          </Question>
        )}

        {step === 13 && (
          <Question title={t.questions.q13title} hint={t.questions.q13hint}>
            <ImageUpload
              t={t}
              images={images}
              imagePreviews={imagePreviews}
              onAdd={addImages}
              onRemove={removeImage}
            />
          </Question>
        )}

        {isSummary && (
          <div className="relative">
            <h2 className="font-display text-2xl font-bold tracking-tight text-forest md:text-3xl">
              {t.summary.title}
            </h2>
            <p className="mt-3 text-base text-muted">{t.summary.intro}</p>

            <div className="mt-8 space-y-5">
              <SummaryBlock
                t={t}
                title={t.blocks.contact}
                editing={editingBlock === "contact"}
                error={editingBlock === "contact" ? error : ""}
                onEdit={() => {
                  setError("");
                  setEditingBlock("contact");
                }}
                onDone={() => finishSummaryBlock("contact")}
                blockRef={(node) => {
                  summaryBlockRefs.current.contact = node;
                }}
                rows={[
                  { label: t.labels.rowContactPerson, value: contactPerson },
                  {
                    label: t.labels.rowPhone,
                    value: `${fullPhone}${showPhone ? "" : t.summary.notShow}`,
                  },
                  { label: t.labels.rowEmail, value: email },
                ]}
              >
                <div className="space-y-5">
                  <TextInput
                    id="edit-contactPerson"
                    label={t.labels.rowContactPerson}
                    value={contactPerson}
                    onChange={setContactPerson}
                  />
                  <PhoneFields
                    t={t}
                    countryCode={countryCode}
                    setCountryCode={setCountryCode}
                    phone={phone}
                    setPhone={setPhone}
                    showPhone={showPhone}
                    setShowPhone={setShowPhone}
                  />
                  <TextInput
                    id="edit-email"
                    label={t.labels.email}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    readOnly={emailLocked}
                  />
                </div>
              </SummaryBlock>

              <SummaryBlock
                t={t}
                title={t.blocks.company}
                editing={editingBlock === "company"}
                error={editingBlock === "company" ? error : ""}
                onEdit={() => {
                  setError("");
                  setEditingBlock("company");
                }}
                onDone={() => finishSummaryBlock("company")}
                blockRef={(node) => {
                  summaryBlockRefs.current.company = node;
                }}
                rows={[
                  { label: t.labels.rowCompany, value: companyName },
                  {
                    label: t.labels.rowVat,
                    value: vatNumber || t.summary.notFilled,
                  },
                  {
                    label: t.labels.rowAddress,
                    value: `${address}${showAddress ? "" : t.summary.notShow}`,
                  },
                  {
                    label: t.labels.rowOpeningHours,
                    value: openingHours || t.summary.notFilled,
                  },
                  { label: t.labels.rowSocial, value: socialSummary },
                  {
                    label: t.labels.rowSector,
                    value: sectorLabel || t.summary.notFilled,
                  },
                  { label: t.labels.rowAbout, value: aboutBusiness },
                ]}
              >
                <div className="space-y-5">
                  <TextInput
                    id="edit-companyName"
                    label={t.labels.companyName}
                    value={companyName}
                    onChange={setCompanyName}
                  />
                  <TextInput
                    id="edit-vatNumber"
                    label={`${t.labels.vat} (${t.labels.optional})`}
                    value={vatNumber}
                    onChange={setVatNumber}
                    placeholder={t.placeholders.vat}
                  />
                  <TextInput
                    id="edit-address"
                    label={t.labels.address}
                    value={address}
                    onChange={setAddress}
                  />
                  <PrivacyToggle
                    label={t.labels.hideAddress}
                    checked={!showAddress}
                    onChange={(hidden) => setShowAddress(!hidden)}
                  />
                  <div>
                    <label
                      htmlFor="edit-openingHours"
                      className="block text-sm font-medium text-forest-muted"
                    >
                      {t.labels.openingHours} ({t.labels.optional})
                    </label>
                    <textarea
                      id="edit-openingHours"
                      rows={3}
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      className="mt-2 w-full resize-y rounded-xl border border-border/80 bg-cream px-4 py-3.5 text-base leading-relaxed text-forest outline-none focus:border-terracotta"
                      placeholder={t.placeholders.openingHours}
                    />
                  </div>
                  <TextInput
                    id="edit-instagram"
                    label={t.labels.instagram}
                    value={instagram}
                    onChange={setInstagram}
                  />
                  <TextInput
                    id="edit-facebook"
                    label={t.labels.facebook}
                    value={facebook}
                    onChange={setFacebook}
                  />
                  <TextInput
                    id="edit-otherSocial"
                    label={t.labels.otherSocialShort}
                    value={otherSocial}
                    onChange={setOtherSocial}
                  />
                  <SectorPicker
                    t={t}
                    sector={sector}
                    setSector={setSector}
                    sectorOther={sectorOther}
                    setSectorOther={setSectorOther}
                  />
                  <AreaField
                    id="edit-aboutBusiness"
                    label={t.labels.aboutBusiness}
                    value={aboutBusiness}
                    onChange={setAboutBusiness}
                    placeholder={t.placeholders.aboutBusiness}
                    rows={5}
                    compact
                  />
                </div>
              </SummaryBlock>

              <SummaryBlock
                t={t}
                title={t.blocks.website}
                editing={editingBlock === "website"}
                error={editingBlock === "website" ? error : ""}
                onEdit={() => {
                  setError("");
                  setEditingBlock("website");
                }}
                onDone={() => finishSummaryBlock("website")}
                blockRef={(node) => {
                  summaryBlockRefs.current.website = node;
                }}
                rows={[
                  { label: t.labels.rowPackage, value: packageLabel },
                  { label: t.labels.rowPages, value: pagesLabel },
                  ...selectedPages.map((page, index) => ({
                    label: resolvedPages[index] ?? page,
                    value:
                      (pageNotes[page] ?? "").trim() || t.summary.notFilled,
                  })),
                  { label: t.labels.rowLogo, value: logoSummary },
                  {
                    label: t.labels.rowBranding,
                    value: brandNotes || t.summary.notFilled,
                  },
                  {
                    label: t.labels.rowImages,
                    value:
                      images.length > 0
                        ? fill(t.summary.files, { count: images.length })
                        : t.summary.noUpload,
                  },
                ]}
              >
                <div className="space-y-6">
                  <p className="text-sm text-forest-muted">
                    <span className="font-semibold text-forest">
                      {t.labels.rowPackage}:
                    </span>{" "}
                    {packageLabel}
                  </p>
                  <PagePicker
                    t={t}
                    maxPages={pageLimit}
                    lockedPage={homePage}
                    selectedPages={selectedPages}
                    customPage={customPage}
                    setCustomPage={setCustomPage}
                    onToggle={togglePage}
                  />
                  <PageNotesFields
                    t={t}
                    selectedPages={selectedPages}
                    resolvedPages={resolvedPages}
                    pageNotes={pageNotes}
                    onChange={updatePageNote}
                    compact
                  />
                  <BrandingFields
                    key={`logo-check-${hasLogo}-${logoFile?.name ?? "none"}-${logoFile?.lastModified ?? 0}`}
                    t={t}
                    inputId="logo-check"
                    hasLogo={hasLogo}
                    setHasLogo={updateHasLogo}
                    logoFile={logoFile}
                    setLogoFile={setLogoFile}
                    brandNotes={brandNotes}
                    setBrandNotes={setBrandNotes}
                    onError={setError}
                  />
                  <ImageUpload
                    t={t}
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

            <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-cream-dark/30 px-4 py-4">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => {
                  setPrivacyConsent(e.target.checked);
                  if (e.target.checked) setError("");
                }}
                className="mt-1 h-4 w-4 shrink-0 accent-terracotta"
              />
              <span className="text-sm leading-relaxed text-forest">
                {t.consent.before}
                <Link
                  href={privacyHref(locale, dict)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-terracotta underline-offset-2 hover:underline"
                >
                  {t.consent.privacy}
                </Link>
                {t.consent.middle}
                <Link
                  href={termsHref(locale, dict)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-terracotta underline-offset-2 hover:underline"
                >
                  {t.consent.terms}
                </Link>
                {t.consent.after}
              </span>
            </label>
          </div>
        )}

      </div>

      {error && !editingBlock && (
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
              {t.nav.back}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={next}
            disabled={pending}
            className="rounded-full bg-terracotta px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover disabled:opacity-60"
          >
            {pending
              ? t.nav.submitting
              : isIntro
                ? t.intro.start
                : isSummary
                  ? t.nav.submit
                  : step === 13
                    ? t.nav.toSummary
                    : t.nav.next}
          </button>
        </div>
    </div>
  );
}

function StepTimeline({
  t,
  activeSteps,
  currentStep,
  maxReached,
  questionNumber,
  totalQuestions,
  section,
  onJump,
}: {
  t: FormDictionary;
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
      { id: "company" as const, steps: [4, 5, 6, 7, 8, 9] },
      { id: "website" as const, steps: [11, 15, 12, 13] },
      { id: "review" as const, steps: [14] },
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
          {section ? t.sections[section] : t.progress.briefing}
        </p>
        <p className="text-xs font-medium tracking-wide text-muted">
          {fill(t.progress.stepOf, {
            current: questionNumber,
            total: totalQuestions,
          })}
        </p>
      </div>

      <div className="relative pt-1" aria-label={t.progress.aria}>
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
                  {t.sectionsShort[group.id]}
                </p>
                <ol className="flex w-full items-center justify-center gap-2 sm:gap-2.5">
                  {group.steps.map((s) => {
                    const index = activeSteps.indexOf(s);
                    const done = index < currentIndex;
                    const active = index === currentIndex;
                    const clickable = s <= maxReached;
                    const stepLabel = fill(t.progress.stepOf, {
                      current: index + 1,
                      total: activeSteps.length,
                    });
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          disabled={!clickable}
                          onClick={() => onJump(s)}
                          aria-label={`${t.sections[group.id]}, ${stepLabel}`}
                          aria-current={active ? "step" : undefined}
                          title={`${t.sectionsShort[group.id]} · ${stepLabel}`}
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
      <h2 className="font-display text-2xl font-bold tracking-tight text-forest md:text-3xl">
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

function AreaField({
  id,
  label,
  optional,
  hideLabel = false,
  value,
  onChange,
  placeholder,
  rows = 3,
  autoFocus = false,
  compact = false,
}: {
  id: string;
  label: string;
  optional?: string;
  hideLabel?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={
          hideLabel
            ? "sr-only"
            : "block text-sm font-medium text-forest-muted"
        }
      >
        {label}
        {optional ? ` (${optional})` : ""}
      </label>
      <textarea
        id={id}
        rows={rows}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-2 w-full resize-y rounded-xl border border-border/80 px-4 py-3.5 text-base leading-relaxed text-forest outline-none transition-colors placeholder:text-muted/70 focus:border-terracotta ${
          compact ? "bg-cream" : "bg-cream-dark/30"
        }`}
      />
    </div>
  );
}

function PageNotesFields({
  t,
  selectedPages,
  resolvedPages,
  pageNotes,
  onChange,
  autoFocus = false,
  compact = false,
}: {
  t: FormDictionary;
  selectedPages: string[];
  resolvedPages: string[];
  pageNotes: Record<string, string>;
  onChange: (page: string, value: string) => void;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="space-y-4">
      {selectedPages.map((page, index) => {
        const title = resolvedPages[index] ?? page;
        return (
          <div
            key={page}
            className={`rounded-2xl border p-4 ${
              compact
                ? "border-border/80 bg-cream"
                : "border-terracotta/35 bg-cream-dark/30"
            }`}
          >
            <p className="mb-3 inline-flex rounded-full border border-terracotta bg-terracotta px-3.5 py-1 text-sm font-medium text-cream">
              {title}
            </p>
            <AreaField
              id={`pageNote-${compact ? "edit-" : ""}${page}`}
              label={t.labels.pageNotes}
              value={pageNotes[page] ?? ""}
              onChange={(value) => onChange(page, value)}
              placeholder={t.placeholders.pageNotes}
              rows={compact ? 2 : 3}
              autoFocus={autoFocus && index === 0}
              compact={compact}
            />
          </div>
        );
      })}
    </div>
  );
}

function PhoneFields({
  t,
  countryCode,
  setCountryCode,
  phone,
  setPhone,
  showPhone,
  setShowPhone,
  onEnter,
  autoFocus = false,
}: {
  t: FormDictionary;
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
            {t.labels.countryCode}
          </label>
          <select
            id="countryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="mt-2 w-full appearance-none border-b-2 border-border bg-transparent py-3 text-lg text-forest outline-none transition-colors focus:border-terracotta"
          >
            <optgroup label={t.countries.oftenChosen}>
              {COUNTRY_DIAL_CODES.slice(0, 3).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.dial} {t.countries.labels[c.code]}
                </option>
              ))}
            </optgroup>
            <optgroup label={t.countries.europe}>
              {COUNTRY_DIAL_CODES.slice(3).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.dial} {t.countries.labels[c.code]}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className="flex-1">
          <TextInput
            id="phone"
            label={t.labels.phoneNumber}
            type="tel"
            autoComplete="tel-national"
            value={phone}
            onChange={setPhone}
            onEnter={onEnter}
            placeholder={t.placeholders.phone}
            autoFocus={autoFocus}
          />
        </div>
      </div>
      <PrivacyToggle
        label={t.labels.hidePhone}
        checked={!showPhone}
        onChange={(hidden) => setShowPhone(!hidden)}
      />
    </>
  );
}

function SectorPicker({
  t,
  sector,
  setSector,
  sectorOther,
  setSectorOther,
  onEnter,
}: {
  t: FormDictionary;
  sector: string;
  setSector: (value: string) => void;
  sectorOther: string;
  setSectorOther: (value: string) => void;
  onEnter?: () => void;
}) {
  const otherSector = t.sectors[t.sectors.length - 1] ?? "";

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {t.sectors.map((option) => (
          <ChoiceButton
            key={option}
            selected={sector === option}
            onClick={() => setSector(option)}
            label={option}
          />
        ))}
      </div>
      {sector === otherSector && (
        <div className="mt-6">
          <TextInput
            id="sectorOther"
            label={t.labels.sectorOther}
            value={sectorOther}
            onChange={setSectorOther}
            onEnter={onEnter}
            placeholder={t.placeholders.sectorOther}
            autoFocus
          />
        </div>
      )}
    </>
  );
}

function PagePicker({
  t,
  maxPages,
  lockedPage,
  selectedPages,
  customPage,
  setCustomPage,
  onToggle,
}: {
  t: FormDictionary;
  maxPages: number;
  lockedPage?: string;
  selectedPages: string[];
  customPage: string;
  setCustomPage: (value: string) => void;
  onToggle: (page: string) => void;
}) {
  const otherPage = t.pages[t.pages.length - 1] ?? "";

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {t.pages.map((page) => {
          const selected = selectedPages.includes(page);
          const homeLocked = Boolean(lockedPage && page === lockedPage);
          const locked = homeLocked || (!selected && selectedPages.length >= maxPages);
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
      {selectedPages.includes(otherPage) && (
        <div className="mt-5">
          <label
            htmlFor="customPage"
            className="block text-sm font-medium text-forest-muted"
          >
            {t.labels.customPage}
          </label>
          <input
            id="customPage"
            type="text"
            maxLength={MAX_CUSTOM_PAGE}
            value={customPage}
            onChange={(e) => setCustomPage(e.target.value.slice(0, MAX_CUSTOM_PAGE))}
            className="mt-2 w-full border-b-2 border-border bg-transparent py-3 text-lg text-forest outline-none focus:border-terracotta"
            placeholder={t.placeholders.customPage}
            autoFocus
          />
          <p className="mt-2 text-xs text-muted">
            {fill(t.labels.charCount, {
              count: customPage.length,
              max: MAX_CUSTOM_PAGE,
            })}
          </p>
        </div>
      )}
    </div>
  );
}

function BrandingFields({
  t,
  hasLogo,
  setHasLogo,
  logoFile,
  setLogoFile,
  brandNotes,
  setBrandNotes,
  onError,
  inputId = "logo",
}: {
  t: FormDictionary;
  hasLogo: BrandChoice;
  setHasLogo: (value: BrandChoice) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  brandNotes: string;
  setBrandNotes: (value: string) => void;
  onError?: (message: string) => void;
  inputId?: string;
}) {
  function chooseLogo(value: BrandChoice) {
    if (value === hasLogo) return;
    setHasLogo(value);
    onError?.("");
  }

  function clearLogo() {
    setLogoFile(null);
    onError?.("");
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        {(
          [
            { value: "ja" as const, label: t.logo.yes },
            { value: "nee" as const, label: t.logo.no },
          ] as const
        ).map((option) => (
          <ChoiceButton
            key={option.value}
            selected={hasLogo === option.value}
            onClick={() => chooseLogo(option.value)}
            label={option.label}
            className="flex-1"
          />
        ))}
      </div>

      {hasLogo === "ja" && (
        <div className="mt-6 rounded-xl border border-dashed border-terracotta/40 bg-terracotta/[0.06] p-5">
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-forest"
          >
            {t.logo.uploadLabel} <span className="text-terracotta">*</span>
          </label>
          {logoFile ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-forest">
                {fill(t.logo.selected, { name: logoFile.name })}
              </p>
              <button
                type="button"
                onClick={clearLogo}
                className="text-sm font-semibold text-terracotta transition-colors hover:text-terracotta-hover"
              >
                {t.logo.remove}
              </button>
            </div>
          ) : (
            <input
              id={inputId}
              key={`${inputId}-empty`}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
              className="mt-3 block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-terracotta file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) {
                  setLogoFile(null);
                  return;
                }
                const okType =
                  /^(image\/(jpeg|png|webp)|application\/pdf)$/i.test(
                    file.type,
                  ) || /\.(jpe?g|png|webp|pdf)$/i.test(file.name);
                if (!okType) {
                  setLogoFile(null);
                  e.target.value = "";
                  onError?.(fill(t.errors.logoType, { name: file.name }));
                  return;
                }
                if (file.size > MAX_IMAGE_BYTES) {
                  setLogoFile(null);
                  e.target.value = "";
                  onError?.(fill(t.errors.fileTooBig, { name: file.name }));
                  return;
                }
                onError?.("");
                setLogoFile(file);
              }}
            />
          )}
          <div className="mt-5">
            <TextInput
              id={`${inputId}-notes`}
              label={t.logo.brandingOptional}
              value={brandNotes}
              onChange={setBrandNotes}
              placeholder={t.placeholders.brandNotesOptional}
            />
          </div>
        </div>
      )}

      {hasLogo === "nee" && (
        <div className="mt-6">
          <label
            htmlFor={`${inputId}-brand-notes`}
            className="block text-sm font-medium text-forest-muted"
          >
            {t.logo.brandingRequired}
          </label>
          <textarea
            id={`${inputId}-brand-notes`}
            rows={4}
            value={brandNotes}
            onChange={(e) => setBrandNotes(e.target.value)}
            className="mt-2 w-full resize-y rounded-xl border border-border/80 bg-cream-dark/30 px-4 py-3.5 text-base leading-relaxed text-forest outline-none transition-colors placeholder:text-muted/70 focus:border-terracotta"
            placeholder={t.placeholders.brandNotesNone}
          />
        </div>
      )}
    </>
  );
}

function ImageUpload({
  t,
  images,
  imagePreviews,
  onAdd,
  onRemove,
}: {
  t: FormDictionary;
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
        <span className="font-display text-lg font-bold text-forest">
          {t.images.dropTitle}
        </span>
        <span className="mt-1 text-sm text-muted">
          {fill(t.images.dropHint, { max: MAX_IMAGES })}
        </span>
        <span className="mt-3 text-sm font-semibold text-terracotta">
          {fill(t.images.added, { count: images.length, max: MAX_IMAGES })}
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
                {t.logo.remove}
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
  t,
  title,
  rows,
  editing,
  error,
  onEdit,
  onDone,
  blockRef,
  children,
}: {
  t: FormDictionary;
  title: string;
  rows: { label: string; value: string }[];
  editing: boolean;
  error?: string;
  onEdit: () => void;
  onDone: () => void;
  blockRef?: (node: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  return (
    <div
      ref={blockRef}
      className="rounded-xl border border-border/80 bg-cream-dark/30 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-forest">
          {title}
        </h3>
        <button
          type="button"
          onClick={editing ? onDone : onEdit}
          className="text-sm font-semibold text-terracotta transition-colors hover:text-terracotta-hover"
        >
          {editing ? t.summary.done : t.summary.edit}
        </button>
      </div>

      {editing ? (
        <div className="mt-5">
          {children}
          {error ? (
            <p className="mt-4 text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
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
  readOnly,
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
  readOnly?: boolean;
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
        readOnly={readOnly}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className={`mt-2 w-full border-b-2 bg-transparent py-3 text-lg text-forest outline-none transition-colors placeholder:text-muted/60 focus:border-terracotta ${
          readOnly
            ? "cursor-default border-border/60 text-forest-muted"
            : "border-border"
        }`}
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
