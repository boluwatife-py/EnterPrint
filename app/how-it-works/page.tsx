import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Sliders,
  Upload,
  CreditCard,
  Factory,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "How It Works — Ordering Print with EnterPrint",
  description:
    "From choosing a product to delivery at your door, see how easy it is to order custom packaging and print on EnterPrint in six simple steps.",
};

const steps = [
  {
    icon: Search,
    title: "Choose a product",
    description:
      "Browse boxes, labels, business cards, banners, and branded merch. Filter by category to find exactly what you need.",
  },
  {
    icon: Sliders,
    title: "Customize it",
    description:
      "Pick size, material, finish, and quantity. Live pricing updates as you configure, so there are never any surprises.",
  },
  {
    icon: Upload,
    title: "Add your artwork",
    description:
      "Upload your own design or hire a vetted designer from our marketplace to create something from scratch.",
  },
  {
    icon: CreditCard,
    title: "Place your order",
    description:
      "Review your configuration, approve the proof, and check out securely. Save details for faster reorders later.",
  },
  {
    icon: Factory,
    title: "We produce it",
    description:
      "Your order enters production. Track every stage — prepress, printing, finishing — right from your dashboard.",
  },
  {
    icon: Truck,
    title: "Delivered to you",
    description:
      "We handle nationwide and global delivery, with tracking so you always know where your order is.",
  },
];

const faqs = [
  {
    q: "How long does an order take?",
    a: "Most standard products are produced within 3–5 business days, plus delivery time. Custom and bulk orders may take longer — the estimate is always shown before checkout.",
  },
  {
    q: "Can I get a proof before printing?",
    a: "Yes. For most products you'll approve a digital proof before we begin production, so you can catch anything before it goes to print.",
  },
  {
    q: "What if I don't have a design?",
    a: "You can hire a vetted designer directly through our marketplace, or start from one of our templates. No design experience required.",
  },
  {
    q: "Do you offer bulk or corporate pricing?",
    a: "Absolutely. Quantity tiers unlock automatically as you increase volume, and our team can put together custom quotes for large orders.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From idea to delivery in six simple steps."
        description="We've stripped the friction out of ordering print. Here's exactly what happens from the moment you land on a product to the day it arrives."
      >
        <Button render={<Link href="/products" />} size="lg">
          Start an order
        </Button>
      </PageHero>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative rounded-xl border border-border bg-card p-6"
              >
                <span className="absolute right-5 top-5 font-serif text-2xl text-border">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-5">
                <h3 className="font-medium text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button render={<Link href="/products" />} size="lg">
              Browse products
            </Button>
            <Button
              render={<Link href="/contact" />}
              size="lg"
              variant="outline"
            >
              Still have questions?
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
