import { Hero } from "@/components/home/hero";
import { Problem } from "@/components/home/problem";
import { HowItWorks } from "@/components/home/how-it-works";
import { Portfolio } from "@/components/home/portfolio";
import { Pricing } from "@/components/home/pricing";
import { Faq } from "@/components/home/faq";
import { Reviews } from "@/components/home/reviews";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Portfolio />
      <Pricing />
      <Faq />
      <Reviews />
    </>
  );
}
