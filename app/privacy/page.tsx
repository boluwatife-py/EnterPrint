import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import {
  ContentSections,
  type ContentSection,
} from "@/components/marketing/content-sections";

export const metadata: Metadata = {
  title: "Privacy Policy — EnterPrint",
  description:
    "How EnterPrint collects, uses, and protects your personal information when you use our printing marketplace.",
};

const sections: ContentSection[] = [
  {
    heading: "Overview",
    paragraphs: [
      "This Privacy Policy explains how EnterPrint collects, uses, and safeguards your information when you use our website and services. By using EnterPrint, you agree to the practices described here.",
    ],
  },
  {
    heading: "Information we collect",
    bullets: [
      "Account details such as your name, email, and phone number",
      "Order information including products, artwork files, and delivery addresses",
      "Payment information, processed securely by our payment partners",
      "Usage data such as pages visited and features used, to improve our service",
    ],
  },
  {
    heading: "How we use your information",
    bullets: [
      "To process and fulfil your orders",
      "To communicate order updates and respond to support requests",
      "To improve our products, pricing, and overall experience",
      "To send service or marketing messages, which you can opt out of at any time",
    ],
  },
  {
    heading: "How we share information",
    paragraphs: [
      "We do not sell your personal data. We share information only with the partners needed to run our service — such as payment processors, production facilities, and delivery providers — and only to the extent required to fulfil your order or comply with the law.",
    ],
  },
  {
    heading: "Data security",
    paragraphs: [
      "We use industry-standard measures to protect your information, including encryption in transit and restricted internal access. No method of transmission is completely secure, but we work continuously to protect your data.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You can access, correct, or request deletion of your personal information at any time by contacting us. You may also opt out of marketing communications using the unsubscribe link in our emails.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: [
      "Questions about this policy or your data? Email privacy@enterprint.com and we'll be glad to help.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        description="Your privacy matters to us. This policy explains what we collect and how we use it."
      />
      <ContentSections
        sections={sections}
        footnote="Last updated: January 2026. We may update this policy from time to time; material changes will be communicated on this page."
      />
    </>
  );
}
