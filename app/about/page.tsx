import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Target, Users, Globe2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "About EnterPrint — Our Story & Mission",
  description:
    "EnterPrint is Africa's world-class marketplace for packaging, branding, and commercial printing. Learn about our mission to make premium print accessible to every business.",
};

const stats = [
  { value: "12k+", label: "Orders delivered" },
  { value: "850+", label: "Businesses served" },
  { value: "40+", label: "Verified designers" },
  { value: "6", label: "Cities covered" },
];

const values = [
  {
    icon: Target,
    title: "Quality without compromise",
    description:
      "Every order passes a multi-stage quality check before it leaves production. If it isn't right, we reprint it.",
  },
  {
    icon: Users,
    title: "Built for businesses",
    description:
      "From solo founders to enterprise teams, our tools scale with you — reorders, bulk pricing, and dedicated support.",
  },
  {
    icon: Globe2,
    title: "Local roots, global standards",
    description:
      "We combine on-the-ground production across Africa with world-class materials and finishing.",
  },
  {
    icon: Sparkles,
    title: "Design-forward",
    description:
      "A curated marketplace of vetted designers helps you look professional, even without an in-house team.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Premium print, made accessible for every business."
        description="EnterPrint started with a simple frustration: ordering quality packaging and branded print in Africa was slow, opaque, and inconsistent. We set out to fix that with a modern marketplace that pairs trusted production with a delightful ordering experience."
      >
        <Button render={<Link href="/products" />} size="lg">
          Explore our products
        </Button>
      </PageHero>

      {/* Image + intro */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-secondary">
            <Image
              src="/about-team.png"
              alt="EnterPrint production team inspecting freshly printed packaging"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl tracking-tight text-foreground">
              Why we exist
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Great branding shouldn&apos;t be reserved for companies with big
              budgets and design departments. We believe every business — the
              corner bakery, the fast-growing startup, the established
              manufacturer — deserves packaging and print that looks the part.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              So we built EnterPrint: a single place to customize products,
              upload artwork or hire a designer, get transparent pricing, and
              track production all the way to delivery. No back-and-forth, no
              surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-4xl tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">
            What we stand for
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The principles that guide how we build products and serve customers.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-medium text-foreground">{value.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              Ready to bring your brand to life?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Browse our catalog or talk to our team about a custom project.
            </p>
          </div>
          <div className="flex gap-3">
            <Button render={<Link href="/products" />} size="lg">
              Start an order
            </Button>
            <Button
              render={<Link href="/contact" />}
              size="lg"
              variant="outline"
            >
              Contact us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
