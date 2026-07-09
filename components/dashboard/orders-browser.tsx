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
  Download,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import {
  PRODUCTION_STAGES,
  stageIndex,
  statusFilters,
} from "@/lib/production-stages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 8;

export function OrdersBrowser() {
  const { orders, addItem } = useCart();
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const activeFilter =
    statusFilters.find((f) => f.slug === active) ?? statusFilters[0];

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = activeFilter.matches(order.status);
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === "" ||
        order.id.toLowerCase().includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [orders, activeFilter, query]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [active, query]);

  const visibleOrders = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = Math.max(filtered.length - visibleCount, 0);

  function handleReorder(order: (typeof orders)[number]) {
    // Assumes useCart() exposes addItem — adjust to match your real cart API
    // if it differs (e.g. a single addOrderItems(order) bulk helper instead).
    order.items.forEach((item) =>
      addItem?.({
        ...item,
        id: item.name,
        optionLabels: Object.entries(item.options).map(([label, value]) => ({
          label,
          value,
        })),
        artwork: { type: "upload", fileNames: ["previous-artwork.pdf"] },
      }),
    );
    toast.success(
      `${order.items.length} item${order.items.length === 1 ? "" : "s"} added to cart`,
      {
        description: `From order ${order.id}`,
      },
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order number or product…"
            className="h-11 pl-9"
            aria-label="Search orders"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "order" : "orders"}
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

      {filtered.length > 0 ? (
        <>
          <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
            {visibleOrders.map((order) => {
              const idx = stageIndex(order.status);
              const percent = Math.round(
                ((idx + 1) / PRODUCTION_STAGES.length) * 100,
              );
              const isShipped = /dispatch|shipped|in transit/i.test(
                order.status,
              );

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex flex-1 items-center gap-3 min-w-0"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Package className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {order.items[0]?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.id} · {order.createdAt} · Qty{" "}
                        {order.items.reduce((n, i) => n + i.quantity, 0)}
                      </p>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col gap-1.5 sm:max-w-55">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">
                        {PRODUCTION_STAGES[idx]}
                      </span>
                      <span className="text-muted-foreground">{percent}%</span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="secondary">{order.status}</Badge>
                    <span className="hidden text-sm font-medium text-foreground sm:inline">
                      ₦{order.total?.toLocaleString()}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for order ${order.id}`}
                          />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={
                            <Link href={`/dashboard/orders/${order.id}`} />
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReorder(order)}>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Reorder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <a
                              href={`/api/orders/${order.id}/invoice`}
                              target="_blank"
                              rel="noreferrer"
                            />
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download invoice
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

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(count + PAGE_SIZE, filtered.length),
                  )
                }
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Load more ({remaining} more)
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
