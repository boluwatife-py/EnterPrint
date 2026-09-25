import Link from "next/link";
import { FileQuestion, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
      {/* Visual illustration / icon fallback */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-accent">
        <FileQuestion className="h-10 w-10" />
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-accent">
        404 Error
      </p>

      <h1 className="mt-2 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Page not found
      </h1>

      <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground">
        Sorry, we couldn’t find the page you’re looking for. It might have been
        moved, deleted, or the link might be broken.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button render={<Link href="/" />} size="lg" className="h-12 px-6">
          Go Back Home
        </Button>

        <Button
          render={<Link href="/products" />}
          variant="secondary"
          size="lg"
          className="h-12 px-6"
        >
          Browse Products
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Helpful Quick Links Grid */}
      <div className="mt-16 border-t border-border pt-12 w-full max-w-xl">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Popular printing categories
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 text-left sm:grid-cols-3">
          <Link
            href="/products?q=Boxes"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Custom Packaging & Boxes
          </Link>
          <Link
            href="/products?q=Business%20Cards"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Business Cards
          </Link>
          <Link
            href="/products?q=Labels"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Stickers & Labels
          </Link>
          <Link
            href="/products?q=Banners"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Banners & Signage
          </Link>
          <Link
            href="/design-request"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Design Studio Brief
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
