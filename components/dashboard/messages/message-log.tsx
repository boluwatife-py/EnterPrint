"use client";

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";

import type { ThreadMessage } from "@/lib/api/threads-api";

import { MessageBubble } from "./message-bubble";

/**
 * Scrollable message history for the active thread.
 *
 * `min-h-0` here (and on the flex-col ancestor in messages-browser.tsx) is
 * load-bearing: without it, a flex child with `flex-1 overflow-y-auto`
 * still sizes to its content's min-content height, so once the message
 * list gets tall it grows the whole column instead of scrolling — which
 * is what was pushing the composer off-screen.
 */
export function MessageLog({
  messages,
  agentRole,
}: {
  messages: ThreadMessage[];
  agentRole: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
        <MessageSquare className="h-6 w-6" />
        <p>No messages yet — say hello below.</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          agentRole={agentRole}
        />
      ))}
    </div>
  );
}