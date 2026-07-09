"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Loader2, Lock, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 3500;

export function CheckoutFlow() {
  const router = useRouter();
  const { items, subtotal, placeOrder } = useCart();
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Nigeria",
  });

  const total = subtotal + DELIVERY_FEE;

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

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    // Simulated Paystack/Flutterwave payment processing
    setTimeout(() => {
      const fullAddress = `${form.address}, ${form.city}, ${form.country}`;
      const order = placeOrder({
        address: fullAddress,
        delivery: DELIVERY_FEE,
      });
      router.push(`/order-confirmation/${order.id}`);
    }, 2200);
  }

  return (
    <form onSubmit={handlePay} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        {/* Delivery details */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Delivery details
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ada Obi"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ada@brand.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 801 234 5678"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={form.country}
                onValueChange={(v) =>
                  setForm({ ...form, country: v ?? "Nigeria" })
                }
              >
                <SelectTrigger
                  id="country"
                  className="h-11 w-full justify-between px-3.5"
                >
                  <SelectValue className="w-full text-left" />
                </SelectTrigger>
                <SelectContent className="m-0">
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Street address</Label>
              <Input
                id="address"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="12 Admiralty Way, Lekki Phase 1"
                className="h-11"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="city">City / State</Label>
              <Input
                id="city"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Lagos"
                className="h-11"
              />
            </div>
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
              You will be redirected to Paystack to complete payment securely.
              Once payment is confirmed, you will be taken back to your order
              confirmation with the order ID.
            </p>
          </div>
        </section>
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
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-medium text-foreground">
                {formatNaira(DELIVERY_FEE)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd className="text-xl font-bold text-foreground">
                {formatNaira(total)}
              </dd>
            </div>
          </dl>

          <Button
            type="submit"
            size="lg"
            disabled={processing}
            className="mt-5 h-12 w-full text-base"
          >
            {processing ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Processing payment...
              </>
            ) : (
              <>
                <Lock className="mr-1 h-4 w-4" />
                Pay {formatNaira(total)}
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
