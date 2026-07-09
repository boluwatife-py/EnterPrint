// app/dashboard/page.tsx
"use client";

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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { mockThreads } from "@/lib/mock-account";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FloatingChatButton } from "@/components/dashboard/floating-chat-button";

const PRODUCTION_STAGES = [
  "Order received",
  "Design",
  "Approval",
  "Production",
  "Finishing",
  "Packaging",
  "Dispatch",
  "Delivery",
];

function stageIndex(status: string) {
  const i = PRODUCTION_STAGES.findIndex((s) =>
    status.toLowerCase().includes(s.toLowerCase()),
  );
  return i === -1 ? 0 : i;
}

const statCards = [
  { label: "Open orders", value: "3", hint: "Active print jobs", icon: Package },
  { label: "Needs your review", value: "1", hint: "Proof awaiting approval", icon: Clock3 },
  { label: "Support threads", value: String(mockThreads.length), hint: "Messages in your inbox", icon: MessageSquareText },
];

const quickActions = [
  { label: "Start an order", href: "/products", icon: Package },
  { label: "Request a design", href: "/design-request", icon: Palette },
  { label: "Track an order", href: "/track-order", icon: Truck },
  { label: "Reorder last job", href: "/dashboard/orders", icon: RefreshCcw },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { orders } = useCart();

  const initials = (user?.name ?? "You")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
            <div key={card.label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">{card.value}</p>
                <p className="text-sm text-foreground">{card.label}</p>
                <p className="text-xs text-muted-foreground">{card.hint}</p>
              </div>
            </div>
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
              <p className="text-sm text-muted-foreground">Production milestones and delivery estimates.</p>
            </div>
            <Button render={<Link href="/dashboard/orders" />} variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="divide-y divide-border">
            {orders.slice(0, 3).map((order) => {
              const idx = stageIndex(order.status);
              const percent = Math.round(((idx + 1) / PRODUCTION_STAGES.length) * 100);
              return (
                <div key={order.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Package className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{order.items[0]?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 sm:max-w-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{PRODUCTION_STAGES[idx]}</span>
                      <span className="text-muted-foreground">{percent}%</span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{order.status}</Badge>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Truck className="h-3.5 w-3.5" />
                      ETA {order.estimatedDelivery}
                    </span>
                    <Button render={<Link href={`/dashboard/orders/${order.id}`} />} variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              );
            })}

            {orders.length === 0 && (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No orders yet — start your first project.</p>
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
            {user?.company && <p className="mt-3 text-xs text-muted-foreground">{user.company}</p>}
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

      <FloatingChatButton />
    </div>
  );
}