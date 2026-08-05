"use server";

import type Stripe from "stripe";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import {
  briefingSuccessPath,
  getStripe,
  isPricingPackageId,
  makeFormReferenceId,
  priceIdForPackage,
  pricingCancelPath,
  pricingToOrderPackage,
  siteBaseUrl,
  type PricingPackageId,
} from "@/lib/stripe";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function createCheckoutSession(input: {
  packageId: string;
  locale: string;
}): Promise<CheckoutResult> {
  const locale: Locale = isLocale(input.locale) ? input.locale : defaultLocale;

  if (!isPricingPackageId(input.packageId)) {
    return {
      ok: false,
      error:
        locale === "en"
          ? "Invalid package selected."
          : "Ongeldig pakket geselecteerd.",
    };
  }

  const packageId = input.packageId as PricingPackageId;
  const orderPackage = pricingToOrderPackage(packageId);
  const formReferenceId = makeFormReferenceId();
  const base = siteBaseUrl();

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceIdForPackage(packageId), quantity: 1 }],
      success_url: `${base}${briefingSuccessPath(locale)}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${pricingCancelPath(locale)}`,
      locale: locale === "nl" ? "nl" : "en",
      billing_address_collection: "auto",
      customer_creation: "if_required",
      // Account has Managed Payments on by default; our packages aren't set up
      // with eligible product tax codes yet, so use standard Checkout.
      managed_payments: {
        enabled: false,
      },
      metadata: {
        package: orderPackage,
        pricing_package: packageId,
        locale,
        form_reference_id: formReferenceId,
      },
      payment_intent_data: {
        metadata: {
          package: orderPackage,
          form_reference_id: formReferenceId,
        },
      },
    } as Parameters<Stripe["checkout"]["sessions"]["create"]>[0]);

    if (!session.url) {
      return {
        ok: false,
        error:
          locale === "en"
            ? "Could not start checkout. Please try again."
            : "Checkout starten mislukt. Probeer opnieuw.",
      };
    }

    return { ok: true, url: session.url };
  } catch (err) {
    console.error("createCheckoutSession failed:", err);
    return {
      ok: false,
      error:
        locale === "en"
          ? "Payment could not be started. Please try again or email info@jewebsiteonline.com."
          : "Betaling kon niet gestart worden. Probeer opnieuw of mail info@jewebsiteonline.com.",
    };
  }
}
