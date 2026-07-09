import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

const quickLinks = ["Boxes", "Business Cards", "Labels", "Banners", "Stickers"]

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        {/* ---------- Copy + functional search ---------- */}
        <div className="flex flex-col items-start">
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Quality packaging.
            <br />
            Quality prints.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Ordered online, shipped to your doorstep.
          </p>

          <label className="mt-8 w-full max-w-lg">
            <span className="mb-2 block text-sm font-medium text-foreground">
              What would you like to order today?
            </span>
            <div className="flex items-center gap-2 border border-border bg-background px-4 py-3.5 focus-within:ring-2 focus-within:ring-accent">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for boxes, business cards, labels, banners…"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button size="sm" className="h-8 shrink-0 px-4">
                Search
              </Button>
            </div>
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickLinks.map((label) => (
              <Link
                key={label}
                href={`/products?q=${encodeURIComponent(label)}`}
                className="border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ---------- Visual ---------- */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-3/2 overflow-hidden border border-border bg-secondary">
            <Image
              src="/hero-packaging.png"
              alt="Custom packaging box and business card produced on EnterPrint"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* square product mockup, flush overlap, no rotation */}
          <div className="absolute -bottom-6 left-6 w-44 border border-border bg-foreground p-4 text-background shadow-md sm:w-52">
            <p className="font-serif text-lg font-semibold">EnterPrint</p>
            <p className="mt-2 text-[11px] leading-snug text-background/70">
              Job #EP-0241
              <br />
              Ready for delivery
              <br />
              Ibadan, Nigeria
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}