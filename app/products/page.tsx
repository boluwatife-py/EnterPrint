import type { Metadata } from "next"
import { CatalogBrowser } from "@/components/product/catalog-browser"

export const metadata: Metadata = {
  title: "Products — EnterPrint",
  description:
    "Browse packaging, labels, business cards, flyers, banners, and branded merch. Customize and order online.",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-accent">Product Catalog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
          Everything you print, in one place
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Explore packaging, print, and branded merch. Configure your specs, see live pricing, and order in
          minutes.
        </p>
      </header>

      <div className="mt-8">
        <CatalogBrowser initialCategory={category} />
      </div>
    </div>
  )
}
