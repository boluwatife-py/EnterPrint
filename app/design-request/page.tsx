import type { Metadata } from "next"
import Image from "next/image"
import { Check } from "lucide-react"
import { DesignRequestForm } from "@/components/design/design-request-form"

export const metadata: Metadata = {
  title: "Request a Design — EnterPrint",
  description:
    "No artwork? Our in-house design team will craft print-ready artwork that makes your brand look world-class.",
}

const benefits = [
  "Dedicated designer assigned to your brand",
  "Unlimited revisions until you're satisfied",
  "Print-ready files, guaranteed",
  "Fast 24-hour first response",
]

export default function DesignRequestPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="lg:sticky lg:top-24">
          <p className="text-sm font-medium text-accent">Design Studio</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            No artwork? Our designers have you covered.
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Share a simple brief and our in-house design team will craft print-ready artwork tailored to
            your brand. From packaging to full brand identity, we make it look world-class.
          </p>

          <ul className="mt-6 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15">
                  <Check className="h-3.5 w-3.5 text-accent" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <div className="relative aspect-16/10">
              <Image
                src="/design-studio.png"
                alt="EnterPrint designer creating packaging artwork"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <DesignRequestForm />
      </div>
    </div>
  )
}
