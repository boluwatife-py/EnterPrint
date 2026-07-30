/**
 * Progress-bar mapping for `Order.status` (OrderSchema in openapi.json).
 *
 * Deliberately separate from `PRODUCTION_STAGES` in `production-stages.ts` —
 * that list uses the *public tracking* endpoint's status wording
 * ("Order received", "Design", "Approval"...), which is a different enum
 * from `Order.status` ("Order Received", "Design Approved", "Dispatched"...).
 * Reusing the tracking stage list here previously caused silent bugs (e.g.
 * "Delivered".includes("Delivery") is false, so delivered orders showed 0%).
 */
export const ORDER_STATUS_STAGES = [
  "Pending Payment",
  "Order Received",
  "Design Approved",
  "In Production",
  "Quality Check",
  "Dispatched",
  "Delivered",
] as const;

/** Index of `status` in the linear progress sequence, or 0 if unrecognized. */
export function orderStageIndex(status: string): number {
  const i = ORDER_STATUS_STAGES.indexOf(status as (typeof ORDER_STATUS_STAGES)[number]);
  return i === -1 ? 0 : i;
}

/**
 * Percent complete for the progress bar. `Cancelled` isn't part of the
 * linear sequence (an order can be cancelled from most stages), so it's
 * handled as a special case rather than falling through to index 0.
 */
export function orderProgressPercent(status: string): number {
  if (status === "Cancelled") return 0;
  const idx = orderStageIndex(status);
  return Math.round(((idx + 1) / ORDER_STATUS_STAGES.length) * 100);
}