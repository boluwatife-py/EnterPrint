// components/layout/site-header-skeleton.tsx
export function SiteHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="hidden items-center gap-6 md:flex">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-9 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      </div>
    </header>
  );
}
