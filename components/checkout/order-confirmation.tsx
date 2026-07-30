"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/utils/format";
import { verifyPayment, type Order } from "@/lib/api/orders-api";
import { Button } from "@/components/ui/button";

type State =
  | { step: "verifying" }
  | { step: "confirmed"; order: Order }
  | { step: "failed"; message: string };

export function OrderConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authFetch } = useAuth();
  const { clearCart } = useCart();

  const reference = searchParams.get("reference");
  const [state, setState] = useState<State>({ step: "verifying" });

  // Guards against the effect firing twice in dev (React StrictMode) or on
  // a re-render — verify-payment is rate limited (10/min) and hits Paystack
  // for real, so it should only ever be called once per page load.
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!reference) {
      setState({
        step: "failed",
        message:
          "No payment reference found in the URL. If you completed payment, check your order history instead.",
      });
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    async function run(ref: string) {
      try {
        const order = await verifyPayment(authFetch, ref);

        // Only clear the cart once payment is actually confirmed — if the
        // order is still "Pending Payment" (webhook/Paystack hasn't settled
        // yet) or the user bailed out of Paystack, we don't want to wipe
        // items for an order that didn't go through.
        if (order.status !== "Pending Payment") {
          clearCart();
        }

        setState({ step: "confirmed", order });
      } catch (err) {
        const message = err instanceof Error ? err.message : null;
        setState({
          step: "failed",
          message:
            message ||
            "We couldn't confirm your payment. Please check your order history or contact support.",
        });
      }
    }

    run(reference);
  }, [reference, authFetch, clearCart]);

  if (state.step === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div>
          <p className="font-medium text-foreground">
            Confirming your payment...
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This only takes a moment. Don&apos;t close this page.
          </p>
        </div>
      </div>
    );
  }

  if (state.step === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
        <XCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="font-medium text-foreground">
            We couldn&apos;t confirm your payment
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
        </div>
        <div className="flex gap-3">
          <Button render={<Link href="/account/orders" />} variant="outline">
            View my orders
          </Button>
          <Button render={<Link href="/cart" />}>Back to cart</Button>
        </div>
      </div>
    );
  }

  const { order } = state;
  const isPending = order.status === "Pending Payment";

  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      {isPending ? (
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
      ) : (
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
      )}

      <h1 className="mt-4 text-xl font-semibold text-foreground">
        {isPending ? "Payment still processing" : "Order confirmed"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isPending
          ? "We're still waiting on confirmation from Paystack. This can take a minute — check your order history shortly."
          : `Order ${order.id} has been placed successfully.`}
      </p>

      <dl className="mt-6 space-y-2 rounded-lg border border-border bg-secondary/30 p-4 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Order ID</dt>
          <dd className="font-medium text-foreground">{order.id}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-medium text-foreground">{order.status}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery address</dt>
          <dd className="max-w-[60%] text-right font-medium text-foreground">
            {order.deliveryAddress}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <dt className="font-semibold text-foreground">Total</dt>
          <dd className="text-base font-bold text-foreground">
            {formatNaira(order.total)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex justify-center gap-3">
        <Button render={<Link href={`/dashboard/orders/${order.id}`} />}>
          View order
        </Button>
        {order.threadId && (
          <Button
            render={<Link href={`/dashboard/messages/${order.threadId}`} />}
            variant="outline"
          >
            Track order progress
          </Button>
        )}
      </div>
    </div>
  );
}
