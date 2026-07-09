"use client"

import Link from "next/link"
import Image from "next/image"
import { Trash2, Upload, PenTool, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { getProduct, computePrice } from "@/lib/data"
import { formatNaira } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const DELIVERY_FEE = 3500

export function CartView() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our catalog and customize your first packaging or print order.
        </p>
        <Button render={<Link href="/products" />} size="lg" className="mt-6">
          Browse Products
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    )
  }

  const total = subtotal + DELIVERY_FEE

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {items.map((item) => {
          const product = getProduct(item.productSlug)
          return (
            <div key={item.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="font-semibold text-foreground hover:underline"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {item.optionLabels.map((o) => (
                        <span key={o.label} className="text-xs text-muted-foreground">
                          {o.label}: <span className="text-foreground">{o.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2">
                  {item.artwork.type === "design" ? (
                    <Badge variant="secondary" className="gap-1">
                      <PenTool className="h-3 w-3" /> Design requested
                    </Badge>
                  ) : item.artwork.fileNames && item.artwork.fileNames.length > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      <Upload className="h-3 w-3" /> {item.artwork.fileNames.length} file(s) uploaded
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1 text-accent">
                      Artwork pending
                    </Badge>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  <QuantityControl item={item} product={product} updateQuantity={updateQuantity} />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatNaira(item.unitPrice)} × {item.quantity.toLocaleString()}
                    </p>
                    <p className="font-bold text-foreground">
                      {formatNaira(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Order summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium text-foreground">{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery (est.)</dt>
              <dd className="font-medium text-foreground">{formatNaira(DELIVERY_FEE)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd className="text-xl font-bold text-foreground">{formatNaira(total)}</dd>
            </div>
          </dl>

          <Button render={<Link href="/checkout" />} size="lg" className="mt-5 h-12 w-full text-base">
            Proceed to Checkout
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button render={<Link href="/products" />} variant="ghost" className="mt-2 w-full">
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuantityControl({
  item,
  product,
  updateQuantity,
}: {
  item: ReturnType<typeof useCart>["items"][number]
  product: ReturnType<typeof getProduct>
  updateQuantity: ReturnType<typeof useCart>["updateQuantity"]
}) {
  if (!product) return null
  const tiers = [...product.quantityTiers].sort((a, b) => a.qty - b.qty)

  return (
    <div className="flex flex-wrap gap-1.5">
      {tiers.map((tier) => {
        const isActive = item.quantity === tier.qty
        return (
          <button
            key={tier.qty}
            type="button"
            onClick={() => {
              const { unitPrice } = computePrice(product, item.options, tier.qty)
              updateQuantity(item.id, tier.qty, unitPrice)
            }}
            className={
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors " +
              (isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40")
            }
          >
            {tier.qty.toLocaleString()}
          </button>
        )
      })}
    </div>
  )
}
