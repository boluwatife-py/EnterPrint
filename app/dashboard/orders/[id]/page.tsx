// app/dashboard/orders/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ChevronRight,
  Truck,
  RefreshCcw,
  Download,
  XCircle,
  MapPin,
  FileImage,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { stageIndex } from "@/lib/production-stages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Attachment,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentGroup,
} from "@/components/ui/attachment";
import { OrderTimeline } from "@/components/dashboard/order-timeline";
import { OrderProofPanel } from "@/components/dashboard/order-proof-panel";
import { OrderMessagesPanel } from "@/components/dashboard/order-messages-panel";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { orders, addItem } = useCart();
  const order = orders.find((o) => o.id === id);

  if (!order) return notFound();

  const idx = stageIndex(order.status);
  const isAwaitingProof = /approval|proof/i.test(order.status);
  const canCancel = idx < 3; // before Production starts
  const isShipped = /dispatch|shipped|in transit/i.test(order.status);

  function handleReorder() {
    order.items.forEach((item) => addItem?.(item));
    toast.success("Items added to cart");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/dashboard/orders" className="hover:text-foreground">
          Orders
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{order.id}</span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {order.items[0]?.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {order.id} · Placed {order.date}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{order.status}</Badge>
          <Button variant="outline" size="sm" onClick={handleReorder}>
            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
            Reorder
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={
              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <OrderTimeline currentIndex={idx} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="flex flex-col gap-6">
          {isAwaitingProof && order.proof?.url && (
            <OrderProofPanel proofUrl={order.proof.url} />
          )}

          {/* Artwork */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-base font-semibold text-foreground">
              Artwork
            </h2>
            {order.artwork?.length ? (
              <AttachmentGroup className="mt-3">
                {order.artwork.map((file) => (
                  <Attachment key={file.url} size="sm">
                    <AttachmentMedia variant="image">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    </AttachmentMedia>
                    <AttachmentContent>
                      <AttachmentTitle>{file.name}</AttachmentTitle>
                      <AttachmentDescription>{file.size}</AttachmentDescription>
                    </AttachmentContent>
                  </Attachment>
                ))}
              </AttachmentGroup>
            ) : (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <FileImage className="h-4 w-4" />
                No artwork uploaded for this order.
              </p>
            )}
          </div>

          {/* Order summary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-base font-semibold text-foreground">
              Order summary
            </h2>
            <div className="mt-4 divide-y divide-border">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.optionsLabel && (
                      <p className="text-xs text-muted-foreground">
                        {item.optionsLabel}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium text-foreground">
                    ₦{(item.unitPrice * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₦{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>₦{order.shipping?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-foreground">
                <span>Total</span>
                <span>₦{order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {canCancel && (
            <button
              className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-destructive"
              onClick={() =>
                toast("Cancellation request sent", {
                  description: "Our team will confirm shortly.",
                })
              }
            >
              <XCircle className="h-4 w-4" />
              Cancel this order
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Delivery */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-base font-semibold text-foreground">
              Delivery
            </h2>
            <div className="mt-3 flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-foreground">
                {order.address ?? "No address on file"}
              </p>
            </div>
            {isShipped && order.tracking && (
              <div className="mt-3 flex items-start gap-3 border-t border-border pt-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-foreground">{order.tracking.carrier}</p>
                  <a
                    href={order.tracking.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-primary underline underline-offset-2"
                  >
                    {order.tracking.number}
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ETA {order.estimatedDelivery}
                  </p>
                </div>
              </div>
            )}
          </div>

          <OrderMessagesPanel orderId={order.id} />
        </div>
      </div>
    </div>
  );
}
