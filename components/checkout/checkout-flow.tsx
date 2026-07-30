"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Loader2,
  Lock,
  ArrowLeft,
  MapPin,
  Plus,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/utils/format";
import {
  listAddresses,
  createAddress,
  type Address,
} from "@/lib/api/account-api";
import { placeOrder, type DeliveryMethod } from "@/lib/api/orders-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Estimated delivery fees shown while the user is picking a method. The
 * backend computes the authoritative `delivery`/`total` on `POST /orders`
 * (these numbers are placeholders pending real delivery pricing per
 * endpoint.md §6), so the summary below is labelled "estimated".
 */
const DELIVERY_ESTIMATES: Record<DeliveryMethod, number> = {
  standard: 4500,
  express: 9000,
};

type NewAddressForm = {
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
};

const emptyNewAddress: NewAddressForm = {
  title: "",
  streetAddress: "",
  city: "",
  state: "",
  country: "Nigeria",
  isDefault: false,
};

export function CheckoutFlow() {
  const router = useRouter();
  const { authFetch } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddressForm>(emptyNewAddress);

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("standard");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryEstimate = DELIVERY_ESTIMATES[deliveryMethod];
  const totalEstimate = subtotal + deliveryEstimate;

  // Load saved addresses once and pre-select the default (backend already
  // sorts default-first, but `.find` is explicit and doesn't rely on that
  // ordering holding forever). No saved addresses -> jump straight to the
  // "add address" form so there's always a path forward.
  useEffect(() => {
    let cancelled = false;

    async function loadAddresses() {
      try {
        const data = await listAddresses(authFetch);
        if (cancelled) return;

        setAddresses(data);

        const defaultAddress = data.find((a) => a.isDefault) ?? data[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else {
          setAddingNewAddress(true);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Couldn't load your saved addresses. You can still add one below.",
          );
          setAddingNewAddress(true);
        }
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    }

    loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium text-foreground">
          Your cart is empty
        </p>
        <Button render={<Link href="/products" />} className="mt-4">
          Browse products
        </Button>
      </div>
    );
  }

  function updateNewAddress<K extends keyof NewAddressForm>(
    key: K,
    value: NewAddressForm[K],
  ) {
    setNewAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    try {
      let deliveryAddressId = selectedAddressId;

      // A new address always has to be persisted first — POST /orders only
      // accepts a `deliveryAddressId` pointing at a saved Address row, there
      // is no one-off/guest address on this backend.
      if (addingNewAddress) {
        if (
          !newAddress.title ||
          !newAddress.streetAddress ||
          !newAddress.city ||
          !newAddress.state
        ) {
          setError(
            "Fill in the address fields, or select a saved address instead.",
          );
          setProcessing(false);
          return;
        }

        const saved = await createAddress(authFetch, newAddress);
        deliveryAddressId = saved.id;
      }

      if (!deliveryAddressId) {
        setError("Select or add a delivery address to continue.");
        setProcessing(false);
        return;
      }

      const order = await placeOrder(
        authFetch,
        items,
        deliveryAddressId,
        deliveryMethod,
      );

      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        router.push(`/order-confirmation/${order.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : null;
      setError(
        message || "Something went wrong placing your order. Please try again.",
      );
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        {/* Delivery address */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Delivery address
          </h2>

          {addressesLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your addresses...
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                    !addingNewAddress && selectedAddressId === address.id
                      ? "border-primary bg-primary/5"
                      : "border-border",
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1"
                    checked={
                      !addingNewAddress && selectedAddressId === address.id
                    }
                    onChange={() => {
                      setSelectedAddressId(address.id);
                      setAddingNewAddress(false);
                    }}
                  />
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {address.title}
                      {address.isDefault && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {address.streetAddress}, {address.city}, {address.state},{" "}
                      {address.country}
                    </p>
                  </div>
                </label>
              ))}

              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 text-sm transition-colors",
                  addingNewAddress
                    ? "border-primary bg-primary/5"
                    : "border-border",
                )}
              >
                <input
                  type="radio"
                  name="address"
                  checked={addingNewAddress}
                  onChange={() => setAddingNewAddress(true)}
                />
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  Use a new address
                </span>
              </label>

              {addingNewAddress && (
                <div className="grid gap-4 rounded-lg border border-border bg-secondary/30 p-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Label</Label>
                    <Input
                      id="title"
                      required
                      value={newAddress.title}
                      onChange={(e) =>
                        updateNewAddress("title", e.target.value)
                      }
                      placeholder="Home, Office..."
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="streetAddress">Street address</Label>
                    <Input
                      id="streetAddress"
                      required
                      value={newAddress.streetAddress}
                      onChange={(e) =>
                        updateNewAddress("streetAddress", e.target.value)
                      }
                      placeholder="14 Awolowo Road, Flat 3B"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      required
                      value={newAddress.city}
                      onChange={(e) => updateNewAddress("city", e.target.value)}
                      placeholder="Ikoyi"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      required
                      value={newAddress.state}
                      onChange={(e) =>
                        updateNewAddress("state", e.target.value)
                      }
                      placeholder="Lagos"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newAddress.country}
                      onChange={(e) =>
                        updateNewAddress("country", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) =>
                        updateNewAddress("isDefault", e.target.checked)
                      }
                    />
                    Save to my account &amp; set as default delivery address
                  </label>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Delivery method */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Delivery method
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["standard", "express"] as const).map((method) => (
              <label
                key={method}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border p-4 text-sm transition-colors",
                  deliveryMethod === method
                    ? "border-primary bg-primary/5"
                    : "border-border",
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === method}
                    onChange={() => setDeliveryMethod(method)}
                  />
                  <span className="capitalize font-medium text-foreground">
                    {method}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  ~{formatNaira(DELIVERY_ESTIMATES[method])}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Payment</h2>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Secure checkout via Paystack
            </span>
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            <p>
              You&apos;ll be redirected to Paystack to complete payment
              securely. Once payment is confirmed, you&apos;ll be taken back to
              your order confirmation with the order ID.
            </p>
          </div>
        </section>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* Summary + pay */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Order summary</h2>

          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-foreground leading-tight">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity.toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatNaira(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium text-foreground">
                {formatNaira(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery (est.)</dt>
              <dd className="font-medium text-foreground">
                {formatNaira(deliveryEstimate)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <dt className="font-semibold text-foreground">Estimated total</dt>
              <dd className="text-xl font-bold text-foreground">
                {formatNaira(totalEstimate)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">
            Final pricing is confirmed by the server before you&apos;re sent to
            Paystack.
          </p>

          <Button
            type="submit"
            size="lg"
            disabled={processing || addressesLoading}
            className="mt-5 h-12 w-full text-base"
          >
            {processing ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Placing order...
              </>
            ) : (
              <>
                <Lock className="mr-1 h-4 w-4" />
                Continue to payment
              </>
            )}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Payments are encrypted and secure
          </p>
          <Button
            render={<Link href="/cart" />}
            variant="ghost"
            className="mt-1 w-full text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to cart
          </Button>
        </div>
      </div>
    </form>
  );
}
