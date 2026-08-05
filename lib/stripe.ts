import Stripe from "stripe";
import type { Locale } from "@/lib/i18n/config";

export type PricingPackageId = "one-page" | "three-page";
export type OrderPackageId = "1-pagina" | "3-pagina";

const PRICE_BY_PACKAGE: Record<PricingPackageId, string | undefined> = {
  "one-page": process.env.STRIPE_PRICE_1_PAGE,
  "three-page": process.env.STRIPE_PRICE_3_PAGE,
};

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, {
    apiVersion: "2026-07-29.dahlia",
    typescript: true,
  });
}

export function pricingToOrderPackage(
  packageId: PricingPackageId,
): OrderPackageId {
  return packageId === "three-page" ? "3-pagina" : "1-pagina";
}

export function orderToPricingPackage(
  packageId: OrderPackageId,
): PricingPackageId {
  return packageId === "3-pagina" ? "three-page" : "one-page";
}

export function priceIdForPackage(packageId: PricingPackageId): string {
  const priceId = PRICE_BY_PACKAGE[packageId];
  if (!priceId) {
    throw new Error(`Missing Stripe price ID for package ${packageId}`);
  }
  return priceId;
}

export function isPricingPackageId(value: string): value is PricingPackageId {
  return value === "one-page" || value === "three-page";
}

export function isOrderPackageId(value: string): value is OrderPackageId {
  return value === "1-pagina" || value === "3-pagina";
}

export function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.jewebsiteonline.com"
  );
}

export function briefingSuccessPath(locale: Locale) {
  return locale === "en" ? "/en/start-now" : "/nl/start-nu";
}

export function pricingCancelPath(locale: Locale) {
  return locale === "en" ? "/en/pricing" : "/nl/prijzen";
}

export function makeFormReferenceId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JW-PAY-${stamp}${rand}`.slice(0, 20);
}
