import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { DesignCta } from "@/components/home/design-cta";
import { ProductCard } from "@/components/product/product-card";
import { getPopularProducts } from "@/lib/data";

export default function HomePage() {
  const popular = getPopularProducts();

  return (
    <>
      <Hero />
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Popular Produts
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              See all products
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {popular.map((product) => (
              <ProductCard key={product.id} product={product} show_badge={false} />
            ))}
          </div>
        </div>
      </section>
      <CategoryGrid />

      <HowItWorks />
      <DesignCta />
    </>
  );
}
