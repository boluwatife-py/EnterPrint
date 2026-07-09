// app/dashboard/addresses/page.tsx
import { AddressesBrowser } from "@/components/dashboard/addresses-browser";

export default function DashboardAddressesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Saved addresses
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the delivery addresses on your account.
        </p>
      </div>

      <div className="mt-8">
        <AddressesBrowser />
      </div>
    </div>
  );
}