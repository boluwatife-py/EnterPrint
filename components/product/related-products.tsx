// components/product/related-products.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { Product } from "@/lib/data";

const PAGE_SIZE = 4;

export function RelatedProducts({ products }: { products: Product[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  if (products.length === 0) return null;

  const visible = products.slice(0, visibleCount);
  const remaining = products.length - visibleCount;
  const hasMore = remaining > 0;

  function handleLoadMore() {
    setLoading(true);
    // Related products already live in memory (no real API here), so this delay
    // is only for a believable loading state. Swap the setTimeout body for a real
    // await fetch(...) if related products ever move behind an endpoint.
    setTimeout(() => {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, products.length));
      setLoading(false);
    }, 300);
  }

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="text-xl font-bold text-foreground">You might also like</h2>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {visible.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-secondary">
              <Image
                src={p.image || "/placeholder.svg"}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-foreground">{p.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              `Load more (${remaining} more)`
            )}
          </button>
        </div>
      )}
    </section>
  );
}
