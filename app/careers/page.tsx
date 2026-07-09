import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart, TrendingUp, MapPin, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Careers — Join the EnterPrint Team",
  description:
    "Help us build Africa's world-class printing marketplace. Explore open roles across engineering, design, operations, and customer success at EnterPrint.",
};

const perks = [
  {
    icon: TrendingUp,
    title: "Growth & ownership",
    description:
      "Real responsibility from day one and the room to shape how we build.",
  },
  {
    icon: Heart,
    title: "Health & wellbeing",
    description:
      "Comprehensive health cover and a culture that respects your time off.",
  },
  {
    icon: Coffee,
    title: "Flexible work",
    description:
      "Hybrid schedules and flexible hours built around focus, not clock-watching.",
  },
  {
    icon: MapPin,
    title: "Local impact",
    description:
      "Help thousands of African businesses look and grow more professional.",
  },
];

const openings = [
  {
    role: "Senior Frontend Engineer",
    team: "Engineering",
    location: "Lagos / Remote",
    type: "Full-time",
  },
  {
    role: "Product Designer",
    team: "Design",
    location: "Lagos / Remote",
    type: "Full-time",
  },
  {
    role: "Production Operations Lead",
    team: "Operations",
    location: "Ibadan",
    type: "Full-time",
  },
  {
    role: "Customer Success Specialist",
    team: "Support",
    location: "Lagos",
    type: "Full-time",
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build the future of print with us."
        description="We're a small, ambitious team on a mission to make premium print accessible across Africa. If you like solving hard problems and shipping work you're proud of, we'd love to meet you."
      >
        <Button render={<Link href="#openings" />} size="lg">
          View open roles
        </Button>
      </PageHero>

      {/* Image */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-secondary">
          <Image
            src="/careers-team.png"
            alt="The EnterPrint team collaborating in the studio"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Perks */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl tracking-tight text-foreground">
              Why work here
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              We take care of our people so they can do their best work.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.title}
                  className="rounded-xl border border-border bg-background p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-medium text-foreground">
                    {perk.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {perk.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section
        id="openings"
        className="mx-auto max-w-4xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <h2 className="font-serif text-3xl tracking-tight text-foreground">
          Open positions
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Don&apos;t see a perfect fit? We&apos;re always glad to hear from great
          people — reach out anyway.
        </p>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {openings.map((job) => (
            <li
              key={job.role}
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-medium text-foreground">{job.role}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {job.team} · {job.location} · {job.type}
                </p>
              </div>
              <Button
                render={<Link href="/contact" />}
                variant="outline"
                size="sm"
                className="self-start sm:self-auto"
              >
                Apply
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
