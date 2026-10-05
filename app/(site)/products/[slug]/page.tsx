import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Check, ChevronRight } from "lucide-react";

import {
  getProduct,
  listProducts,
  findCategory,
  getProductsByCategory,
  listCategories,
} from "@/lib/api/catalog-api";

import { ProductCustomizer } from "@/components/product/product-customizer";
import { RelatedProducts } from "@/components/product/related-products";
import { ProductImageGallery } from "@/components/product/product-image-gallery"; // <-- Import gallery
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  return {
    title: `${product.name} - EnterPrint`,
    description: product.tagline ?? product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  const categories = await listCategories();
  const category = findCategory(categories, product.categorySlug);

  const related = (await getProductsByCategory(product.categorySlug)).filter(
    (p) => p.slug !== product.slug,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {category && (
          <>
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-foreground"
            >
              {category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Overview */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Interactive Image Gallery */}
        <ProductImageGallery
          images={product.images}
          fallbackImage={product.image}
          productName={product.name}
          popular={product.popular}
        />

        <div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            {product.name}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {product.features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Customizer */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-foreground">
          Customize your order
        </h2>
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
  );
}
