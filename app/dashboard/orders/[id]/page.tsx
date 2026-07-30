// app/dashboard/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  Truck,
  RefreshCcw,
  XCircle,
  MapPin,
  FileVideo,
  File as FileIcon,
  Loader2,
  PenLine,
  MessageSquare,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import {
  getOrder,
  getOrderProof,
  reorderOrder,
  type Order,
  type OrderProof,
  type ArtworkFile,
  approveOrderProof,
  rejectOrderProof,
} from "@/lib/api/orders-api";
import { formatNaira, formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Attachment,
  AttachmentTrigger,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentGroup,
} from "@/components/ui/attachment";
import { OrderTimeline } from "@/components/dashboard/orders/order-timeline";
import { OrderProofPanel } from "@/components/dashboard/orders/order-proof-panel";
import { toast } from "sonner";

/** Orders in these statuses can no longer be cancelled, per POST /orders/:id/cancel's 409 rule. */
const NON_CANCELLABLE_STATUSES = new Set(["Dispatch", "Delivery", "Cancelled"]);
const SHIPPED_STATUSES = new Set(["Dispatch", "Delivery"]);

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif",
]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "avi", "mkv", "m4v"]);

/**
 * `/uploads/artwork` always reports `kind: "file"` — it has no real
 * MIME-based detection (unlike `/uploads/attachments`, per endpoint.md §5).
 * So the preview/dialog behavior below is decided from the file extension
 * instead of trusting `file.kind`.
 */
function getFileKind(fileName: string): "image" | "video" | "file" {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  return "file";
}

/**
 * One item's artwork files, rendered as a horizontally-scrollable
 * attachment group. Clicking a file opens a dialog with the actual media
 * (image/video) rather than navigating away — non-previewable files fall
 * back to an "open in new tab" link inside the dialog.
 */
function ItemArtwork({ files }: { files: ArtworkFile[] }) {
  const [selected, setSelected] = useState<ArtworkFile | null>(null);
  const selectedKind = selected ? getFileKind(selected.name) : null;

  return (
    <>
      <AttachmentGroup className="mt-2 w-full min-w-0 overflow-x-auto">
        {files.map((file) => {
          const kind = getFileKind(file.name);
          return (
            <Attachment
              key={file.id}
              size="sm"
              orientation="horizontal"
              className="cursor-pointer"
            >
              <AttachmentTrigger
                onClick={() => setSelected(file)}
                aria-label={`Preview ${file.name}`}
                className="cursor-pointer"
              />
              <AttachmentMedia variant={kind === "image" ? "image" : "icon"}>
                {kind === "image" ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : kind === "video" ? (
                  <FileVideo className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{file.name}</AttachmentTitle>
                <AttachmentDescription>{file.size}</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          );
        })}
      </AttachmentGroup>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogTitle className="truncate pr-6">
                {selected.name}
              </DialogTitle>
              <div className="mt-2 overflow-hidden rounded-lg border border-border bg-secondary/30">
                {selectedKind === "image" ? (
                  <img
                    src={selected.url}
                    alt={selected.name}
                    className="max-h-[70vh] w-full object-contain"
                  />
                ) : selectedKind === "video" ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={selected.url}
                    controls
                    className="max-h-[70vh] w-full"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
                    <FileIcon className="h-8 w-8" />
                    <p>Preview isn&apos;t available for this file type.</p>
                    <Button
                      render={
                        <a
                          href={selected.url}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                      size="sm"
                      variant="outline"
                    >
                      Open in new tab
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {selected.size}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { authFetch } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [proof, setProof] = useState<OrderProof | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getOrder(authFetch, id);
        if (cancelled) return;
        console.log(data);
        setOrder(data);

        // Proof 404s until the studio has uploaded one — that's an expected
        // "no proof yet" state, not an error to surface to the customer.
        try {
          const proofData = await getOrderProof(authFetch, id);
          if (!cancelled) setProof(proofData);
        } catch {
          if (!cancelled) setProof(null);
        }
      } catch (err) {
        if (!cancelled) {
          const status = (err as { status?: number }).status;
          if (status === 404) setNotFoundState(true);
          else toast.error("Couldn't load this order.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, id]);

  /**
   * Every handler below guards on `order` itself, even though the render
   * path already bailed out earlier if it was null — TypeScript doesn't
   * carry that narrowing into separately-declared function closures (the
   * state could theoretically change between renders), so each handler
   * needs its own check before touching `order.id`.
   */
  async function handleReorder() {
    if (!order) return;
    setReordering(true);
    try {
      const result = await reorderOrder(authFetch, order.id);
      window.location.href = result.paymentUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : null;
      toast.error(
        message ||
          "Couldn't reorder — none of the items may still be available.",
      );
      setReordering(false);
    }
  }

  async function handleApproveProof() {
    if (!order) return;
    try {
      const { artworkStatus } = await approveOrderProof(authFetch, order.id);
      setOrder((prev) => (prev ? { ...prev, artworkStatus } : prev));
      // Proof is resolved -- flip local status so isAwaitingProof recomputes
      // false and the panel unmounts, without needing a full refetch.
      setProof((prev) => (prev ? { ...prev, status: "approved" } : prev));
      toast.success("Proof approved");
    } catch {
      toast.error("Couldn't approve the proof. Please try again.");
    }
  }

  async function handleRejectProof(reason: string) {
    if (!order) return;
    try {
      const { artworkStatus } = await rejectOrderProof(
        authFetch,
        order.id,
        reason,
      );
      setOrder((prev) => (prev ? { ...prev, artworkStatus } : prev));
      setProof((prev) => (prev ? { ...prev, status: "rejected" } : prev));
      toast.success("Feedback sent to the studio");
    } catch {
      toast.error("Couldn't send that feedback. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading order...
      </div>
    );
  }

  if (notFoundState || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-medium text-foreground">Order not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This order doesn&apos;t exist, or doesn&apos;t belong to your account.
        </p>
        <Button render={<Link href="/dashboard/orders" />} className="mt-4">
          Back to orders
        </Button>
      </div>
    );
  }

  const isAwaitingProof = proof?.status === "awaiting_approval";
  const isShipped = SHIPPED_STATUSES.has(order.status);
  // Computed for future use (e.g. a cancel action) — not currently wired to
  // a button in this version of the page.
  const canCancel = !NON_CANCELLABLE_STATUSES.has(order.status);

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
            {order.id}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {order.items.map((item) => item.name).join(", ")}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{order.status}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReorder}
            disabled={reordering}
          >
            {reordering ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-3.5 w-3.5" />
            )}
            Reorder
          </Button>
        </div>
      </div>

      {order.status === "Cancelled" ? (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <XCircle className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-foreground">
              This order was cancelled
            </p>
            <p className="text-xs text-muted-foreground">
              No further updates will be added to this order.
            </p>
          </div>
        </div>
      ) : order.status === "Pending Payment" ? (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-6">
          <Loader2 className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Waiting for payment
            </p>
            <p className="text-xs text-muted-foreground">
              Production will begin once payment is confirmed.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <OrderTimeline status={order.status} hasPendingProof={proof?.status === "awaiting_approval"} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="flex flex-col gap-6 min-w-0">
          {/* Proof panel is order-level (the studio's proof, not the
              customer's original upload), so it stays separate from the
              per-item artwork below.

              NOTE: OrderProofPanel currently only accepts `proofUrl` — the
              approve/reject wiring (handleApproveProof/handleRejectProof)
              from an earlier pass assumed a richer prop shape that doesn't
              exist on the real component yet. Share order-proof-panel.tsx
              if you want approve/reject buttons added inside it. */}
          {isAwaitingProof && proof && (
            <OrderProofPanel
              proof={proof}
              onApprove={handleApproveProof}
              onReject={handleRejectProof}
            />
          )}

          {/* Order summary — each item shows its own artwork inline, since
              artwork is per-item data, not order-wide. */}
          <div className="rounded-xl border border-border bg-card p-5 min-w-0">
            <h2 className="font-serif text-base font-semibold text-foreground">
              Order summary
            </h2>
            <div className="mt-4 divide-y divide-border">
              {order.items.map((item, i) => {
                const optionsLabel = Object.values(item.options).join(" · ");
                return (
                  <div key={i} className="py-3 min-w-0">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        {optionsLabel && (
                          <p className="text-xs text-muted-foreground">
                            {optionsLabel}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 font-medium text-foreground">
                        {formatNaira(item.unitPrice * item.quantity)}
                      </p>
                    </div>

                    {/* Artwork — three distinct states per item:
                        "upload" -> the customer's files, previewable in a dialog
                        "design" -> no files; show what they briefed our design team on
                        "none"   -> nothing to show, render nothing */}
                    {item.artworkType === "upload" &&
                      item.artworkFiles.length > 0 && (
                        <ItemArtwork files={item.artworkFiles} />
                      )}
                    {item.artworkType === "design" && (
                      <div className="mt-2 flex items-start gap-2 rounded-lg border border-dashed border-border bg-secondary/30 p-3">
                        <PenLine className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 text-xs">
                          <p className="font-medium text-foreground">
                            Design requested
                          </p>
                          {item.artworkBrief && (
                            <p className="mt-0.5 text-muted-foreground">
                              {item.artworkBrief}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>{formatNaira(order.delivery)}</span>
              </div>
              <div className="flex justify-between font-medium text-foreground">
                <span>Total</span>
                <span>{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Delivery */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-base font-semibold text-foreground">
              Delivery
            </h2>
            <div className="mt-3 flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-foreground">{order.deliveryAddress}</p>
            </div>
            {isShipped && (
              <div className="mt-3 flex items-start gap-3 border-t border-border pt-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  ETA {formatDate(order.estimatedDelivery)}
                </p>
              </div>
            )}
          </div>

          {order.threadId && (
            <Link
              href={`/dashboard/messages/${order.threadId}`}
              className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" />
                    {order.unreadMessageCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                        {order.unreadMessageCount > 9
                          ? "9+"
                          : order.unreadMessageCount}
                      </span>
                    )}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      Order updates & messages
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Proofs, status changes & support replies
                    </p>
                  </div>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>

              {order.unreadMessageCount > 0 && (
                <span className="absolute right-5 top-5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground sm:hidden">
                  {order.unreadMessageCount} new
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
