import { apiFetch } from "@/lib/api/api";

// Types matching your backend schemas
export type AdminCategory = {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive?: boolean;
};

export type OptionValue = {
  id: string;
  label: string;
  priceMultiplier: number;
};

export type OptionGroup = {
  label: string;
  values: OptionValue[];
};

export type QuantityTier = {
  qty: number;
  unitPrice: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  tagline?: string;
  description?: string;
  image?: string;
  basePrice: number;
  rating: number;
  reviews: number;
  tags: string[];
  popular: boolean;
  isActive: boolean;
  turnaroundDays: number;
  features: string[];
  options: OptionGroup[];
  quantityTiers: QuantityTier[];
};

// --- Admin Category API Calls ---
export async function getAdminCategories(token: string) {
  return apiFetch<{ data: AdminCategory[] }>("/admin/catalog/categories", { token });
}

export async function createAdminCategory(token: string, payload: Partial<AdminCategory>) {
  return apiFetch<AdminCategory>("/admin/catalog/categories", {
    method: "POST",
    body: payload,
    token,
  });
}

export async function updateAdminCategory(token: string, categoryId: string, payload: Partial<AdminCategory>) {
  return apiFetch<AdminCategory>(`/admin/catalog/categories/${categoryId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

// --- Admin Product API Calls ---
export async function getAdminProducts(
  token: string, 
  search?: string, 
  category?: string, 
  isActive?: string, 
  page = 1, 
  pageSize = 20
) {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (search) params.append("search", search);
  if (category && category !== "all") params.append("category", category);
  if (isActive && isActive !== "all") params.append("is_active", isActive);

  return apiFetch<{ data: Product[]; page: number; pageSize: number; total: number }>(
    `/admin/catalog/products?${params.toString()}`,
    { token }
  );
}
export async function createAdminProduct(token: string, payload: unknown) {
  return apiFetch<Product>("/admin/catalog/products", {
    method: "POST",
    body: payload,
    token,
  });
}

export async function updateAdminProduct(token: string, productId: string, payload: unknown) {
  return apiFetch<Product>(`/admin/catalog/products/${productId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export async function deleteAdminProduct(token: string, productId: string) {
  return apiFetch<void>(`/admin/catalog/products/${productId}`, {
    method: "DELETE",
    token,
  });
}

// --- Upload API Call ---
export async function uploadAdminImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<{ url: string }>("/uploads/image", {
    method: "POST",
    body: formData,
    token,
  });
}