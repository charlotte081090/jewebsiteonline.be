"use server";

import { headers } from "next/headers";
import {
  getEmailFrom,
  getResendClient,
  getStaffInbox,
  sendClientBriefingConfirmation,
} from "@/lib/email";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { resolvePaidAccess } from "@/lib/paid-access";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  detectFileKind,
  isAllowedGalleryKind,
  isAllowedLogoKind,
  mimeForKind,
} from "@/lib/upload-validation";

export type ContactResult =
  | { ok: true; orderNumber?: string }
  | { ok: false; error: string };

type QaAnswer = { question: string; answer: string };

const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_IMAGES = 5;
const UPLOAD_BUCKET = "briefing-uploads";

const MAX_SHORT = 120;
const MAX_MEDIUM = 300;
const MAX_LONG = 4000;

const ALLOWED_PACKAGES = new Set(["1-pagina", "3-pagina"]);
const ALLOWED_YES_NO = new Set(["ja", "nee"]);

const SUPPORT_EMAIL = "info@jewebsiteonline.com";

/**
 * User-facing failures returned by this action. Kept separate from the UI
 * dictionaries because these strings never render on the server-rendered page.
 */
const MESSAGES = {
  nl: {
    rateLimitIp: `Te veel aanvragen vanaf dit netwerk. Probeer later opnieuw of mail ${SUPPORT_EMAIL}.`,
    rateLimitEmail: `Er is al een recente aanvraag met dit e-mailadres. Mail ons op ${SUPPORT_EMAIL} als u hulp nodig heeft.`,
    requiredFields: "Gelieve alle verplichte velden in te vullen.",
    consent: "Bevestig dat u akkoord gaat met het privacybeleid.",
    emailInvalid: "Ongeldig e-mailadres.",
    packageInvalid: "Ongeldig pakket.",
    logoChoice: "Gelieve aan te geven of u een logo heeft.",
    showPhoneInvalid: "Ongeldige keuze voor telefoon tonen.",
    showAddressInvalid: "Ongeldige keuze voor adres tonen.",
    tooManyImages: `Upload max. ${MAX_IMAGES} beelden.`,
    logoRequired: "Upload uw logo om verder te gaan.",
    logoTooBig: "Het logo mag max. 3 MB zijn.",
    logoType: "Logo: enkel JPG, PNG, WebP of PDF toegestaan.",
    imageTooBig: (name: string) => `“${name}” mag max. 3 MB zijn.`,
    imageType: (name: string) =>
      `“${name}”: enkel JPG, PNG, WebP of GIF.`,
    storageUnavailable: `Opslaan is tijdelijk niet beschikbaar. Mail ons op ${SUPPORT_EMAIL}.`,
    saveFailed: `Opslaan mislukt. Probeer opnieuw of mail ${SUPPORT_EMAIL}.`,
    paymentRequired: `Deze briefing is alleen beschikbaar na betaling. Kies een pakket of mail ${SUPPORT_EMAIL}.`,
    paymentUsed: `Deze betaling is al gekoppeld aan een briefing. Mail ${SUPPORT_EMAIL} als u hulp nodig heeft.`,
    fallbackFileName: "beeld",
  },
  en: {
    rateLimitIp: `Too many requests from this network. Please try again later or email ${SUPPORT_EMAIL}.`,
    rateLimitEmail: `There is already a recent request with this email address. Email us at ${SUPPORT_EMAIL} if you need help.`,
    requiredFields: "Please complete all required fields.",
    consent: "Please confirm that you agree to the privacy policy.",
    emailInvalid: "Invalid email address.",
    packageInvalid: "Invalid package.",
    logoChoice: "Please indicate whether you have a logo.",
    showPhoneInvalid: "Invalid choice for showing your phone number.",
    showAddressInvalid: "Invalid choice for showing your address.",
    tooManyImages: `Please upload no more than ${MAX_IMAGES} images.`,
    logoRequired: "Please upload your logo to continue.",
    logoTooBig: "The logo may be no larger than 3 MB.",
    logoType: "Logo: only JPG, PNG, WebP or PDF are allowed.",
    imageTooBig: (name: string) =>
      `“${name}” may be no larger than 3 MB.`,
    imageType: (name: string) =>
      `“${name}”: only JPG, PNG, WebP or GIF are allowed.`,
    storageUnavailable: `Saving is temporarily unavailable. Email us at ${SUPPORT_EMAIL}.`,
    saveFailed: `Saving failed. Please try again or email ${SUPPORT_EMAIL}.`,
    paymentRequired: `This briefing is only available after payment. Choose a package or email ${SUPPORT_EMAIL}.`,
    paymentUsed: `This payment is already linked to a briefing. Email ${SUPPORT_EMAIL} if you need help.`,
    fallbackFileName: "image",
  },
} satisfies Record<Locale, Record<string, unknown>>;

function readLocale(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "").trim();
  return isLocale(value) ? value : defaultLocale;
}

function normalizeYesNo(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "ja" || normalized.startsWith("ja")) return "ja";
  if (normalized === "nee" || normalized.startsWith("nee")) return "nee";
  return normalized;
}

function clip(value: string, max: number) {
  return value.slice(0, max);
}

function clientIp(headerList: Headers) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return (
    headerList.get("x-real-ip") ||
    headerList.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function submitBriefing(
  formData: FormData,
): Promise<ContactResult> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { ok: true };
  }

  const locale = readLocale(formData);
  const messages = MESSAGES[locale];

  const headerList = await headers();
  const ip = clientIp(headerList);

  const ipLimit = rateLimit(`briefing:ip:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!ipLimit.ok) {
    return { ok: false, error: messages.rateLimitIp };
  }

  const contactPerson = clip(
    String(formData.get("contactPerson") ?? "").trim(),
    MAX_SHORT,
  );
  const companyName = clip(
    String(formData.get("companyName") ?? "").trim(),
    MAX_SHORT,
  );
  const email = clip(String(formData.get("email") ?? "").trim(), MAX_SHORT);
  const phone = clip(String(formData.get("phone") ?? "").trim(), 40);
  const showPhone = normalizeYesNo(String(formData.get("showPhone") ?? ""));
  const address = clip(String(formData.get("address") ?? "").trim(), MAX_MEDIUM);
  const showAddress = normalizeYesNo(String(formData.get("showAddress") ?? ""));
  const openingHours = clip(
    String(formData.get("openingHours") ?? "").trim(),
    MAX_MEDIUM,
  );
  const instagram = clip(
    String(formData.get("instagram") ?? "").trim(),
    MAX_MEDIUM,
  );
  const facebook = clip(
    String(formData.get("facebook") ?? "").trim(),
    MAX_MEDIUM,
  );
  const otherSocial = clip(
    String(formData.get("otherSocial") ?? "").trim(),
    MAX_MEDIUM,
  );
  const sector = clip(String(formData.get("sector") ?? "").trim(), MAX_SHORT);
  const businessInfo = clip(
    String(formData.get("businessInfo") ?? "").trim(),
    MAX_LONG,
  );
  const packageChoice = String(formData.get("packageChoice") ?? "").trim();
  const selectedPages = clip(
    String(formData.get("selectedPages") ?? "").trim(),
    MAX_MEDIUM,
  );
  const hasLogo = normalizeYesNo(String(formData.get("hasLogo") ?? ""));
  const brandNotes = clip(
    String(formData.get("brandNotes") ?? "").trim(),
    MAX_LONG,
  );
  const privacyConsent = normalizeYesNo(
    String(formData.get("privacyConsent") ?? ""),
  );
  const checkoutSessionId = String(
    formData.get("checkoutSessionId") ?? "",
  ).trim();
  const formReferenceId = clip(
    String(formData.get("formReferenceId") ?? "").trim(),
    MAX_SHORT,
  );
  const logo = formData.get("logo");
  const images = formData.getAll("images");

  const paid = await resolvePaidAccess(checkoutSessionId);
  if (!paid.ok) {
    if (paid.reason === "used") {
      return { ok: false, error: messages.paymentUsed };
    }
    return { ok: false, error: messages.paymentRequired };
  }

  // Never trust client package/email — use verified Stripe session values.
  const verifiedPackage = paid.access.packageChoice;
  const verifiedEmail = paid.access.email;
  const verifiedReference =
    paid.access.formReferenceId || formReferenceId || checkoutSessionId;

  if (
    !contactPerson ||
    !companyName ||
    !phone ||
    !openingHours ||
    !sector ||
    !businessInfo ||
    !hasLogo
  ) {
    return { ok: false, error: messages.requiredFields };
  }

  if (privacyConsent !== "ja") {
    return { ok: false, error: messages.consent };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verifiedEmail)) {
    return { ok: false, error: messages.emailInvalid };
  }

  if (!ALLOWED_PACKAGES.has(verifiedPackage)) {
    return { ok: false, error: messages.packageInvalid };
  }

  if (!ALLOWED_YES_NO.has(hasLogo)) {
    return { ok: false, error: messages.logoChoice };
  }

  if (showPhone && !ALLOWED_YES_NO.has(showPhone)) {
    return { ok: false, error: messages.showPhoneInvalid };
  }

  if (showAddress && !ALLOWED_YES_NO.has(showAddress)) {
    return { ok: false, error: messages.showAddressInvalid };
  }

  const emailLimit = rateLimit(
    `briefing:email:${verifiedEmail.toLowerCase()}`,
    {
      limit: 3,
      windowMs: 24 * 60 * 60 * 1000,
    },
  );
  if (!emailLimit.ok) {
    return { ok: false, error: messages.rateLimitEmail };
  }

  if (images.length > MAX_IMAGES) {
    return { ok: false, error: messages.tooManyImages };
  }

  const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
  if (hasLogo === "ja" && !logoFile) {
    return { ok: false, error: messages.logoRequired };
  }
  if (logoFile && logoFile.size > MAX_FILE_BYTES) {
    return { ok: false, error: messages.logoTooBig };
  }

  type PreparedUpload = {
    file: File;
    buffer: Buffer;
    contentType: string;
    folder: string;
  };

  const prepared: PreparedUpload[] = [];

  if (logoFile) {
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    const kind = detectFileKind(buffer);
    if (!kind || !isAllowedLogoKind(kind)) {
      return { ok: false, error: messages.logoType };
    }
    prepared.push({
      file: logoFile,
      buffer,
      contentType: mimeForKind(kind),
      folder: "logo",
    });
  }

  for (const entry of images) {
    if (!(entry instanceof File) || entry.size <= 0) continue;
    const name = entry.name || messages.fallbackFileName;
    if (entry.size > MAX_FILE_BYTES) {
      return { ok: false, error: messages.imageTooBig(name) };
    }
    const buffer = Buffer.from(await entry.arrayBuffer());
    const kind = detectFileKind(buffer);
    if (!kind || !isAllowedGalleryKind(kind)) {
      return { ok: false, error: messages.imageType(name) };
    }
    prepared.push({
      file: entry,
      buffer,
      contentType: mimeForKind(kind),
      folder: "images",
    });
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error(err);
    return { ok: false, error: messages.storageUnavailable };
  }

  const answers: QaAnswer[] = [
    { question: "Taal briefing", answer: locale === "en" ? "Engels" : "Nederlands" },
    { question: "Contactpersoon", answer: contactPerson },
    { question: "Bedrijfsnaam", answer: companyName },
    { question: "E-mail", answer: verifiedEmail },
    { question: "Telefoon", answer: phone },
    {
      question: "Telefoon tonen op website",
      answer: showPhone === "ja" ? "Ja" : "Nee",
    },
    { question: "Adres", answer: address || "Niet opgegeven" },
    {
      question: "Adres tonen op website",
      answer: showAddress === "ja" ? "Ja" : "Nee",
    },
    { question: "Openingsuren", answer: openingHours },
    { question: "Instagram", answer: instagram || "Niet opgegeven" },
    { question: "Facebook", answer: facebook || "Niet opgegeven" },
    { question: "Andere link", answer: otherSocial || "Niet opgegeven" },
    { question: "Sector", answer: sector },
    { question: "Over de zaak", answer: businessInfo },
    { question: "Pakket", answer: verifiedPackage },
    { question: "Pagina's", answer: selectedPages || "Niet opgegeven" },
    { question: "Logo", answer: hasLogo === "ja" ? "Ja" : "Nee" },
    { question: "Brandingnotities", answer: brandNotes || "Niet opgegeven" },
    {
      question: "Privacytoestemming",
      answer: privacyConsent === "ja" ? "Ja" : "Nee",
    },
    { question: "Betaalreferentie", answer: verifiedReference },
    { question: "Stripe checkout session", answer: paid.access.checkoutSessionId },
  ];

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      status: "new_order",
      site_language: locale,
      contact_name: contactPerson,
      contact_email: verifiedEmail,
      contact_phone: phone,
      answers,
      notes: `${companyName} | ${verifiedPackage} | ${sector} | ${verifiedReference}`,
      payment_status: "paid",
      paid_at: paid.access.paidAt,
      stripe_checkout_session_id: paid.access.checkoutSessionId,
      stripe_payment_intent_id: paid.access.paymentIntentId,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Supabase order insert error:", orderError);
    return { ok: false, error: messages.saveFailed };
  }

  const uploadPaths: string[] = [];
  const emailAttachments: { filename: string; content: Buffer }[] = [];

  async function uploadPrepared(item: PreparedUpload) {
    const safeName = item.file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80);
    const path = `orders/${order!.id}/${item.folder}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(path, item.buffer, {
        contentType: item.contentType,
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }

    uploadPaths.push(path);
    emailAttachments.push({
      filename: item.file.name || safeName,
      content: item.buffer,
    });
    return path;
  }

  let logoPath: string | null = null;
  const imagePaths: string[] = [];

  for (const item of prepared) {
    const path = await uploadPrepared(item);
    if (!path) continue;
    if (item.folder === "logo") logoPath = path;
    else imagePaths.push(path);
  }

  const answersWithFiles: QaAnswer[] = [
    ...answers,
    {
      question: "Logo bestand",
      answer: logoPath || "Geen upload",
    },
    {
      question: "Beelden",
      answer:
        imagePaths.length > 0 ? imagePaths.join(", ") : "Geen upload",
    },
  ];

  const { error: updateError } = await supabase
    .from("orders")
    .update({ answers: answersWithFiles })
    .eq("id", order.id);

  if (updateError) {
    console.error("Supabase order update error:", updateError);
  }

  const { error: taskError } = await supabase.from("tasks").insert({
    order_id: order.id,
    title: `Website bouwen: ${companyName}`,
    description: `Nieuwe betaalde briefing via jewebsiteonline.be. Pakket: ${verifiedPackage}. Ref: ${verifiedReference}.`,
    status: "todo",
    priority: "high",
    task_type: "follow_up",
  });

  if (taskError) {
    console.error("Supabase task insert error:", taskError);
  }

  const resend = getResendClient();
  const to = getStaffInbox();
  const from = getEmailFrom();
  const orderNumber = order.order_number ?? order.id;

  let staffEmailStatus = "skipped";
  let clientEmailStatus = "skipped";

  if (resend) {
    const html = `
      <h2>Nieuwe briefing ${escapeHtml(orderNumber)}</h2>
      <p><strong>Order:</strong> ${escapeHtml(orderNumber)}</p>
      <h3>Contactgegevens</h3>
      <p><strong>Contactpersoon:</strong> ${escapeHtml(contactPerson)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(verifiedEmail)}</p>
      <p><strong>Telefoon:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Telefoon tonen op website:</strong> ${escapeHtml(showPhone === "ja" ? "Ja" : "Nee")}</p>
      <h3>Bedrijfsgegevens</h3>
      <p><strong>Bedrijf:</strong> ${escapeHtml(companyName)}</p>
      <p><strong>Adres:</strong> ${escapeHtml(address || "Niet opgegeven")}</p>
      <p><strong>Adres tonen op website:</strong> ${escapeHtml(showAddress === "ja" ? "Ja" : "Nee")}</p>
      <p><strong>Openingsuren:</strong><br/>${escapeHtml(openingHours).replace(/\n/g, "<br/>")}</p>
      <p><strong>Instagram:</strong> ${escapeHtml(instagram || "Niet opgegeven")}</p>
      <p><strong>Facebook:</strong> ${escapeHtml(facebook || "Niet opgegeven")}</p>
      <p><strong>Andere link:</strong> ${escapeHtml(otherSocial || "Niet opgegeven")}</p>
      <p><strong>Sector:</strong> ${escapeHtml(sector)}</p>
      <p><strong>Over de zaak:</strong><br/>${escapeHtml(businessInfo).replace(/\n/g, "<br/>")}</p>
      <h3>Website & branding</h3>
      <p><strong>Pakket:</strong> ${escapeHtml(verifiedPackage)}</p>
      <p><strong>Pagina's:</strong> ${escapeHtml(selectedPages || "Niet opgegeven")}</p>
      <p><strong>Logo:</strong> ${escapeHtml(hasLogo === "ja" ? "Ja" : "Nee")}</p>
      <p><strong>Brandingnotities:</strong><br/>${escapeHtml(brandNotes || "Niet opgegeven").replace(/\n/g, "<br/>")}</p>
      <p><strong>Privacytoestemming:</strong> ${escapeHtml(privacyConsent === "ja" ? "Ja" : "Nee")}</p>
      <p><strong>Betaalreferentie:</strong> ${escapeHtml(verifiedReference)}</p>
      <p><strong>Stripe session:</strong> ${escapeHtml(paid.access.checkoutSessionId)}</p>
      <p><strong>Uploads in Storage:</strong> ${escapeHtml(String(uploadPaths.length))}</p>
    `;

    const text = [
      `Nieuwe briefing ${orderNumber}`,
      `Order: ${orderNumber}`,
      "",
      `Contactpersoon: ${contactPerson}`,
      `E-mail: ${verifiedEmail}`,
      `Telefoon: ${phone}`,
      `Bedrijf: ${companyName}`,
      `Sector: ${sector}`,
      `Pakket: ${verifiedPackage}`,
      `Pagina's: ${selectedPages || "Niet opgegeven"}`,
      `Betaalreferentie: ${verifiedReference}`,
    ].join("\n");

    try {
      const { error } = await resend.emails.send({
        from,
        to: [to],
        replyTo: verifiedEmail,
        subject: `Briefing ${orderNumber}: ${companyName}`,
        html,
        text,
        attachments: emailAttachments.length ? emailAttachments : undefined,
      });

      staffEmailStatus = error ? "failed" : "sent";
      if (error) console.error("Resend staff email error:", error);
    } catch (err) {
      staffEmailStatus = "failed";
      console.error("Resend staff email exception:", err);
    }

    const clientResult = await sendClientBriefingConfirmation(resend, {
      to: verifiedEmail,
      contactPerson,
      companyName,
      orderNumber,
      locale,
    });
    clientEmailStatus = clientResult.ok ? "sent" : "failed";
    if (!clientResult.ok) {
      console.error("Resend client confirmation error:", clientResult.error);
    }
  } else {
    console.error("RESEND_API_KEY missing — briefing emails skipped");
  }

  const { error: staffLogError } = await supabase.from("email_logs").insert({
    order_id: order.id,
    template_key: "briefing_notification",
    status: staffEmailStatus,
    payload: {
      to,
      companyName,
      orderNumber,
      uploadCount: uploadPaths.length,
      checkoutSessionId: paid.access.checkoutSessionId,
    },
  });

  if (staffLogError) {
    console.error("Supabase email_log insert error:", staffLogError);
  }

  const { error: clientLogError } = await supabase.from("email_logs").insert({
    order_id: order.id,
    template_key: "briefing_confirmation_client",
    status: clientEmailStatus,
    payload: {
      to: verifiedEmail,
      companyName,
      orderNumber,
      locale,
    },
  });

  if (clientLogError) {
    console.error("Supabase client email_log insert error:", clientLogError);
  }

  return { ok: true, orderNumber: order.order_number ?? undefined };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
