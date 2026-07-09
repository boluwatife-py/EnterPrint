import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Recycle, Factory, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Sustainability — EnterPrint's Commitment to Responsible Print",
  description:
    "How EnterPrint reduces waste with recycled materials, FSC-certified paper, eco-friendly inks, and responsible production practices.",
};

const commitments = [
  {
    icon: Recycle,
    title: "Recycled & recyclable materials",
    description:
      "Our kraft and cardboard packaging is made from recycled content and is fully recyclable at end of life.",
  },
  {
    icon: Leaf,
    title: "FSC-certified paper",
    description:
      "We prioritize paper stock sourced from responsibly managed forests certified by the Forest Stewardship Council.",
  },
  {
    icon: Factory,
    title: "Water-based inks",
    description:
      "Where possible we use water-based and soy inks that reduce harmful volatile compounds compared to solvent inks.",
  },
  {
    icon: PackageCheck,
    title: "Print-on-demand",
    description:
      "Producing to order means less overproduction, less inventory waste, and fewer materials sent to landfill.",
  },
];

export default function SustainabilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Sustainability"
        title="Print responsibly, without cutting corners."
        description="Beautiful packaging and a healthy planet aren't mutually exclusive. We're building sustainability into every stage of production — from the materials we source to the way we ship."
      />

      {/* Image + intro */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-serif text-3xl tracking-tight text-foreground">
              Our approach
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Printing has an environmental footprint — we won&apos;t pretend
              otherwise. What we can do is make deliberate choices that reduce
              that impact: smarter materials, cleaner inks, and a
              produce-to-order model that avoids waste.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We&apos;re on a continuous journey, and we&apos;re transparent
              about where we are. These are the commitments we hold ourselves to
              today, with more to come.
            </p>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-secondary">
            <Image
              src="/sustainability-eco.png"
              alt="Eco-friendly kraft paper packaging and recycled materials"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl tracking-tight text-foreground">
              Our commitments
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Practical steps we take on every order we can.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {commitments.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-xl border border-border bg-background p-6"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <h2 className="text-balance font-serif text-3xl tracking-tight text-foreground">
          Want eco-friendly options for your order?
        </h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">
          Look for recycled and FSC-certified material options when customizing
          your product, or reach out and we&apos;ll help you choose.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/products" />} size="lg">
            Shop products
          </Button>
          <Button render={<Link href="/contact" />} size="lg" variant="outline">
            Talk to our team
          </Button>
        </div>
      </section>
    </>
  );
}
