import { ProtectedRoute } from "@/components/auth/protected-route";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";

export default function OrderConfirmationPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <OrderConfirmation />
      </div>
    </ProtectedRoute>
  );
}