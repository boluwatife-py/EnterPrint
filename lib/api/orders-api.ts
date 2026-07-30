// Typed API layer for Orders & Checkout.
//
// Follows the same pattern as account-api.ts: every function takes the
// `authFetch` from useAuth() so calls ride the current session and survive
// access-token expiry automatically. Shapes mirror OrderSchema in
// openapi.json, not the old mock-account.ts draft.

import type { AuthFetch } from "@/lib/api/account-api";
import type { CartItem } from "@/lib/cart-context";

export type ArtworkFile = {
  id: string;
  name: string;
  url: string;
  kind: string;
  size: string;
};

export type OrderItem = {
  productSlug: string;
  name: string;
  image: string;
  options: Record<string, string>;
  quantity: number;
  unitPrice: number;
  artworkType: "upload" | "design" | "none";
  /** Only present when artworkType === "design". */
  artworkBrief: string | null;
  artworkFiles: ArtworkFile[];
  hasPendingProof: boolean;
};

export type TrackingEvent = {
  label: string;
  location: string;
  date: string;
  done: boolean;
};

export type Order = {
  id: string;
  createdAt: string;
  status: string;
  artworkStatus: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  /** Flattened display string ("streetAddress, city, state, country") — not structured. */
  deliveryAddress: string;
  estimatedDelivery: string;
  tracking: TrackingEvent[];
  /** Only non-null on POST /orders — redirect here to pay via Paystack. */
  paymentUrl: string | null;
  /** Support thread auto-created the moment the order is placed. */
  threadId: string | null;
  /** Unread message count on this order's support thread (0 if no thread yet). */
  unreadMessageCount: number;
};

export type DeliveryMethod = "standard" | "express";

type CreateOrderRequest = {
  items: {
    productSlug: string;
    options: Record<string, string>;
    quantity: number;
    artwork: {
      type: "upload" | "design" | "none";
      fileIds?: string[];
      brief?: string;
    };
  }[];
  deliveryAddressId: string;
  deliveryMethod: DeliveryMethod;
};

export type PaginatedOrders = {
  data: Order[];
  page: number;
  pageSize: number;
  total: number;
};

/**
 * Converts a cart item's UI-shaped `ArtworkInfo` (which carries full
 * uploaded-file objects for rendering thumbnails/names in the cart) into the
 * API's wire shape, which only wants file ids.
 */
function toArtworkInfo(
  item: CartItem,
): CreateOrderRequest["items"][number]["artwork"] {
  return {
    type: item.artwork.type,
    fileIds: item.artwork.files?.map((f) => f.id),
    brief: item.artwork.brief,
  };
}

/**
 * POST /orders — places the order and starts a live Paystack transaction.
 * Do NOT send `unitPrice` or a `paymentReference`: the server recomputes
 * pricing from `productSlug`/`options`/`quantity` and mints its own
 * Paystack reference server-side.
 */
export function placeOrder(
  authFetch: AuthFetch,
  items: CartItem[],
  deliveryAddressId: string,
  deliveryMethod: DeliveryMethod,
) {
  const body: CreateOrderRequest = {
    items: items.map((item) => ({
      productSlug: item.productSlug,
      options: item.options,
      quantity: item.quantity,
      artwork: toArtworkInfo(item),
    })),
    deliveryAddressId,
    deliveryMethod,
  };

  return authFetch<Order>("/orders", { method: "POST", body });
}

/**
 * GET /orders/verify-payment?reference=... — call once when the frontend
 * lands back from Paystack's redirect. Confirms directly with Paystack
 * rather than assuming the webhook has already landed.
 */
export function verifyPayment(authFetch: AuthFetch, reference: string) {
  return authFetch<Order>(
    `/orders/verify-payment?reference=${encodeURIComponent(reference)}`,
  );
}

export type PaymentStatus = { status: string; isFinal: boolean };

/**
 * GET /orders/:id/payment-status — cheap local-DB read, safe to poll every
 * few seconds on the confirmation page. `isFinal` flips true once the order
 * leaves "Pending Payment"; stop polling then and reconcile with
 * `verifyPayment` if you haven't already.
 */
export function getPaymentStatus(authFetch: AuthFetch, orderId: string) {
  return authFetch<PaymentStatus>(`/orders/${orderId}/payment-status`);
}

/** GET /orders/:id */
export function getOrder(authFetch: AuthFetch, orderId: string) {
  return authFetch<Order>(`/orders/${orderId}`);
}

/**
 * GET /orders — `status` should be a slug from `statusFilters`
 * (`awaiting-proof`, `in-production`, `shipped`, `delivered`, `cancelled`)
 * or omitted entirely for "all" (the API has no literal "all" value — it's
 * "no filter" server-side, per endpoint.md §6).
 */
export function listOrders(
  authFetch: AuthFetch,
  params: { status?: string; page?: number; pageSize?: number } = {},
) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all")
    query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const qs = query.toString();
  return authFetch<PaginatedOrders>(`/orders${qs ? `?${qs}` : ""}`);
}

export type ReorderResult = {
  addedItems: number;
  orderId: string;
  paymentUrl: string;
};


export function reorderOrder(authFetch: AuthFetch, orderId: string) {
  return authFetch<ReorderResult>(`/orders/${orderId}/reorder`, {
    method: "POST",
  });
}


export function cancelOrder(
  authFetch: AuthFetch,
  orderId: string,
  reason?: string,
) {
  return authFetch<Order>(`/orders/${orderId}/cancel`, {
    method: "POST",
    body: { reason },
  });
}

export type OrderProof = {
  status: string;
  url: string;
  version: number;
  notes: string | null;
};

/** GET /orders/:id/proof. 404s if no proof has been uploaded yet — treat as "no proof", not an error state. */
export function getOrderProof(authFetch: AuthFetch, orderId: string) {
  return authFetch<OrderProof>(`/orders/${orderId}/proof`);
}

/** POST /orders/:id/proof/approve — also advances Order.status to "Design Approved" if it was "Order Received". */
export function approveOrderProof(authFetch: AuthFetch, orderId: string) {
  return authFetch<{ artworkStatus: string }>(
    `/orders/${orderId}/proof/approve`,
    {
      method: "POST",
    },
  );
}

/** POST /orders/:id/proof/reject */
export function rejectOrderProof(
  authFetch: AuthFetch,
  orderId: string,
  reason: string,
) {
  return authFetch<{ artworkStatus: string }>(
    `/orders/${orderId}/proof/reject`,
    {
      method: "POST",
      body: { reason },
    },
  );
}
