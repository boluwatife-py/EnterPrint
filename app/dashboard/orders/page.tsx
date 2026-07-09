// app/dashboard/orders/page.tsx
import { OrdersBrowser } from "@/components/dashboard/orders-browser";

export default function DashboardOrdersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Your orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every project you've ordered, with live production status.
        </p>
      </div>

      <div className="mt-8">
        <OrdersBrowser />
      </div>
    </div>
  );
}