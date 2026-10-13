// app/admin/payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft, ChevronRight, CreditCard, Search, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getAdminPayments, type AdminPaymentListItem, type PaymentView } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OrderStatusBadge,
  PAYMENT_FLAG_LABELS,
  PaymentStateBadge,
} from "@/components/admin/orders/order-status-badge";
import { formatDate, formatNaira } from "@/lib/utils/format";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const VIEWS: { value: PaymentView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "needs-attention", label: "Needs attention" },
  { value: "awaiting", label: "Awaiting payment" },
  { value: "paid", label: "Paid" },
];

const EMPTY_COPY: Record<PaymentView, string> = {
  all: "No payments match your search.",
  "needs-attention": "Nothing needs attention right now.",
  awaiting: "No orders are waiting on payment.",
  paid: "No paid orders match your search.",
};

function channelLabel(channel?: string | null) {
  return channel ? channel.replace(/_/g, " ") : null;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { accessToken, isHydrated } = useAuth();

  const [rows, setRows] = useState<AdminPaymentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<PaymentView>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!isHydrated || !accessToken) return;
    let cancelled = false;
    setLoading(true);

    getAdminPayments(accessToken, view, search, page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load payments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, isHydrated, view, search, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Payments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Payment status for every order, as reported by Paystack. Open an order to re-verify a
          payment that hasn&apos;t come through.
        </p>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
        <div
          role="tablist"
          aria-label="Payment filter"
          className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1"
        >
          {VIEWS.map((v) => (
            <Button
              key={v.value}
              role="tab"
              aria-selected={view === v.value}
              size="sm"
              variant={view === v.value ? "default" : "ghost"}
              onClick={() => {
                setView(v.value);
                setPage(1);
              }}
              className="text-xs"
            >
              {v.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order ID, reference or customer email"
            className="h-10 w-full pl-9 pr-9"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-card sm:rounded-xl">
        {loading ? (
          <div className="space-y-4 divide-y divide-border p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-foreground">{EMPTY_COPY[view]}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-xs font-semibold text-muted-foreground">
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order status</th>
                  <th className="p-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {rows.map((row) => (
                  <tr
                    key={row.orderId}
                    onClick={() => router.push(`/admin/orders/${row.orderId}`)}
                    className="cursor-pointer transition-colors hover:bg-muted/60"
                  >
                    <td className="p-4">
                      <p className="font-mono font-medium text-foreground">{row.orderId}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      {row.customerName || row.customerEmail ? (
                        <>
                          <p className="text-foreground">{row.customerName ?? row.customerEmail}</p>
                          {row.customerName && row.customerEmail && (
                            <p className="text-xs text-muted-foreground">{row.customerEmail}</p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Account deleted</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {row.paymentReference}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{formatNaira(row.total)}</p>
                      {channelLabel(row.channel) && (
                        <p className="text-xs capitalize text-muted-foreground">
                          {channelLabel(row.channel)}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <PaymentStateBadge state={row.state} />
                        {row.flags.map((flag) => (
                          <Badge
                            key={flag.code}
                            variant="outline"
                            title={flag.message}
                            className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {PAYMENT_FLAG_LABELS[flag.code] ?? flag.code}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <OrderStatusBadge status={row.orderStatus} />
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/admin/orders/${row.orderId}`} />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {total} orders
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
