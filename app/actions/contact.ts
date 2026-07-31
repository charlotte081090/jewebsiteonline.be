"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
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

  const headerList = await headers();
  const ip = clientIp(headerList);

  const ipLimit = rateLimit(`briefing:ip:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!ipLimit.ok) {
    return {
      ok: false,
      error:
        "Te veel aanvragen vanaf dit netwerk. Probeer later opnieuw of mail info@jewebsiteonline.be.",
    };
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
  const logo = formData.get("logo");
  const images = formData.getAll("images");

  if (
    !contactPerson ||
    !companyName ||
    !email ||
    !phone ||
    !openingHours ||
    !sector ||
    !businessInfo ||
    !packageChoice ||
    !hasLogo
  ) {
    return { ok: false, error: "Gelieve alle verplichte velden in te vullen." };
  }

  if (privacyConsent !== "ja") {
    return {
      ok: false,
      error: "Bevestig dat u akkoord gaat met het privacybeleid.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Ongeldig e-mailadres." };
  }

  if (!ALLOWED_PACKAGES.has(packageChoice)) {
    return { ok: false, error: "Ongeldig pakket." };
  }

  if (!ALLOWED_YES_NO.has(hasLogo)) {
    return { ok: false, error: "Gelieve aan te geven of u een logo heeft." };
  }

  if (showPhone && !ALLOWED_YES_NO.has(showPhone)) {
    return { ok: false, error: "Ongeldige keuze voor telefoon tonen." };
  }

  if (showAddress && !ALLOWED_YES_NO.has(showAddress)) {
    return { ok: false, error: "Ongeldige keuze voor adres tonen." };
  }

  const emailLimit = rateLimit(`briefing:email:${email.toLowerCase()}`, {
    limit: 3,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!emailLimit.ok) {
    return {
      ok: false,
      error:
        "Er is al een recente aanvraag met dit e-mailadres. Mail ons op info@jewebsiteonline.be als u hulp nodig heeft.",
    };
  }

  if (images.length > MAX_IMAGES) {
    return { ok: false, error: `Upload max. ${MAX_IMAGES} beelden.` };
  }

  const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
  if (hasLogo === "ja" && !logoFile) {
    return { ok: false, error: "Upload uw logo om verder te gaan." };
  }
  if (logoFile && logoFile.size > MAX_FILE_BYTES) {
    return { ok: false, error: "Het logo mag max. 3 MB zijn." };
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
      return {
        ok: false,
        error: "Logo: enkel JPG, PNG, WebP of PDF toegestaan.",
      };
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
    if (entry.size > MAX_FILE_BYTES) {
      return {
        ok: false,
        error: `“${entry.name || "beeld"}” mag max. 3 MB zijn.`,
      };
    }
    const buffer = Buffer.from(await entry.arrayBuffer());
    const kind = detectFileKind(buffer);
    if (!kind || !isAllowedGalleryKind(kind)) {
      return {
        ok: false,
        error: `“${entry.name || "beeld"}”: enkel JPG, PNG, WebP of GIF.`,
      };
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
    return {
      ok: false,
      error:
        "Opslaan is tijdelijk niet beschikbaar. Mail ons op info@jewebsiteonline.be.",
    };
  }

  const answers: QaAnswer[] = [
    { question: "Contactpersoon", answer: contactPerson },
    { question: "Bedrijfsnaam", answer: companyName },
    { question: "E-mail", answer: email },
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
    { question: "Pakket", answer: packageChoice },
    { question: "Pagina's", answer: selectedPages || "Niet opgegeven" },
    { question: "Logo", answer: hasLogo === "ja" ? "Ja" : "Nee" },
    { question: "Brandingnotities", answer: brandNotes || "Niet opgegeven" },
    {
      question: "Privacytoestemming",
      answer: privacyConsent === "ja" ? "Ja" : "Nee",
    },
  ];

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      status: "new",
      contact_name: contactPerson,
      contact_email: email,
      contact_phone: phone,
      answers,
      notes: `${companyName} | ${packageChoice} | ${sector}`,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Supabase order insert error:", orderError);
    return {
      ok: false,
      error:
        "Opslaan mislukt. Probeer opnieuw of mail info@jewebsiteonline.be.",
    };
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
    title: `Gratis preview maken: ${companyName}`,
    description: `Nieuwe briefing via jewebsiteonline.be. Pakket: ${packageChoice}.`,
    status: "todo",
    priority: "high",
    task_type: "follow_up",
  });

  if (taskError) {
    console.error("Supabase task insert error:", taskError);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? "info@jewebsiteonline.be";
  const from =
    process.env.CONTACT_FROM ?? "jewebsiteonline.be <onboarding@resend.dev>";

  let emailStatus = "skipped";

  if (apiKey) {
    const resend = new Resend(apiKey);
    const html = `
      <h2>Nieuwe preview-aanvraag ${escapeHtml(order.order_number ?? "")}</h2>
      <p><strong>Order:</strong> ${escapeHtml(order.order_number ?? order.id)}</p>
      <h3>Contactgegevens</h3>
      <p><strong>Contactpersoon:</strong> ${escapeHtml(contactPerson)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
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
      <p><strong>Pakket:</strong> ${escapeHtml(packageChoice)}</p>
      <p><strong>Pagina's:</strong> ${escapeHtml(selectedPages || "Niet opgegeven")}</p>
      <p><strong>Logo:</strong> ${escapeHtml(hasLogo === "ja" ? "Ja" : "Nee")}</p>
      <p><strong>Brandingnotities:</strong><br/>${escapeHtml(brandNotes || "Niet opgegeven").replace(/\n/g, "<br/>")}</p>
      <p><strong>Privacytoestemming:</strong> ${escapeHtml(privacyConsent === "ja" ? "Ja" : "Nee")}</p>
      <p><strong>Uploads in Storage:</strong> ${escapeHtml(String(uploadPaths.length))}</p>
    `;

    const text = [
      `Nieuwe preview-aanvraag ${order.order_number ?? ""}`,
      `Order: ${order.order_number ?? order.id}`,
      "",
      `Contactpersoon: ${contactPerson}`,
      `E-mail: ${email}`,
      `Telefoon: ${phone}`,
      `Bedrijf: ${companyName}`,
      `Sector: ${sector}`,
      `Pakket: ${packageChoice}`,
      `Pagina's: ${selectedPages || "Niet opgegeven"}`,
    ].join("\n");

    try {
      const { error } = await resend.emails.send({
        from,
        to: [to],
        replyTo: email,
        subject: `Preview-aanvraag ${order.order_number ?? ""}: ${companyName}`,
        html,
        text,
        attachments: emailAttachments.length ? emailAttachments : undefined,
      });

      emailStatus = error ? "failed" : "sent";
      if (error) console.error("Resend error:", error);
    } catch (err) {
      emailStatus = "failed";
      console.error("Resend exception:", err);
    }
  }

  const { error: logError } = await supabase.from("email_logs").insert({
    order_id: order.id,
    template_key: "briefing_notification",
    status: emailStatus,
    payload: {
      to,
      companyName,
      orderNumber: order.order_number,
      uploadCount: uploadPaths.length,
    },
  });

  if (logError) {
    console.error("Supabase email_log insert error:", logError);
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
