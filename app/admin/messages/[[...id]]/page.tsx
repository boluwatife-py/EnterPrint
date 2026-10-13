// app/admin/messages/[[...id]]/page.tsx
import type { Metadata } from "next";
import { AdminMessagesBrowser } from "@/components/admin/messages/admin-messages-browser";

export const metadata: Metadata = {
  title: "Support inbox — EnterPrint Admin",
};

export default async function AdminMessagesPage({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const { id } = await params;

  // Auth/role gating comes from the /admin layout, same as the other admin pages.
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Messages
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer conversations, one per order. Updates arrive live.
        </p>
      </div>
      <AdminMessagesBrowser initialThreadId={id?.[0]} />
    </div>
  );
}
