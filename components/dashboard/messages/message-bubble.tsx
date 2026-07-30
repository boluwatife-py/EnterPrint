import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/utils/time";
import type { ThreadMessage } from "@/lib/api/threads-api";

import { MessageAttachments } from "./message-attachments";

/**
 * A single message. `system` entries render as centered log lines (order-
 * lifecycle events), not chat bubbles — they're status updates, not
 * conversation. `customer` and `admin` render as opposing chat bubbles.
 */
export function MessageBubble({
  message,
  agentRole,
}: {
  message: ThreadMessage;
  agentRole: string | null;
}) {
  if (message.authorType === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
          {message.body} · {formatMessageTime(message.createdAt)}
        </span>
      </div>
    );
  }

  const isCustomer = message.authorType === "customer";
  const hasAttachments = message.attachments.length > 0;

  return (
    <div className={cn("flex", isCustomer ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isCustomer ? "items-end" : "items-start",
        )}
      >
        {!isCustomer && (
          <span className="px-1 text-xs font-medium text-muted-foreground">
            {agentRole ?? "Support"}
          </span>
        )}
        <div
          className={cn(
            "flex flex-col gap-2 rounded-2xl px-4 py-2.5 text-sm",
            isCustomer
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm border border-border bg-card text-foreground",
          )}
        >
          {hasAttachments && (
            <MessageAttachments attachments={message.attachments} />
          )}
          {message.body && (
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          )}
        </div>
        <span className="px-1 text-[11px] text-muted-foreground">
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}