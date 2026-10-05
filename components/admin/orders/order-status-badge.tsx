// components/admin/orders/order-status-badge.tsx
import { Badge } from "@/components/ui/badge";

const TONES: Record<string, string> = {
  "Pending Payment": "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  Dispatch: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Delivery: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={TONES[status] ?? "bg-secondary text-secondary-foreground"}>
      {status}
    </Badge>
  );
}

const PROOF_TONES: Record<string, { label: string; className: string }> = {
  awaiting_approval: {
    label: "Awaiting customer",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  approved: {
    label: "Approved",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

export function ProofStatusBadge({ status }: { status: string }) {
  const tone = PROOF_TONES[status];
  return (
    <Badge variant="outline" className={tone?.className ?? "bg-secondary text-secondary-foreground"}>
      {tone?.label ?? status}
    </Badge>
  );
}

const PAYMENT_STATE_TONES: Record<string, { label: string; className: string }> = {
  awaiting: {
    label: "Awaiting payment",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  paid: {
    label: "Paid",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  unpaid: { label: "Not paid", className: "bg-secondary text-secondary-foreground" },
};

export function PaymentStateBadge({ state }: { state: string }) {
  const tone = PAYMENT_STATE_TONES[state];
  return (
    <Badge variant="outline" className={tone?.className ?? "bg-secondary text-secondary-foreground"}>
      {tone?.label ?? state}
    </Badge>
  );
}

/** Our webhook-processing state (not Paystack's view of the charge). */
const WEBHOOK_TONES: Record<string, string> = {
  processed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export function WebhookStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={WEBHOOK_TONES[status] ?? "bg-secondary text-secondary-foreground"}>
      {status}
    </Badge>
  );
}

/** Short labels for the table; the full message goes in the tooltip / order page. */
export const PAYMENT_FLAG_LABELS: Record<string, string> = {
  unsynced: "Paid at Paystack, not synced",
  stale: "Pending over 1h",
  refund_review: "Refund review",
  amount_mismatch: "Amount mismatch",
};
