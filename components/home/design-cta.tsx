import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const points = [
  "Dedicated designer for your brand",
  "Unlimited revisions until approved",
  "Print-ready files, guaranteed",
]

export function DesignCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="overflow-hidden rounded-3xl border border-border bg-primary text-primary-foreground">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-14">
            <span className="inline-flex rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium">
              Design Studio
            </span>
            <h2 className="mt-5 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              No artwork? Our designers have you covered.
            </h2>
            <p className="mt-4 max-w-md text-pretty leading-relaxed text-primary-foreground/80">
              Share a simple brief and our in-house design team will craft print-ready artwork that makes your brand
              look world-class.
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Button
              render={<Link href="/design-request" />}
              size="lg"
              variant="secondary"
              className="mt-8 h-12 px-6"
            >
              Request a Design
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="relative h-64 lg:h-full lg:min-h-[420px]">
            <Image
              src="/design-studio.png"
              alt="A designer creating packaging artwork on a computer"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
