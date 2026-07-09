"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  Truck,
  MapPin,
  ImageIcon,
  VideoIcon,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { findTrackedOrder, type TrackedOrder } from "@/lib/mock-tracking";
import { PRODUCTION_STAGES, stageIndex } from "@/lib/production-stages";
import { OrderTimeline } from "@/components/dashboard/order-timeline";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function TrackOrderContent() {
  const searchParams = useSearchParams();

  const [orderId, setOrderId] = useState(searchParams.get("order") ?? "");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    const found = findTrackedOrder(orderId, email);
    setResult(found ?? null);
    setNotFound(!found);
    setSubmitted(true);
  }

  const idx = result ? stageIndex(result.status) : 0;

  return (
    <>
      {/* Hero-style header, matching the homepage search block */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-serif text-3xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Track your order
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Enter your order number and email to see live production and
              delivery status.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="track-order-id">Order number</Label>
              <Input
                id="track-order-id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="EP-0241"
                className="h-11"
              />
            </div>
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="track-email">Email used at checkout</Label>
              <Input
                id="track-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11"
              />
            </div>
            <Button type="submit" size="lg" className="h-11 shrink-0 px-6">
              <Search className="mr-2 h-4 w-4" />
              Track
            </Button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {!submitted && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <Package className="h-6 w-6 text-muted-foreground" />
            <p className="font-medium text-foreground">
              No order looked up yet
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your order number was sent to you by email when you checked out —
              it looks like{" "}
              <span className="font-mono text-foreground">EP-0241</span>.
            </p>
          </div>
        )}

        {submitted && notFound && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
            <p className="font-medium text-foreground">
              We couldn't find that order
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Double-check your order number and the email used at checkout, or
              reach out to our support team below.
            </p>
            <Button
              render={<Link href="/contact" />}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact support
            </Button>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-8">
            {/* Summary card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Package className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      {result.items[0]?.name}
                      {result.items.length > 1
                        ? ` +${result.items.length - 1} more`
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.id} · Placed {result.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{result.status}</Badge>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    ETA {result.estimatedDelivery}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <OrderTimeline currentIndex={idx} />
              </div>
            </div>

            {/* Delivery details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Destination
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.destination}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <Truck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Courier</p>
                  <p className="text-sm text-muted-foreground">
                    {result.courier ?? "Assigned closer to dispatch"}
                    {result.trackingNumber ? ` · ${result.trackingNumber}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Production updates + media */}
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-5">
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Production updates
                </h2>
                <p className="text-sm text-muted-foreground">
                  Photos and notes from our team as your order moves through
                  each stage.
                </p>
              </div>
              <div className="divide-y divide-border">
                {result.updates.map((update, i) => (
                  <div key={i} className="flex flex-col gap-3 p-5 sm:flex-row">
                    <div className="flex shrink-0 items-center gap-2 sm:w-40">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm font-medium text-foreground">
                        {update.stage}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {update.timestamp}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {update.note}
                      </p>
                      {update.media && update.media.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {update.media.map((m, j) => (
                            <div
                              key={j}
                              className="w-32 overflow-hidden rounded-lg border border-border"
                            >
                              <div className="relative aspect-square bg-secondary">
                                {m.kind === "video" ? (
                                  <video
                                    src={m.url}
                                    className="h-full w-full object-cover"
                                    muted
                                  />
                                ) : (
                                  <img
                                    src={m.url}
                                    alt={m.caption}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                                <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground">
                                  {m.kind === "video" ? (
                                    <VideoIcon className="h-3 w-3" />
                                  ) : (
                                    <ImageIcon className="h-3 w-3" />
                                  )}
                                </span>
                              </div>
                              <p className="truncate p-1.5 text-[11px] text-muted-foreground">
                                {m.caption}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support CTA */}
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary/40 p-8 text-center">
              <p className="font-medium text-foreground">
                Have a question about this order?
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Message our support team directly and reference{" "}
                <span className="font-mono text-foreground">{result.id}</span>.
              </p>
              <Button render={<Link href="/contact" />} size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message support
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrderContent />
    </Suspense>
  );
}
