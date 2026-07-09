// app/dashboard/messages/loading.tsx
export function MessagesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-7 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
      <div className="mt-8 h-[560px] animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default MessagesLoading;