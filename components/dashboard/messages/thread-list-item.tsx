import { Package } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/time";
import type { ThreadSummary } from "@/lib/api/threads-api";

export function ThreadListItem({
  thread,
  selected,
  onSelect,
}: {
  thread: ThreadSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  const hasUnread = thread.unreadCount > 0;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/60",
        selected && "bg-secondary/60",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          hasUnread
            ? "bg-primary/15 text-primary"
            : "bg-secondary text-muted-foreground",
        )}
      >
        <Package className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm",
              hasUnread
                ? "font-semibold text-foreground"
                : "font-medium text-foreground",
            )}
          >
            {thread.orderId}
          </p>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeTime(thread.updatedAt)}
          </span>
        </div>
        <p
          className={cn(
            "mt-0.5 truncate text-xs",
            hasUnread ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {thread.lastMessage?.authorType === "customer" ? "You: " : ""}
          {thread.lastMessage?.body ?? "No messages yet"}
        </p>
      </div>
      {hasUnread && (
        <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {thread.unreadCount > 9 ? "9+" : thread.unreadCount}
        </span>
      )}
    </button>
  );
}
