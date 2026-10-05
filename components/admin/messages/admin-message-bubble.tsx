import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/utils/time";
import type { ThreadMessage } from "@/lib/api/threads-api";
import { MessageAttachments } from "@/components/dashboard/messages/message-attachments";

/**
 * Admin-side view of a message: the mirror image of the customer bubble.
 * Staff messages sit on the right (primary), the customer's on the left.
 * `system` entries stay centered log lines.
 */
export function AdminMessageBubble({
  message,
  customerName,
  agentRole,
}: {
  message: ThreadMessage;
  customerName: string;
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

  const isStaff = message.authorType === "admin";

  return (
    <div className={cn("flex", isStaff ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isStaff ? "items-end" : "items-start",
        )}
      >
        <span className="px-1 text-xs font-medium text-muted-foreground">
          {isStaff ? (agentRole ?? "Support") : customerName}
        </span>
        <div
          className={cn(
            "flex flex-col gap-2 rounded-2xl px-4 py-2.5 text-sm",
            isStaff
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm border border-border bg-card text-foreground",
          )}
        >
          {message.attachments.length > 0 && (
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
