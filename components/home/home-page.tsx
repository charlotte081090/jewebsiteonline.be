import { Hero } from "@/components/home/hero";
import { Usps } from "@/components/home/usps";
import { Showcase } from "@/components/home/showcase";
import { Problem } from "@/components/home/problem";
import { HowItWorks } from "@/components/home/how-it-works";
import { Pricing } from "@/components/home/pricing";
import { ProductFit } from "@/components/home/product-fit";
import { Reviews } from "@/components/home/reviews";

export function HomePage() {
  return (
    <>
      <Hero />
      <Usps />
      <Showcase />
      <Problem />
      <HowItWorks />
      <Pricing />
      <ProductFit />
      <Reviews />
    </>
  );
}
