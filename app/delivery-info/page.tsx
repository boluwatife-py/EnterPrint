import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import {
  ContentSections,
  type ContentSection,
} from "@/components/marketing/content-sections";

export const metadata: Metadata = {
  title: "Delivery Information — EnterPrint",
  description:
    "Everything about EnterPrint delivery: production timelines, nationwide and international coverage, shipping costs, and how to track your order.",
};

const sections: ContentSection[] = [
  {
    heading: "Production timelines",
    paragraphs: [
      "Delivery time is made up of two parts: production and shipping. Production begins once you approve your proof and your payment is confirmed.",
    ],
    bullets: [
      "Standard products: 3–5 business days in production",
      "Custom and large-format products: 5–8 business days",
      "Bulk and corporate orders: estimated per order at checkout",
    ],
  },
  {
    heading: "Delivery coverage",
    paragraphs: [
      "We deliver nationwide across Nigeria and to select international destinations. Available options and rates are calculated at checkout based on your address and order weight.",
    ],
    bullets: [
      "Nationwide delivery to all major cities and towns",
      "Same-city express available in Lagos and Ibadan",
      "International delivery to select countries",
    ],
  },
  {
    heading: "Shipping costs",
    paragraphs: [
      "Shipping is calculated at checkout so you always see the full cost before paying. Larger orders often qualify for reduced per-unit shipping, and we occasionally run free-delivery promotions.",
    ],
  },
  {
    heading: "Tracking your order",
    paragraphs: [
      "Every order can be tracked from your dashboard or the Track Order page. You'll see live updates as your order moves through prepress, printing, finishing, dispatch, and delivery.",
    ],
  },
];

export default function DeliveryInfoPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Delivery information"
        description="How long orders take, where we deliver, and how to keep track of your package every step of the way."
      />
      <ContentSections
        sections={sections}
        footnote="Delivery estimates are provided in good faith and may vary during peak periods or due to factors outside our control. For urgent orders, contact our team before ordering."
      />
    </>
  );
}
