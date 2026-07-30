import type { Metadata } from "next";
import { Fraunces, Montserrat } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { JsonLd } from "@/components/json-ld";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jewebsiteonline.be"),
  title: {
    default: "jewebsiteonline.be | Professionele websites voor KMO's",
    template: "%s | jewebsiteonline.be",
  },
  description:
    "Wij bouwen professionele websites van 1 tot 3 pagina's voor Belgische KMO's. Gratis preview binnen 48 uur, live binnen een dag na goedkeuring. SEO-vriendelijk en vanaf €199.",
  keywords: [
    "website laten maken",
    "KMO website",
    "website België",
    "1 pagina website",
    "goedkope website",
    "website Nederland",
  ],
  openGraph: {
    type: "website",
    locale: "nl_BE",
    url: "https://jewebsiteonline.be",
    siteName: "jewebsiteonline.be",
    title: "jewebsiteonline.be | Professionele websites voor KMO's",
    description:
      "Razendsnel online met een website die écht klanten oplevert. Gratis preview binnen 48 uur, live binnen een dag na goedkeuring. Vanaf €199.",
  },
  twitter: {
    card: "summary_large_image",
    title: "jewebsiteonline.be | Professionele websites voor KMO's",
    description:
      "Razendsnel online met een website die écht klanten oplevert. Gratis preview binnen 48 uur, live binnen een dag na goedkeuring. Vanaf €199.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://jewebsiteonline.be",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl-BE"
      className={`${fraunces.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-forest font-sans">
        <JsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
