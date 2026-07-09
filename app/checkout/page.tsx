import type { Metadata } from "next"
import { CheckoutFlow } from "@/components/checkout/checkout-flow"

export const metadata: Metadata = {
  title: "Checkout — EnterPrint",
  description: "Securely complete your packaging and print order.",
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Checkout</h1>
      <p className="mt-1 text-muted-foreground">Enter your delivery details and pay securely.</p>
      <div className="mt-8">
        <CheckoutFlow />
      </div>
    </div>
  )
}
