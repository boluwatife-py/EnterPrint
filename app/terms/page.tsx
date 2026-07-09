import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import {
  ContentSections,
  type ContentSection,
} from "@/components/marketing/content-sections";

export const metadata: Metadata = {
  title: "Terms of Service — EnterPrint",
  description:
    "The terms and conditions governing your use of the EnterPrint printing marketplace and services.",
};

const sections: ContentSection[] = [
  {
    heading: "Acceptance of terms",
    paragraphs: [
      "By accessing or using EnterPrint, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
    ],
  },
  {
    heading: "Your account",
    paragraphs: [
      "You are responsible for keeping your account credentials secure and for all activity that occurs under your account. Please provide accurate information and keep it up to date.",
    ],
  },
  {
    heading: "Orders & proofs",
    bullets: [
      "Orders are produced to the specifications and artwork you approve",
      "You are responsible for reviewing and approving proofs before production",
      "We are not liable for errors present in artwork you supplied and approved",
      "Estimated timelines are provided in good faith and may vary",
    ],
  },
  {
    heading: "Intellectual property",
    paragraphs: [
      "You retain ownership of the artwork and content you upload, and you confirm you have the rights to use it. EnterPrint's own branding, website, and content remain our property and may not be used without permission.",
    ],
  },
  {
    heading: "Payments",
    paragraphs: [
      "Prices are shown before checkout and may change over time. Payment is required before production begins unless otherwise agreed in a corporate arrangement.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the extent permitted by law, EnterPrint's liability for any order is limited to the amount you paid for that order. We are not liable for indirect or consequential losses.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. Continued use of EnterPrint after changes take effect constitutes acceptance of the revised terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of service"
        description="The ground rules for using EnterPrint. Please read them carefully."
      />
      <ContentSections
        sections={sections}
        footnote="Last updated: January 2026. For questions about these terms, contact legal@enterprint.com."
      />
    </>
  );
}
