import type { Metadata } from "next"
import { CartView } from "@/components/cart/cart-view"

export const metadata: Metadata = {
  title: "Cart — EnterPrint",
  description: "Review your packaging and print order before checkout.",
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Cart</h1>
      <p className="mt-1 text-muted-foreground">Review your items and adjust quantities before checkout.</p>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  )
}
