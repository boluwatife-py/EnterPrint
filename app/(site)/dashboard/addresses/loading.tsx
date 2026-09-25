// app/dashboard/addresses/loading.tsx
export function AddressesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default AddressesLoading;