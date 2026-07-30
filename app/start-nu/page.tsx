import type { Metadata } from "next";
import { BriefingForm } from "@/components/contact/briefing-form";

export const metadata: Metadata = {
  title: "Start nu · Gratis preview",
  description:
    "Vul in 10 tot 15 minuten de briefing in en ontvang binnen 48 uur een gratis websitepreview van jewebsiteonline.be.",
  alternates: {
    canonical: "https://jewebsiteonline.be/start-nu",
  },
};

export default function StartNuPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 88% 8%, rgba(192,127,99,0.14), transparent 55%), radial-gradient(ellipse 40% 35% at 8% 70%, rgba(27,48,34,0.05), transparent 50%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[calc(100svh-4.75rem)] max-w-6xl items-start px-5 py-14 md:items-center md:px-8 md:py-20">
        <BriefingForm />
      </div>
    </div>
  );
}
