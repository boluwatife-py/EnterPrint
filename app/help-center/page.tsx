import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  Truck,
  RotateCcw,
  Palette,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Help Center — EnterPrint Support",
  description:
    "Find answers about ordering, customization, delivery, returns, and design. Browse EnterPrint's help topics or get in touch with our support team.",
};

const topics = [
  {
    icon: Package,
    title: "Ordering & customization",
    description: "Configuring products, proofs, quantities, and reorders.",
    href: "/how-it-works",
  },
  {
    icon: Truck,
    title: "Delivery & tracking",
    description: "Timelines, coverage, costs, and how to track an order.",
    href: "/delivery-info",
  },
  {
    icon: RotateCcw,
    title: "Returns & reprints",
    description: "What's covered, how to request a reprint, and refunds.",
    href: "/returns",
  },
  {
    icon: Palette,
    title: "Design guidelines",
    description: "File formats, bleed, resolution, and artwork setup.",
    href: "/design-guidelines",
  },
  {
    icon: CreditCard,
    title: "Payments & pricing",
    description: "Accepted methods, bulk pricing, and invoices.",
    href: "/contact",
  },
  {
    icon: MessageCircle,
    title: "Track an order",
    description: "Check the live production and delivery status.",
    href: "/track-order",
  },
];

export default function HelpCenterPage() {
  return (
    <>
      <PageHero
        eyebrow="Help center"
        title="How can we help?"
        description="Browse common topics below, track an existing order, or reach out to our team directly — we typically reply within a few hours."
      >
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/track-order" />} size="lg">
            Track an order
          </Button>
          <Button
            render={<Link href="/contact" />}
            size="lg"
            variant="outline"
          >
            Contact support
          </Button>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.title}
                href={topic.href}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-medium text-foreground">
                  {topic.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {topic.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">
            Still need a hand?
          </h2>
          <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">
            Our support team is available Monday to Saturday, 8am to 6pm. Send us
            a message and we&apos;ll get back to you quickly.
          </p>
          <Button
            render={<Link href="/contact" />}
            size="lg"
            className="mt-6"
          >
            Get in touch
          </Button>
        </div>
      </section>
    </>
  );
}
