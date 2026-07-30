// components/dashboard/orders-browser.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Truck,
  MoreHorizontal,
  Eye,
  RefreshCcw,
  Loader2,
  MessageSquare,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { listOrders, reorderOrder, type Order } from "@/lib/api/orders-api";
import { formatNaira, formatDate } from "@/lib/utils/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 8;

/** Minimal filter set -- only slugs that map directly to a real
 * OrderStatus milestone. "Awaiting proof" is deliberately excluded: it's
 * not a status on the order itself (a proof can be pending at any
 * milestone), so it doesn't fit a single-status filter here. That state
 * is visible per-order on the order detail page instead. */
const statusFilters = [
  { slug: "all", label: "All orders" },
  { slug: "in-production", label: "In production" },
  { slug: "shipped", label: "Shipped" },
  { slug: "delivered", label: "Delivered" },
  { slug: "cancelled", label: "Cancelled" },
];

const SHIPPED_STATUSES = new Set(["Dispatch", "Delivery"]);

/** Placeholder rows shown while the first page loads, matching the real
 * row's layout so the list doesn't visually jump once data arrives. */
function OrderRowSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-start gap-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="hidden h-4 w-16 sm:block" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

export function OrdersBrowser() {
  const { authFetch } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await listOrders(authFetch, {
          status: active,
          page: 1,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        setOrders(res.data);
        setTotal(res.total);
        setPage(1);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : null;
        setError(message || "Couldn't load your orders. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, active]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await listOrders(authFetch, {
        status: active,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      setOrders((prev) => [...prev, ...res.data]);
      setTotal(res.total);
      setPage(nextPage);
    } catch {
      toast.error("Couldn't load more orders. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q)),
    );
  }, [orders, query]);

  const hasMore = orders.length < total;

  async function handleReorder(order: Order) {
    setReorderingId(order.id);
    try {
      const result = await reorderOrder(authFetch, order.id);
      window.location.href = result.paymentUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : null;
      toast.error(
        message ||
          "Couldn't reorder — none of the items may still be available.",
      );
      setReorderingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search loaded orders by number or product…"
            className="h-11 pl-9"
            aria-label="Search orders"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {total} {total === 1 ? "order" : "orders"}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.slug}
            type="button"
            onClick={() => setActive(f.slug)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === f.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
            {filtered.map((order) => {
              const isShipped = SHIPPED_STATUSES.has(order.status);
              const totalQty = order.items.reduce((n, i) => n + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex flex-1 items-start gap-3 min-w-0"
                  >
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Package className="h-5 w-5" />
                      {order.unreadMessageCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                          {order.unreadMessageCount > 9
                            ? "9+"
                            : order.unreadMessageCount}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground">
                          {order.id}
                        </p>
                        {order.unreadMessageCount > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            <MessageSquare className="h-2.5 w-2.5" />
                            New update
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)} · {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"} · Qty{" "}
                        {totalQty}
                      </p>
                      {/* Actual products in the order, so a customer scanning
                          multiple orders can tell them apart at a glance
                          instead of guessing from a single truncated name. */}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {order.items.map((item, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {item.name}
                            {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>

                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="secondary">{order.status}</Badge>
                    <span className="hidden text-sm font-medium text-foreground sm:inline">
                      {formatNaira(order.total)}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for order ${order.id}`}
                            disabled={reorderingId === order.id}
                          />
                        }
                      >
                        {reorderingId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-auto min-w-40"
                      >
                        <DropdownMenuItem
                          render={
                            <Link href={`/dashboard/orders/${order.id}`} />
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View order
                        </DropdownMenuItem>
                        {order.threadId && (
                          <DropdownMenuItem
                            className="flex items-center whitespace-nowrap"
                            render={
                              <Link
                                href={`/dashboard/messages/${order.threadId}`}
                              />
                            }
                          >
                            <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                            View messages
                            {order.unreadMessageCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="ml-auto shrink-0"
                              >
                                {order.unreadMessageCount}
                              </Badge>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleReorder(order)}
                          disabled={reorderingId === order.id}
                        >
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Reorder
                        </DropdownMenuItem>
                        {isShipped && (
                          <DropdownMenuItem
                            render={
                              <Link href={`/track-order?order=${order.id}`} />
                            }
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Track delivery
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && !query && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              >
                {loadingMore && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Load more ({total - orders.length} more)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Package className="h-6 w-6 text-muted-foreground" />
          <p className="font-medium text-foreground">
            {query || active !== "all" ? "No matching orders" : "No orders yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {query || active !== "all"
              ? "Try a different search or filter."
              : "Start your first project to see it here."}
          </p>
          {!query && active === "all" && (
            <Button
              render={<Link href="/products" />}
              size="sm"
              className="mt-2"
            >
              Browse products
            </Button>
          )}
        </div>
      )}
    </div>
  );
}