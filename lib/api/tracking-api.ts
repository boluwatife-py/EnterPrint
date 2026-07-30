// Typed API layer for the public order-tracking lookup (no auth).
//
// Deliberately separate from orders-api.ts: this hits a different,
// unauthenticated endpoint (POST /track) that returns a display-oriented
// shape, not the authenticated Order type.

import { apiFetch } from "./api";

export type TrackedItem = { name: string; quantity: number };

export type TrackingMedia = {
  kind: "image" | "video";
  url: string;
  caption: string | null;
};

export type TrackingUpdate = {
  stage: string;
  /** Date-only display string (e.g. "Jul 5, 2026") — no time-of-day component. */
  timestamp: string;
  note: string;
  media: TrackingMedia[];
};

export type TrackedOrder = {
  id: string;
  /** One of PRODUCTION_STAGES, or "Cancelled". */
  status: string;
  createdAt: string;
  estimatedDelivery: string;
  /** Always null until a shipping-provider integration is wired up server-side. */
  courier: string | null;
  trackingNumber: string | null;
  /**
   * Currently the full delivery address (a known gap flagged server-side —
   * meant to eventually be city/state only, since this endpoint is
   * unauthenticated). Don't build UI that assumes it's always short.
   */
  destination: string;
  items: TrackedItem[];
  updates: TrackingUpdate[];
};

/**
 * POST /track — public id+email lookup. Rate limited 10/minute since this
 * is an unauthenticated enumeration target (guessing order ids against a
 * known email or vice versa). Returns 404 for a non-matching pair, an
 * order that doesn't exist, or one that never got past checkout — the
 * same 404 for all three, so callers shouldn't assume which case it was.
 */
export function trackOrder(orderId: string, email: string) {
  return apiFetch<TrackedOrder>("/track", {
    method: "POST",
    body: { orderId: orderId.trim(), email: email.trim().toLowerCase() },
  });
}
