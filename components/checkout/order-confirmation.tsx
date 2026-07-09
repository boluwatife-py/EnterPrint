"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Package, MessageSquare, MapPin, Calendar } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatNaira, formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"

export function OrderConfirmation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { orders } = useCart()
  const order = orders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium text-foreground">Order not found</p>
        <p className="mt-1 text-muted-foreground">We couldn&apos;t find that order in your account.</p>
        <Button render={<Link href="/dashboard" />} className="mt-4">
          Go to dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">Payment successful</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you! Your order <span className="font-semibold text-foreground">{order.id}</span> has been
          received and payment confirmed.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-sm text-muted-foreground">Order number</p>
            <p className="font-semibold text-foreground">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total paid</p>
            <p className="text-lg font-bold text-foreground">{formatNaira(order.total)}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty {item.quantity.toLocaleString()}</p>
              </div>
              <span className="font-medium text-foreground">
                {formatNaira(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Delivery address</p>
              <p className="text-sm text-foreground">{order.deliveryAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Estimated delivery</p>
              <p className="text-sm text-foreground">{formatDate(order.estimatedDelivery)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button render={<Link href={`/track-order/${order.id}`} />} size="lg" className="flex-1">
          <Package className="mr-1 h-4 w-4" />
          Track this order
        </Button>
        <Button render={<Link href="/dashboard/support" />} variant="outline" size="lg" className="flex-1 bg-transparent">
          <MessageSquare className="mr-1 h-4 w-4" />
          Contact support
        </Button>
      </div>
    </div>
  )
}
