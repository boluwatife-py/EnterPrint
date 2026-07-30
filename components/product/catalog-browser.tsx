"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import {
  listProducts,
  listCategories,
  type Product,
  type Category,
} from "@/lib/api/catalog-api";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 300;

function CatalogSkeleton() {
  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-11 w-full max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>

      <div className="mt-6 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-28 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-50 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export function CatalogBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  // Raw input vs. the debounced value that actually drives the API call.
  // Both are initialized from the `q` URL param so a shared/deep link works.
  const [queryInput, setQueryInput] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [initialLoading, setInitialLoading] = useState(true); // only true until the first fetch resolves
  const [isFetching, setIsFetching] = useState(false); // true during any subsequent refetch
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce the search box so we don't hit the API on every keystroke,
  // and keep the `q` URL param in sync so search is shareable/back-button-able.
  // NOTE: this only ever touches `query`/the URL — it never rewrites
  // `queryInput`, so the input's own value/cursor position is untouched.
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = queryInput.trim();
      setQuery(trimmed);

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      router.replace(`/products?${params.toString()}`, { scroll: false });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  // Categories are static-ish for the session, fetch once.
  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Re-fetch products from the server whenever category or debounced search changes.
  useEffect(() => {
    let cancelled = false;
    setIsFetching(true);

    listProducts({
      category: active === "all" ? undefined : active,
      search: query || undefined,
      page: 1,
      pageSize: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data);
        setTotal(res.total);
        setPage(1);
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (cancelled) return;
        setIsFetching(false);
        setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active, query]);

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await listProducts({
        category: active === "all" ? undefined : active,
        search: query || undefined,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      setProducts((prev) => [...prev, ...res.data]);
      setTotal(res.total);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }

  function changeCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    router.replace(`/products?${params.toString()}`, {
      scroll: false,
    });
  }

  const hasMore = products.length < total;
  const remaining = Math.max(total - products.length, 0);

  if (initialLoading) {
    return <CatalogSkeleton />;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search products, e.g. boxes, labels, cards..."
            className="h-11 pl-9"
            aria-label="Search products"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip
          label="All products"
          active={active === "all"}
          onClick={() => changeCategory("all")}
        />
        {categories.map((c) => (
          <FilterChip
            key={c.slug}
            label={c.name}
            active={active === c.slug}
            onClick={() => changeCategory(c.slug)}
          />
        ))}
      </div>

      {products.length > 0 ? (
        <>
          <div
            className={cn(
              "mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity",
              isFetching && "opacity-50",
            )}
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore || isFetching}
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : `Load more (${remaining} more)`}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-16 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-medium text-foreground">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or category.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
