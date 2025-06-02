import { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { ValuePropositionSection } from "@/components/landing/value-proposition-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FAQ } from "@/components/landing/faq";
import { SITE_NAME, SITE_DESCRIPTION } from "@/constants";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <ValuePropositionSection />
      <HowItWorksSection />
      <CtaSection />
      <FAQ />
    </main>
  );
}
