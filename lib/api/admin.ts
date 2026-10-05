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

export type ProductImage = {
  id?: string;
  url: string;
  altText?: string | null;
  displayOrder?: number;
  isPrimary: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  tagline?: string;
  description?: string;
  image?: string;
  images?: ProductImage[];
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

// --- Admin Order types (mirror app/orders/admin_schemas.py) ---

/** Same order as the customer-facing timeline. "Pending Payment" is pre-pipeline
 *  (set by checkout / webhook, never by hand) and "Cancelled" is the exit state. */
export const ORDER_PIPELINE = [
  "Order Received",
  "Design",
  "Approval",
  "Production",
  "Finishing",
  "Packaging",
  "Dispatch",
  "Delivery",
] as const;

export type AdminPaymentFlag = {
  code: "unsynced" | "stale" | "refund_review" | "amount_mismatch" | string;
  message: string;
};

export type AdminPaymentEvent = {
  id: number;
  eventType: string;
  /** OUR processing state for the webhook, not Paystack's. */
  status: "pending" | "processed" | "failed" | string;
  createdAt: string;
  processedAt?: string | null;
  errorMessage?: string | null;
  /** Naira (already normalised from kobo). */
  amount?: number | null;
  channel?: string | null;
  gatewayStatus?: string | null;
};

export type AdminPaymentInfo = {
  state: "awaiting" | "paid" | "unpaid" | string;
  flags: AdminPaymentFlag[];
  channel?: string | null;
  paystackAmount?: number | null;
  events: AdminPaymentEvent[];
};

export type AdminPaymentListItem = {
  orderId: string;
  createdAt: string;
  orderStatus: string;
  paymentReference: string;
  total: number;
  state: AdminPaymentInfo["state"];
  flags: AdminPaymentFlag[];
  channel?: string | null;
  paystackAmount?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
};

export type PaymentView = "all" | "needs-attention" | "awaiting" | "paid";

export type ReverifyResult = {
  outcome: "confirmed" | "not_paid" | "already_processed";
  message: string;
  gatewayStatus?: string | null;
  order: AdminOrderDetail;
};

export type AdminOrderCustomer = {
  id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
};

export type AdminArtworkFile = {
  id: string;
  name: string;
  url: string;
  kind?: string | null;
  size?: string | null;
};

export type AdminOrderItem = {
  productSlug: string;
  name: string;
  image: string;
  options: Record<string, unknown>;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  artworkType: "upload" | "design" | "none" | string;
  artworkBrief?: string | null;
  artworkFiles: AdminArtworkFile[];
  missingArtworkFileIds: string[];
};

export type AdminOrderProof = {
  id: number;
  status: "awaiting_approval" | "approved" | "rejected" | string;
  url: string;
  version: number;
  notes?: string | null;
};

export type AdminTrackingEvent = {
  id: number;
  label: string;
  location: string;
  date: string;
  done: boolean;
  note?: string | null;
  media?: unknown[] | null;
};

export type AdminOrderDetail = {
  id: string;
  createdAt: string;
  status: string;
  artworkStatus: string;
  subtotal: number;
  delivery: number;
  total: number;
  deliveryMethod: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  paymentReference: string;
  courier?: string | null;
  trackingNumber?: string | null;
  threadId?: string | null;
  awaitingProof: boolean;
  customer: AdminOrderCustomer;
  payment: AdminPaymentInfo;
  items: AdminOrderItem[];
  proofs: AdminOrderProof[];
  tracking: AdminTrackingEvent[];
};

export type AdminOrderListItem = {
  id: string;
  createdAt: string;
  status: string;
  artworkStatus: string;
  total: number;
  deliveryMethod: string;
  paymentReference: string;
  itemCount: number;
  itemNames: string[];
  thumbnail?: string | null;
  hasDesignRequest: boolean;
  awaitingProof: boolean;
  customerName?: string | null;
  customerEmail?: string | null;
};

// --- Admin Order API Calls ---
export async function getAdminOrders(
  token: string,
  status?: string,
  search?: string,
  page = 1,
  pageSize = 20
) {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (status && status !== "all") params.append("status", status);
  if (search) params.append("search", search);

  return apiFetch<{ data: AdminOrderListItem[]; page: number; pageSize: number; total: number }>(
    `/admin/orders?${params.toString()}`,
    { token }
  );
}

export async function getAdminOrder(token: string, orderId: string) {
  return apiFetch<AdminOrderDetail>(`/admin/orders/${orderId}`, { token });
}

/** Returns the full, refreshed order so the page can replace its state in one go. */
export async function updateAdminOrderStatus(
  token: string,
  orderId: string,
  payload: { status: string }
) {
  return apiFetch<AdminOrderDetail>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

/** Asks Paystack whether the order's transaction succeeded and syncs the order if so. */
export async function reverifyAdminOrderPayment(token: string, orderId: string) {
  return apiFetch<ReverifyResult>(`/admin/orders/${orderId}/verify-payment`, {
    method: "POST",
    token,
  });
}

// --- Admin Payment API Calls ---
export async function getAdminPayments(
  token: string,
  view: PaymentView = "all",
  search?: string,
  page = 1,
  pageSize = 20
) {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString(), view });
  if (search) params.append("search", search);

  return apiFetch<{ data: AdminPaymentListItem[]; page: number; pageSize: number; total: number }>(
    `/admin/payments?${params.toString()}`,
    { token }
  );
}
