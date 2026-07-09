// app/products/[slug]/page.tsx  (or wherever this file lives)
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Star, Check, ChevronRight } from "lucide-react"
import { getProduct, getCategory, products } from "@/lib/data"
import { ProductCustomizer } from "@/components/product/product-customizer"
import { RelatedProducts } from "@/components/product/related-products"
import { Badge } from "@/components/ui/badge"

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: "Product not found — EnterPrint" }
  return {
    title: `${product.name} — EnterPrint`,
    description: product.tagline,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const category = getCategory(product.categorySlug)

  // No slice here anymore — pass the full related set, let the client
  // component decide how much to reveal.
  const related = products.filter(
    (p) => p.categorySlug === product.categorySlug && p.slug !== product.slug,
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {category && (
          <>
            <Link href={`/products?category=${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Overview */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
          <div className="relative aspect-square">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {product.popular && (
              <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground">Popular</Badge>
            )}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium text-foreground">{product.rating}</span>
            </span>
            <span className="text-muted-foreground">({product.reviews} reviews)</span>
          </div>
          <p className="mt-4 text-muted-foreground leading-relaxed">{product.description}</p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {product.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Customizer */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-foreground">Customize your order</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your specs and see live pricing as you go.
        </p>
        <div className="mt-6">
          <ProductCustomizer product={product} />
        </div>
      </section>

      {/* Related */}
      <RelatedProducts products={related} />
    </div>
  )
}