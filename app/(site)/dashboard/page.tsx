// app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Clock3,
  MessageSquareText,
  Truck,
  Palette,
  UploadCloud,
  RefreshCcw,
  Search,
  AlertCircle,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getDashboard, type DashboardSummary } from "@/lib/api/account-api";
import { reorderOrder, type Order } from "@/lib/api/orders-api";
import { formatNaira, formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const quickActions = [
  { label: "Start an order", href: "/products", icon: Package },
  { label: "Request a design", href: "/design-request", icon: Palette },
  { label: "Track an order", href: "/track-order", icon: Truck },
  { label: "Reorder last job", href: "/dashboard/orders", icon: RefreshCcw },
];

const SHIPPED_STATUSES = new Set(["Dispatch", "Delivery"]);

type LoadState = "loading" | "ready" | "error";

export default function DashboardPage() {
  const { user, logout, authFetch } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setState("loading");
    getDashboard(authFetch)
      .then((data) => {
        setSummary(data);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReorder(order: Order) {
    setReorderingId(order.id);
    try {
      const result = await reorderOrder(authFetch, order.id);
      window.location.href = result.paymentUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : null;
      toast.error(
        message ||
          "Couldn't reorder, none of the items may still be available.",
      );
      setReorderingId(null);
    }
  }

  const initials = (user?.name ?? "You")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statCards = [
    {
      label: "Open orders",
      value: summary?.openOrders ?? null,
      hint: "Active print jobs",
      icon: Package,
      href: "/dashboard/orders",
      alert: false,
    },
    {
      label: "Needs your review",
      value: summary?.needsReview ?? null,
      hint: "Proofs awaiting approval",
      icon: Clock3,
      href: "/dashboard/orders?status=awaiting-proof",
      alert: (summary?.needsReview ?? 0) > 0,
    },
    {
      label: "Unread messages",
      value: summary?.unreadThreadCount ?? null,
      hint: "Support threads with new replies",
      icon: MessageSquareText,
      href: "/dashboard/messages",
      alert: (summary?.unreadThreadCount ?? 0) > 0,
    },
  ];

  const recentOrders = (summary?.recentOrders ?? []) as unknown as Order[];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-secondary text-sm font-medium text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Welcome back
            </p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {user?.name ?? "Your workspace"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button render={<Link href="/products" />} variant="outline">
            Browse products
          </Button>
          <Button variant="ghost" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={cn(
                "flex items-start gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/30",
                card.alert ? "border-primary/30 bg-primary/5" : "border-border",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                  card.alert ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                {card.value === null ? (
                  <span className="block h-8 w-10 animate-pulse rounded bg-secondary" />
                ) : (
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    {card.value}
                  </p>
                )}
                <p className="text-sm text-foreground">{card.label}</p>
                <p className="text-xs text-muted-foreground">{card.hint}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick actions</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-secondary/50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Recent orders */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground">Recent orders</h2>
              <p className="text-sm text-muted-foreground">Active updates, items, and billing details.</p>
            </div>
            <Button render={<Link href="/dashboard/orders" />} variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="divide-y divide-border">
            {state === "loading" &&
              [0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-start gap-3">
                    <span className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-secondary" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <span className="block h-4 w-24 animate-pulse rounded bg-secondary" />
                      <span className="block h-3 w-40 animate-pulse rounded bg-secondary" />
                      <div className="flex gap-1.5">
                        <span className="block h-5 w-20 animate-pulse rounded-full bg-secondary" />
                        <span className="block h-5 w-16 animate-pulse rounded-full bg-secondary" />
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="block h-5 w-20 animate-pulse rounded-full bg-secondary" />
                    <span className="hidden h-4 w-16 animate-pulse rounded bg-secondary sm:block" />
                    <span className="block h-8 w-8 animate-pulse rounded bg-secondary" />
                  </div>
                </div>
              ))}

            {state === "error" && (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <p className="text-sm text-foreground">Couldn&apos;t load your recent orders.</p>
                <Button variant="outline" size="sm" onClick={load}>
                  Try again
                </Button>
              </div>
            )}

            {state === "ready" &&
              recentOrders.map((order) => {
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
                            {order.unreadMessageCount > 9 ? "9+" : order.unreadMessageCount}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-foreground">{order.id}</p>
                          {order.unreadMessageCount > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              <MessageSquare className="h-2.5 w-2.5" />
                              New update
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)} · {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"} · Qty {totalQty}
                        </p>
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
                        <DropdownMenuContent align="end" className="w-auto min-w-40">
                          <DropdownMenuItem render={<Link href={`/dashboard/orders/${order.id}`} />}>
                            <Eye className="mr-2 h-4 w-4" />
                            View order
                          </DropdownMenuItem>
                          {order.threadId && (
                            <DropdownMenuItem
                              className="flex items-center whitespace-nowrap"
                              render={<Link href={`/dashboard/messages/${order.threadId}`} />}
                            >
                              <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                              View messages
                              {order.unreadMessageCount > 0 && (
                                <Badge variant="secondary" className="ml-auto shrink-0">
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
                            <DropdownMenuItem render={<Link href={`/track-order?order=${order.id}`} />}>
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

            {state === "ready" && recentOrders.length === 0 && (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No orders yet, start your first project.</p>
                <Button render={<Link href="/products" />} size="sm">
                  Browse products
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Account panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg font-semibold text-foreground">Account</h2>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-secondary text-xs font-medium text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {user?.phoneNumber && <p className="mt-3 text-xs text-muted-foreground">{user.phoneNumber}</p>}
            <Button render={<Link href="/dashboard/settings" />} variant="outline" size="sm" className="mt-4 w-full">
              Edit profile
            </Button>
          </div>

          <Link
            href="/track-order"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Track a delivery</p>
              <p className="text-xs text-muted-foreground">Enter an order number</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}