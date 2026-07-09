import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import {
  ContentSections,
  type ContentSection,
} from "@/components/marketing/content-sections";

export const metadata: Metadata = {
  title: "Returns & Reprints — EnterPrint",
  description:
    "EnterPrint's returns and reprint policy for custom print orders: what's covered, how to request a reprint, and how refunds work.",
};

const sections: ContentSection[] = [
  {
    heading: "Our quality guarantee",
    paragraphs: [
      "Because print is produced to your exact specifications, most items are custom-made and can't be resold. That's why our policy centers on getting your order right rather than on general returns. If your order arrives damaged, defective, or not matching your approved proof, we'll make it right.",
    ],
  },
  {
    heading: "What's covered",
    bullets: [
      "Items damaged in transit",
      "Manufacturing or print defects (misprints, colour errors, finishing faults)",
      "Orders that don't match the proof you approved",
      "Incorrect items or quantities shipped",
    ],
  },
  {
    heading: "What's not covered",
    bullets: [
      "Errors in artwork you supplied and approved (typos, low-resolution images)",
      "Colour variation within normal printing tolerances",
      "Change of mind after a proof has been approved",
      "Damage caused after delivery",
    ],
  },
  {
    heading: "How to request a reprint or refund",
    paragraphs: [
      "Contact us within 7 days of delivery with your order number and clear photos of the issue. Our team will review and, where the issue is covered, arrange a free reprint or a refund — whichever you prefer.",
    ],
  },
];

export default function ReturnsPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Returns & reprints"
        description="We stand behind every order. Here's exactly what's covered and how to get a problem sorted quickly."
      />
      <ContentSections
        sections={sections}
        footnote="This policy applies to standard orders. Bulk and corporate agreements may include specific terms outlined in your order confirmation."
      />
    </>
  );
}
