// components/dashboard/order-messages-panel.tsx — now just a thin wrapper
"use client";

import { mockThreads } from "@/lib/mock-account";
import { ThreadPanel } from "./thread-panel";

export function OrderMessagesPanel({ orderId }: { orderId: string }) {
  const thread = mockThreads.find((t) => t.orderId === orderId);

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="font-serif text-base font-semibold text-foreground">Order messages</h2>
        <p className="text-xs text-muted-foreground">Questions about this specific order go here.</p>
      </div>
      <ThreadPanel thread={thread} emptyLabel="No messages on this order yet." />
    </div>
  );
}