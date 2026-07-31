import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { startHref } from "@/lib/i18n/path";

export default async function ContactRedirectPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  redirect(startHref(locale, getDictionary(locale)));
}
