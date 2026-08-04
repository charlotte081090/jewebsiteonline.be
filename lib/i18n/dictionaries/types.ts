/**
 * Shape contract for every locale dictionary.
 *
 * `nl.ts` is the source of truth for the copy; it is written with
 * `satisfies Dictionary` so literal types stay narrow while the shape is
 * checked. `en.ts` is annotated `: Dictionary` so a missing key fails the
 * build instead of silently falling back to Dutch.
 *
 * Placeholders inside strings use `{name}` syntax and are documented per key.
 */

export type CountryCode =
  | "BE"
  | "NL"
  | "DE"
  | "FR"
  | "LU"
  | "AT"
  | "CH"
  | "IT"
  | "ES"
  | "PT"
  | "IE"
  | "GB"
  | "DK"
  | "SE"
  | "NO"
  | "FI"
  | "PL"
  | "CZ"
  | "SK"
  | "HU"
  | "RO"
  | "BG"
  | "GR"
  | "HR"
  | "SI"
  | "EE"
  | "LV"
  | "LT"
  | "MT"
  | "CY";

export type MetaDictionary = {
  title: string;
  /** Next.js title template, must contain `%s`. */
  titleTemplate: string;
  description: string;
  keywords: readonly string[];
  ogTitle: string;
  ogDescription: string;
  siteName: string;
};

export type NavDictionary = {
  howItWorks: string;
  examples: string;
  pricing: string;
  reviews: string;
  /** Primary header call to action. */
  cta: string;
  startNow: string;
  home: string;
  /** aria-label of the mobile menu dialog. */
  mobileMenu: string;
  closeMenu: string;
  openMenu: string;
  /** aria-label of the desktop nav element. */
  mainNav: string;
  /** aria-label of the mobile nav element. */
  mobileNav: string;
};

export type FooterDictionary = {
  blurb: string;
  navigation: string;
  legal: string;
  privacy: string;
  terms: string;
  /** Uses `{year}`. */
  rights: string;
  emailAria: string;
  instagramAria: string;
};

export type CookieDictionary = {
  title: string;
  /** Full sentence without markup, for screen readers or plain contexts. */
  body: string;
  bodyBeforeLink: string;
  privacyLink: string;
  bodyAfterLink: string;
  essential: string;
  accept: string;
};

export type BrandDictionary = {
  homeAria: string;
};

export type HeroDictionary = {
  eyebrow: string;
  title: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
  bullets: readonly string[];
  imageAlt: string;
  /** Uses `{count}`. */
  pulseLabel: string;
};

export type UspsDictionary = {
  label: string;
};

export type ShowcaseDictionary = {
  eyebrow: string;
  title: string;
  body: string;
  prev: string;
  next: string;
};

export type ProblemDictionary = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
};

export type HowItWorksStep = {
  title: string;
  time: string;
  body: string;
};

export type HowItWorksDictionary = {
  eyebrow: string;
  title: string;
  intro: string;
  steps: readonly HowItWorksStep[];
};

export type PortfolioItem = {
  category: string;
  name: string;
  focus: string;
  alt: string;
};

export type PortfolioDictionary = {
  eyebrow: string;
  title: string;
  intro: string;
  prev: string;
  next: string;
  items: readonly PortfolioItem[];
};

export type PricingPackage = {
  id: string;
  name: string;
  price: string;
  wasPrice?: string;
  description: string;
  highlights: readonly string[];
  cta: string;
};

export type PricingDictionary = {
  eyebrow: string;
  title: string;
  intro: string;
  mostPopular: string;
  alwaysIncluded: string;
  included: readonly string[];
  packages: readonly PricingPackage[];
  cta: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqDictionary = {
  eyebrow: string;
  title: string;
  intro: string;
  items: readonly FaqItem[];
};

export type ReviewItem = {
  quote: string;
  name: string;
  role: string;
};

export type ReviewsDictionary = {
  eyebrow: string;
  title: string;
  intro: string;
  starsAria: string;
  /** Uses `{name}`. */
  photoAlt: string;
  items: readonly ReviewItem[];
  ctaTitle: string;
  ctaButton: string;
};

export type StartNuDictionary = {
  metaTitle: string;
  metaDescription: string;
};

export type BedanktDictionary = {
  metaTitle: string;
  title: string;
  /** Uses `{name}`. */
  titleNamed: string;
  body: string;
  backHome: string;
};

export type LegalSection = {
  heading: string;
  paragraphs: readonly string[];
  list?: readonly string[];
};

export type PrivacyDictionary = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  updated: string;
  backHome: string;
  sections: readonly LegalSection[];
};

export type TermsDictionary = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  updated: string;
  backHome: string;
  privacyLinkLabel: string;
  sections: readonly LegalSection[];
};

export type FormSectionLabels = {
  contact: string;
  company: string;
  website: string;
  review: string;
};

export type FormDictionary = {
  intro: {
    eyebrow: string;
    title: string;
    body: string;
    bullets: readonly string[];
    start: string;
  };
  sections: FormSectionLabels;
  sectionsShort: FormSectionLabels;
  progress: {
    /** Uses `{current}` and `{total}`. */
    stepOf: string;
    briefing: string;
    aria: string;
  };
  nav: {
    back: string;
    next: string;
    toSummary: string;
    submit: string;
    submitting: string;
  };
  consent: {
    before: string;
    privacy: string;
    middle: string;
    terms: string;
    after: string;
  };
  summary: {
    title: string;
    intro: string;
    edit: string;
    done: string;
    notFilled: string;
    notChosen: string;
    /** Suffix shown when a field is marked as hidden on the website. */
    notShow: string;
    /** Uses `{count}`. */
    files: string;
    noUpload: string;
    homeOnePage: string;
  };
  blocks: {
    contact: string;
    company: string;
    website: string;
  };
  labels: {
    contactPerson: string;
    countryCode: string;
    phoneNumber: string;
    email: string;
    companyName: string;
    address: string;
    openingHours: string;
    businessInfo: string;
    instagram: string;
    facebook: string;
    otherSocial: string;
    otherSocialShort: string;
    sectorOther: string;
    customPage: string;
    brandNotesOptional: string;
    brandNotesNone: string;
    hidePhone: string;
    hideAddress: string;
    /** Uses `{count}` and `{max}`. */
    charCount: string;
    rowContactPerson: string;
    rowPhone: string;
    rowEmail: string;
    rowCompany: string;
    rowAddress: string;
    rowOpeningHours: string;
    rowSocial: string;
    rowSector: string;
    rowAbout: string;
    rowPackage: string;
    rowPages: string;
    rowLogo: string;
    rowBranding: string;
    rowImages: string;
  };
  placeholders: {
    contactPerson: string;
    phone: string;
    email: string;
    companyName: string;
    address: string;
    openingHours: string;
    instagram: string;
    facebook: string;
    otherSocial: string;
    sectorOther: string;
    businessInfo: string;
    businessInfoShort: string;
    customPage: string;
    brandNotesOptional: string;
    brandNotesNone: string;
  };
  questions: {
    q1title: string;
    q2title: string;
    q2hint: string;
    q3title: string;
    q4title: string;
    q5title: string;
    q5hint: string;
    q6title: string;
    q6hint: string;
    q7title: string;
    q7hint: string;
    q8title: string;
    q9title: string;
    q9hint: string;
    q10title: string;
    q10hint: string;
    q11title: string;
    /** Uses `{count}`. */
    q11hint: string;
    q12title: string;
    q13title: string;
    q13hint: string;
  };
  sectors: readonly string[];
  pages: readonly string[];
  packages: {
    onePage: { label: string; description: string };
    threePage: { label: string; description: string };
  };
  logo: {
    yes: string;
    no: string;
    uploadLabel: string;
    brandingOptional: string;
    brandingRequired: string;
    /** Uses `{name}`. */
    selected: string;
    remove: string;
  };
  images: {
    dropTitle: string;
    /** Uses `{max}`. */
    dropHint: string;
    /** Uses `{count}` and `{max}`. */
    added: string;
  };
  errors: {
    contactPerson: string;
    phone: string;
    email: string;
    emailInvalid: string;
    companyName: string;
    address: string;
    openingHours: string;
    sector: string;
    sectorOther: string;
    businessInfo: string;
    packageChoice: string;
    pagesExactly3: string;
    customPage: string;
    logoChoice: string;
    logoUpload: string;
    brandNotes: string;
    consent: string;
    contactIncomplete: string;
    companyIncomplete: string;
    websiteIncomplete: string;
    /** Uses `{name}`. */
    imageType: string;
    /** Uses `{name}`. */
    logoType: string;
    /** Uses `{name}`. */
    fileTooBig: string;
    generic: string;
  };
  countries: {
    oftenChosen: string;
    europe: string;
    labels: Record<CountryCode, string>;
  };
};

export type RoutesDictionary = {
  home: string;
  start: string;
  thankYou: string;
  privacy: string;
  terms: string;
  anchors: {
    top: string;
    howItWorks: string;
    examples: string;
    pricing: string;
    reviews: string;
    faq: string;
  };
};

export type LanguageToggleDictionary = {
  label: string;
  nl: string;
  en: string;
};

export type Dictionary = {
  meta: MetaDictionary;
  nav: NavDictionary;
  footer: FooterDictionary;
  cookie: CookieDictionary;
  brand: BrandDictionary;
  hero: HeroDictionary;
  usps: UspsDictionary;
  showcase: ShowcaseDictionary;
  problem: ProblemDictionary;
  howItWorks: HowItWorksDictionary;
  portfolio: PortfolioDictionary;
  pricing: PricingDictionary;
  faq: FaqDictionary;
  reviews: ReviewsDictionary;
  startNu: StartNuDictionary;
  bedankt: BedanktDictionary;
  privacy: PrivacyDictionary;
  terms: TermsDictionary;
  form: FormDictionary;
  routes: RoutesDictionary;
  languageToggle: LanguageToggleDictionary;
};
