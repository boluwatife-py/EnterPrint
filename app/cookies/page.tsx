import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import {
  ContentSections,
  type ContentSection,
} from "@/components/marketing/content-sections";

export const metadata: Metadata = {
  title: "Cookie Policy — EnterPrint",
  description:
    "How and why EnterPrint uses cookies and similar technologies, and how you can manage your preferences.",
};

const sections: ContentSection[] = [
  {
    heading: "What are cookies?",
    paragraphs: [
      "Cookies are small text files stored on your device when you visit a website. They help sites remember your actions and preferences so you don't have to re-enter them each time.",
    ],
  },
  {
    heading: "How we use cookies",
    bullets: [
      "Essential cookies that keep you signed in and your cart working",
      "Preference cookies that remember settings like your saved details",
      "Analytics cookies that help us understand how the site is used",
      "Marketing cookies that measure the performance of our campaigns",
    ],
  },
  {
    heading: "Managing cookies",
    paragraphs: [
      "You can control and delete cookies through your browser settings. Blocking essential cookies may affect core features such as staying signed in or completing checkout.",
    ],
  },
  {
    heading: "Third-party cookies",
    paragraphs: [
      "Some cookies are set by trusted third parties, such as analytics and payment providers, to deliver their services. These are governed by the respective provider's privacy policies.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookie policy"
        description="How we use cookies to keep EnterPrint working smoothly and how you can manage them."
      />
      <ContentSections
        sections={sections}
        footnote="Last updated: January 2026. For more detail on how we handle your data, see our Privacy Policy."
      />
    </>
  );
}
