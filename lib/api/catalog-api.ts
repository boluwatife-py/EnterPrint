// Typed API layer for the public catalog (categories, products, pricing).
//
// Replaces the static `lib/data.ts` mock. These endpoints are public
// (no `security` block in openapi.json), so they use the plain `apiFetch`
// helper rather than the token-injecting `authFetch` from useAuth().

import { apiFetch } from "./api";

/* -------------------------------------------------------------------------- */
/* Types (mirrors ProductResponse / CategoryResponse in openapi.json)         */
/* -------------------------------------------------------------------------- */

export type OptionValue = {
  id: string;
  label: string;
  /** Multiplier only — the backend has no `priceDelta` concept. */
  priceMultiplier: number;
};

export type OptionGroup = {
  id: string;
  label: string;
  values: OptionValue[];
};

export type QuantityTier = {
  qty: number;
  unitPrice: number;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
  icon: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  tagline: string;
  description: string;
  image: string;
  basePrice: number;
  rating: number;
  reviews: number;
  tags: string[];
  popular: boolean;
  turnaroundDays: number;
  features: string[];
  options: OptionGroup[];
  quantityTiers: QuantityTier[];
};

type CategoryListResponse = { data: Category[] };
type ProductListResponse = {
  data: Product[];
  page: number;
  pageSize: number;
  total: number;
};

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

/** GET /categories */
export async function listCategories(): Promise<Category[]> {
  const res = await apiFetch<CategoryListResponse>("/categories");
  return res.data;
}

/** Convenience: find one category by slug from a already-fetched list. */
export function findCategory(
  categories: Category[],
  slug: string,
): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

export type ListProductsParams = {
  category?: string;
  search?: string;
  popular?: boolean;
  page?: number;
  pageSize?: number;
};

/** GET /products — supports category/search/popular filters + pagination. */
export function listProducts(
  params: ListProductsParams = {},
): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.popular !== undefined)
    query.set("popular", String(params.popular));
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const qs = query.toString();
  return apiFetch<ProductListResponse>(`/products${qs ? `?${qs}` : ""}`);
}

/** GET /products/{slug} */
export function getProduct(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${encodeURIComponent(slug)}`);
}

/** Convenience wrapper: all products in one category, unpaginated view. */
export async function getProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  const res = await listProducts({ category: categorySlug, pageSize: 100 });
  return res.data;
}

/** Convenience wrapper: the "popular" flagged products. */
export async function getPopularProducts(): Promise<Product[]> {
  const res = await listProducts({ popular: true, pageSize: 100 });
  return res.data;
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                    */
/* -------------------------------------------------------------------------- */

export type QuoteRequest = {
  productSlug: string;
  quantity: number;
  options?: Record<string, string>;
};

export type QuoteResponse = {
  unitPrice: number;
  quantity: number;
  subtotal: number;
  currency: string;
};

/**
 * POST /pricing/quote — the authoritative price. Use this before checkout;
 * `estimatePrice` below is a client-side approximation for instant UI
 * feedback only and can drift from server-side rules (taxes, promos, etc).
 */
export function getPricingQuote(body: QuoteRequest): Promise<QuoteResponse> {
  return apiFetch<QuoteResponse>("/pricing/quote", {
    method: "POST",
    body,
  });
}

/**
 * Local, optimistic price estimate for instant UI feedback (e.g. as a user
 * drags a quantity slider) — NOT authoritative. Call `getPricingQuote` for
 * the real price before showing a final total or submitting an order.
 */
export function estimatePrice(
  product: Product,
  selected: Record<string, string>,
  qty: number,
): { unitPrice: number; total: number } {
  const sortedTiers = [...product.quantityTiers].sort((a, b) => a.qty - b.qty);
  let tier = sortedTiers[0];
  for (const t of sortedTiers) {
    if (qty >= t.qty) tier = t;
  }

  let unit = tier?.unitPrice ?? product.basePrice;
  for (const group of product.options) {
    const chosenId = selected[group.id];
    const value = group.values.find((v) => v.id === chosenId);
    if (value?.priceMultiplier) unit *= value.priceMultiplier;
  }
  unit = Math.round(unit);
  return { unitPrice: unit, total: unit * qty };
}
