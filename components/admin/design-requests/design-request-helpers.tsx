import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  new: "border-amber-500/30 text-amber-700 dark:text-amber-400",
  contacted: "border-sky-500/30 text-sky-700 dark:text-sky-400",
  closed: "text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

export function DesignRequestStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status])}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

// Values come from CreateDesignRequestRequest.budget in the backend schema.
const BUDGET_LABELS: Record<string, string> = {
  "under-50k": "Under ₦50k",
  "50-150k": "₦50k – ₦150k",
  "150-500k": "₦150k – ₦500k",
  "over-500k": "Over ₦500k",
};

export function budgetLabel(budget: string): string {
  return BUDGET_LABELS[budget] ?? budget;
}

/** "business-cards" -> "Business cards" */
export function projectTypeLabel(slug: string): string {
  const text = slug.replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** wa.me wants digits only, with country code. Local Nigerian numbers
 *  (0XXXXXXXXXX) are converted to 234…; anything else is used as typed. */
export function whatsappUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;
  const intl = digits.startsWith("0") && digits.length === 11 ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}