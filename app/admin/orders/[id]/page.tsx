// app/admin/orders/[id]/page.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  File as FileIcon,
  FileVideo,
  ImageOff,
  Loader2,
  Mail,
  MapPin,
  PenLine,
  Phone,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import {
  ORDER_PIPELINE,
  getAdminOrder,
  reverifyAdminOrderPayment,
  updateAdminOrderStatus,
  type AdminArtworkFile,
  type AdminOrderDetail,
  type AdminOrderItem,
  type AdminOrderProof,
  type AdminPaymentEvent,
  type AdminTrackingEvent,
} from "@/lib/api/admin";
import { formatDate, formatNaira } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  OrderStatusBadge,
  PaymentStateBadge,
  ProofStatusBadge,
  WebhookStatusBadge,
} from "@/components/admin/orders/order-status-badge";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "avi", "mkv", "m4v"]);

/**
 * `/uploads/artwork` always reports `kind: "file"`, so (same as the customer
 * order page) preview behaviour is decided from the file extension. Works for
 * names ("logo.png") and URLs ("https://cdn/x/proof.jpg?v=2") alike.
 */
function getFileKind(nameOrUrl: string): "image" | "video" | "file" {
  const clean = nameOrUrl.split("?")[0].split("#")[0];
  const ext = clean.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  return "file";
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

function displayValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  return typeof v === "object" ? JSON.stringify(v) : String(v);
}

/** Tracking-event media is a free-form JSON list: accept plain URLs or {url}. */
function mediaUrl(m: unknown): string | null {
  if (typeof m === "string") return m;
  if (m && typeof m === "object" && typeof (m as { url?: unknown }).url === "string") {
    return (m as { url: string }).url;
  }
  return null;
}

type Preview = {
  name: string;
  url: string;
  size?: string | null;
  /** Decided by the caller (artwork: from the file name; proofs: from the URL). */
  kind: "image" | "video" | "file";
};

/* -------------------------------------------------------------------------- */
/* Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

function Card({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-base font-semibold text-foreground">{title}</h2>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right text-foreground">{children}</span>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to the clipboard.");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={copy}
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function FileThumb({
  file,
  onPreview,
}: {
  file: AdminArtworkFile;
  onPreview: (p: Preview) => void;
}) {
  const kind = getFileKind(file.name);
  return (
    <button
      type="button"
      onClick={() => onPreview({ name: file.name, url: file.url, size: file.size, kind })}
      className="group min-w-0 text-left"
      aria-label={`Preview ${file.name}`}
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary/30 group-hover:border-primary/40">
        {kind === "image" ? (
          <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
        ) : kind === "video" ? (
          <FileVideo className="h-7 w-7 text-muted-foreground" />
        ) : (
          <FileIcon className="h-7 w-7 text-muted-foreground" />
        )}
      </div>
      <p className="mt-1.5 truncate text-xs font-medium text-foreground">{file.name}</p>
      {file.size ? <p className="text-[11px] text-muted-foreground">{file.size}</p> : null}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Items + artwork                                                            */
/* -------------------------------------------------------------------------- */

function ItemArtwork({
  item,
  onPreview,
}: {
  item: AdminOrderItem;
  onPreview: (p: Preview) => void;
}) {
  if (item.artworkType === "upload") {
    const hasFiles = item.artworkFiles.length > 0;
    return (
      <div className="mt-4 space-y-3 rounded-lg border border-border bg-secondary/20 p-3">
        <p className="text-sm font-medium text-foreground">
          Customer artwork
          <span className="ml-2 font-normal text-muted-foreground">
            {item.artworkFiles.length} {item.artworkFiles.length === 1 ? "file" : "files"}
          </span>
        </p>

        {hasFiles ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {item.artworkFiles.map((f) => (
              <FileThumb key={f.id} file={f} onPreview={onPreview} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No files are attached to this item.</p>
        )}

        {item.missingArtworkFileIds.length > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">
                {item.missingArtworkFileIds.length} uploaded{" "}
                {item.missingArtworkFileIds.length === 1 ? "file" : "files"} couldn&apos;t be found
              </p>
              <p className="mt-0.5 break-all font-mono opacity-80">
                {item.missingArtworkFileIds.join(", ")}
              </p>
              <p className="mt-1 opacity-80">
                The customer attached these at checkout but they no longer exist in storage. Ask
                them to re-send the artwork.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (item.artworkType === "design") {
    const brief = item.artworkBrief?.trim();
    return (
      <div className="mt-4 rounded-lg border border-dashed border-border bg-secondary/20 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
            Design requested
          </p>
          {brief ? <CopyButton value={brief} label="design brief" /> : null}
        </div>
        {brief ? (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {brief}
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">No brief was provided.</p>
        )}
      </div>
    );
  }

  return (
    <p className="mt-4 text-xs text-muted-foreground">
      No artwork. The customer didn&apos;t upload files or request a design.
    </p>
  );
}

function OrderItemRow({
  item,
  onPreview,
}: {
  item: AdminOrderItem;
  onPreview: (p: Preview) => void;
}) {
  const options = Object.entries(item.options ?? {});
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary/40">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">{item.productSlug}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-medium text-foreground">{formatNaira(item.lineTotal)}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} × {formatNaira(item.unitPrice)}
              </p>
            </div>
          </div>

          {options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {options.map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-xs text-foreground"
                >
                  <span className="text-muted-foreground">{key}:</span> {displayValue(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <ItemArtwork item={item} onPreview={onPreview} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Proofs + tracking                                                          */
/* -------------------------------------------------------------------------- */

function ProofRow({
  proof,
  isLatest,
  onPreview,
}: {
  proof: AdminOrderProof;
  isLatest: boolean;
  onPreview: (p: Preview) => void;
}) {
  const kind = getFileKind(proof.url);
  const name = `Proof v${proof.version}`;
  return (
    <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <button
        type="button"
        onClick={() => onPreview({ name, url: proof.url, kind })}
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary/30 hover:border-primary/40"
        aria-label={`Preview ${name}`}
      >
        {kind === "image" ? (
          <img src={proof.url} alt={name} className="h-full w-full object-cover" />
        ) : (
          <FileIcon className="h-6 w-6 text-muted-foreground" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">Version {proof.version}</p>
          {isLatest && <Badge variant="secondary">Latest</Badge>}
          <ProofStatusBadge status={proof.status} />
        </div>
        {proof.notes ? (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
            {proof.notes}
          </p>
        ) : null}
        <a
          href={proof.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Open file <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function TrackingList({
  events,
  onPreview,
}: {
  events: AdminTrackingEvent[];
  onPreview: (p: Preview) => void;
}) {
  return (
    <ol className="space-y-4">
      {events.map((e) => {
        const media = (e.media ?? []).map(mediaUrl).filter((u): u is string => !!u);
        return (
          <li key={e.id} className="flex gap-3">
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                e.done ? "bg-primary" : "border border-border bg-background"
              }`}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{e.label}</p>
              <p className="text-xs text-muted-foreground">
                {[e.location, e.date].filter(Boolean).join(" · ")}
                {!e.done ? " · Pending" : ""}
              </p>
              {e.note ? (
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {e.note}
                </p>
              ) : null}
              {media.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {media.map((url, i) =>
                    getFileKind(url) === "image" ? (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onPreview({ name: e.label, url, kind: "image" })}
                        className="h-14 w-14 overflow-hidden rounded-md border border-border"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ) : (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Attachment {i + 1} <ExternalLink className="h-3 w-3" />
                      </a>
                    ),
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PaymentEventRow({ event }: { event: AdminPaymentEvent }) {
  return (
    <li className="rounded-md border border-border bg-secondary/20 p-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-foreground">{event.eventType}</span>
        <WebhookStatusBadge status={event.status} />
      </div>
      <p className="mt-1 text-muted-foreground">
        {formatDateTime(event.createdAt)}
        {event.amount != null ? ` · ${formatNaira(event.amount)}` : ""}
        {event.channel ? ` · ${event.channel.replace(/_/g, " ")}` : ""}
      </p>
      {event.errorMessage ? (
        <p className="mt-1 break-words text-destructive">{event.errorMessage}</p>
      ) : null}
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken, isHydrated } = useAuth();

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    if (!isHydrated || !accessToken) return;
    let cancelled = false;

    async function load(token: string) {
      setLoading(true);
      try {
        const data = await getAdminOrder(token, id);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (cancelled) return;
        if ((err as { status?: number }).status === 404) setNotFoundState(true);
        else toast.error("Couldn't load this order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load(accessToken);
    return () => {
      cancelled = true;
    };
  }, [accessToken, isHydrated, id]);

  async function applyUpdate(
    payload: { status: string },
    successMessage: string,
  ) {
    if (!accessToken || !order) return;
    setUpdating(true);
    try {
      // The endpoint returns the whole refreshed order, so no merge needed.
      setOrder(await updateAdminOrderStatus(accessToken, order.id, payload));
      toast.success(successMessage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update the order.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleReverify() {
    if (!accessToken || !order) return;
    setVerifying(true);
    try {
      const res = await reverifyAdminOrderPayment(accessToken, order.id);
      setOrder(res.order);
      if (res.outcome === "confirmed") toast.success(res.message);
      else toast.info(res.message);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't reach Paystack. Please try again.",
      );
    } finally {
      setVerifying(false);
    }
  }

  function handleStatusChange(next: string) {
    if (!order || next === order.status) return;

    if (next === "Cancelled") {
      const refundNote =
        order.payment.state === "paid"
          ? " The customer has already paid, so you'll need to refund them from the Paystack dashboard."
          : "";
      if (!window.confirm(`Cancel order ${order.id}? The customer is notified.${refundNote}`)) return;
    }
    applyUpdate({ status: next }, `Order moved to ${next}`);
  }

  /* ----------------------------- loading / 404 ---------------------------- */

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (notFoundState || !order) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="font-medium text-foreground">Order not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          There&apos;s no order with the ID {id}.
        </p>
        <Button render={<Link href="/admin/orders" />} className="mt-4">
          Back to orders
        </Button>
      </div>
    );
  }

  const latestProof = order.proofs[0];
  const awaitingPayment = order.status === "Pending Payment";
  const customer = order.customer;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/admin/orders" className="hover:text-foreground">
          Orders
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{order.id}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {order.id}
            </h1>
            <CopyButton value={order.id} label="order ID" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <Badge variant="outline">Artwork: {order.artworkStatus}</Badge>
          <span className="ml-1 text-lg font-semibold text-foreground">
            {formatNaira(order.total)}
          </span>
        </div>
      </div>

      {/* Banners */}
      {order.status === "Cancelled" && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-foreground">This order was cancelled.</p>
        </div>
      )}
      {awaitingPayment && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
            <p className="text-sm text-foreground">
              Waiting for payment. The order moves to Order Received automatically once Paystack
              confirms it. If the customer says they&apos;ve paid, check with Paystack now.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReverify}
            disabled={verifying}
            className="shrink-0 bg-background"
          >
            {verifying ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            Re-verify payment
          </Button>
        </div>
      )}
      {order.awaitingProof && latestProof && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
          <PenLine className="h-5 w-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-foreground">
            Waiting on the customer to approve proof v{latestProof.version}.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* ------------------------------ Main ------------------------------ */}
        <div className="flex min-w-0 flex-col gap-6">
          <Card
            title="Items"
            aside={
              <span className="text-xs text-muted-foreground">
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </span>
            }
          >
            <div className="divide-y divide-border">
              {order.items.map((item, i) => (
                <OrderItemRow key={`${item.productSlug}-${i}`} item={item} onPreview={setPreview} />
              ))}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery ({order.deliveryMethod})</span>
                <span>{formatNaira(order.delivery)}</span>
              </div>
              <div className="flex justify-between font-medium text-foreground">
                <span>Total</span>
                <span>{formatNaira(order.total)}</span>
              </div>
            </div>
          </Card>

          <Card
            title="Proofs"
            aside={
              order.proofs.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {order.proofs.length} {order.proofs.length === 1 ? "version" : "versions"}
                </span>
              ) : undefined
            }
          >
            {order.proofs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No proof has been uploaded yet. Proofs are added from Order Proofs in the data admin.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {order.proofs.map((p, i) => (
                  <ProofRow key={p.id} proof={p} isLatest={i === 0} onPreview={setPreview} />
                ))}
              </div>
            )}
          </Card>

          <Card title="Tracking history">
            {order.tracking.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tracking events yet.</p>
            ) : (
              <TrackingList events={order.tracking} onPreview={setPreview} />
            )}
          </Card>
        </div>

        {/* ------------------------------ Side ------------------------------ */}
        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Update order">
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Production status</p>
                <div className="flex flex-wrap gap-2">
                  {[...ORDER_PIPELINE, "Cancelled"].map((st) => (
                    <Button
                      key={st}
                      size="sm"
                      variant={order.status === st ? "default" : "outline"}
                      disabled={updating || (awaitingPayment && st !== "Cancelled")}
                      onClick={() => handleStatusChange(st)}
                      className={`text-xs ${
                        st === "Cancelled" && order.status !== st
                          ? "text-destructive hover:text-destructive"
                          : ""
                      }`}
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </div>

              {awaitingPayment && (
                <p className="text-xs text-muted-foreground">
                  Production stages unlock once payment is confirmed. You can still cancel an
                  abandoned order.
                </p>
              )}

              {updating && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </p>
              )}
            </div>
          </Card>

          <Card title="Customer">
            {customer.id || customer.email || customer.name ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">{customer.name ?? "No name on file"}</p>
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="flex items-center gap-2 break-all text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {customer.email}
                  </a>
                )}
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {customer.phone}
                  </a>
                )}
                {customer.id && (
                  <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                    <span className="text-xs text-muted-foreground">User ID</span>
                    <span className="flex min-w-0 items-center">
                      <span className="truncate font-mono text-xs text-foreground">{customer.id}</span>
                      <CopyButton value={customer.id} label="user ID" />
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This customer&apos;s account was deleted. The order is kept for records.
              </p>
            )}
          </Card>

          <Card title="Delivery">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-foreground">{order.deliveryAddress}</p>
            </div>
            <div className="mt-3 border-t border-border pt-2">
              <Row label="Method">
                <span className="capitalize">{order.deliveryMethod}</span>
              </Row>
              <Row label="Estimated delivery">{formatDate(order.estimatedDelivery)}</Row>
              <Row label="Courier">
                {order.courier ?? <span className="text-muted-foreground">Not assigned</span>}
              </Row>
              <Row label="Tracking no.">
                {order.trackingNumber ? (
                  <span className="inline-flex items-center">
                    <Truck className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs">{order.trackingNumber}</span>
                    <CopyButton value={order.trackingNumber} label="tracking number" />
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not assigned</span>
                )}
              </Row>
            </div>
          </Card>

          <Card title="Payment" aside={<PaymentStateBadge state={order.payment.state} />}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="flex min-w-0 items-center">
                <span className="truncate font-mono text-xs text-foreground">
                  {order.paymentReference}
                </span>
                <CopyButton value={order.paymentReference} label="payment reference" />
              </span>
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <Row label="Subtotal">{formatNaira(order.subtotal)}</Row>
              <Row label="Delivery">{formatNaira(order.delivery)}</Row>
              <Row label="Total">
                <span className="font-semibold">{formatNaira(order.total)}</span>
              </Row>
              {order.payment.paystackAmount != null && (
                <Row label="Charged by Paystack">{formatNaira(order.payment.paystackAmount)}</Row>
              )}
              {order.payment.channel && (
                <Row label="Channel">
                  <span className="capitalize">{order.payment.channel.replace(/_/g, " ")}</span>
                </Row>
              )}
            </div>

            {order.payment.flags.length > 0 && (
              <div className="mt-3 space-y-2">
                {order.payment.flags.map((flag) => (
                  <div
                    key={flag.code}
                    className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300"
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p className="min-w-0">{flag.message}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 text-sm font-medium text-foreground">Paystack events</p>
              {order.payment.events.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No webhook has arrived for this reference yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {order.payment.events.map((e) => (
                    <PaymentEventRow key={e.id} event={e} />
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* File / proof preview */}
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          {preview && (
            <>
              <DialogTitle className="truncate pr-6">{preview.name}</DialogTitle>
              <div className="mt-2 overflow-hidden rounded-lg border border-border bg-secondary/30">
                {preview.kind === "image" ? (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="max-h-[70vh] w-full object-contain"
                  />
                ) : preview.kind === "video" ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={preview.url} controls className="max-h-[70vh] w-full" />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
                    <FileIcon className="h-8 w-8" />
                    <p>Preview isn&apos;t available for this file type.</p>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{preview.size ?? ""}</p>
                <Button
                  size="sm"
                  variant="outline"
                  render={<a href={preview.url} target="_blank" rel="noreferrer" />}
                >
                  Open original
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
