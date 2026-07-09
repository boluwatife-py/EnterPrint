import { OrderConfirmation } from "@/components/checkout/order-confirmation"

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <OrderConfirmation params={params} />
    </div>
  )
}
