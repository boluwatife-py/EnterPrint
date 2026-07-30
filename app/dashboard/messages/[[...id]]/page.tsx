// app/dashboard/messages/[[...id]]/page.tsx
import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MessagesBrowser } from "@/components/dashboard/messages/messages-browser";

export const metadata: Metadata = {
  title: "Messages — EnterPrint",
};

export default async function DashboardMessagesPage({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <MessagesBrowser initialThreadId={id?.[0]} />
      </div>
    </ProtectedRoute>
  );
}