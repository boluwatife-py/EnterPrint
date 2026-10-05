"use client";

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";

import type { ThreadMessage } from "@/lib/api/threads-api";
import { AdminMessageBubble } from "./admin-message-bubble";

/** `min-h-0` matters here for the same reason as the customer MessageLog:
 *  without it the list grows the column instead of scrolling. */
export function AdminMessageLog({
  threadId,
  messages,
  customerName,
  agentRole,
}: {
  threadId: string;
  messages: ThreadMessage[];
  customerName: string;
  agentRole: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [threadId, messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
        <MessageSquare className="h-6 w-6" />
        <p>No messages in this thread yet.</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
    >
      {messages.map((m) => (
        <AdminMessageBubble
          key={m.id}
          message={m}
          customerName={customerName}
          agentRole={agentRole}
        />
      ))}
    </div>
  );
}
