// lib/production-stages.ts
export const PRODUCTION_STAGES = [
  "Order received",
  "Design",
  "Approval",
  "Production",
  "Finishing",
  "Packaging",
  "Dispatch",
  "Delivery",
];

export function stageIndex(status: string) {
  const i = PRODUCTION_STAGES.findIndex((s) =>
    status.toLowerCase().includes(s.toLowerCase()),
  );
  return i === -1 ? 0 : i;
}

export type StatusFilter = {
  slug: string;
  label: string;
  matches: (status: string) => boolean;
};

export const statusFilters: StatusFilter[] = [
  { slug: "all", label: "All orders", matches: () => true },
  {
    slug: "awaiting-proof",
    label: "Awaiting proof",
    matches: (s) => /approval/i.test(s),
  },
  {
    slug: "in-production",
    label: "In production",
    matches: (s) => /production|finishing|packaging/i.test(s),
  },
  {
    slug: "shipped",
    label: "Shipped",
    matches: (s) => /dispatch/i.test(s),
  },
  {
    slug: "delivered",
    label: "Delivered",
    matches: (s) => /delivery/i.test(s),
  },
  {
    slug: "cancelled",
    label: "Cancelled",
    matches: (s) => /cancel/i.test(s),
  },
];

export function activeStageLabel(
  status: string,
  hasPendingProof?: boolean,
): string {
  if (status === "Cancelled") return "Cancelled";
  if (status === "Pending Payment") return "Awaiting payment";
  if (hasPendingProof) return "Approval";
  const idx = stageIndex(status);
  return PRODUCTION_STAGES[Math.min(idx + 1, PRODUCTION_STAGES.length - 1)];
}
