import { User } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/time";
import type { AdminThreadListItem } from "@/lib/api/admin-threads";

function previewPrefix(t: AdminThreadListItem): string {
  const type = t.lastMessage?.authorType;
  if (type === "admin") return "Support: ";
  return "";
}

export function AdminThreadListItemRow({
  thread,
  selected,
  onSelect,
}: {
  thread: AdminThreadListItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const hasUnread = thread.adminUnreadCount > 0;
  const who =
    thread.customer.name ?? thread.customer.email ?? "Unknown customer";

  const owner = thread.assignedToMe
    ? "You"
    : thread.agentId
      ? (thread.agentRole ?? "Assigned")
      : null;

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
        <User className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm text-foreground",
              hasUnread ? "font-semibold" : "font-medium",
            )}
          >
            {who}
          </p>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeTime(thread.updatedAt)}
          </span>
        </div>

        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-mono">{thread.orderId}</span>
          <span aria-hidden>·</span>
          {thread.status === "closed" ? (
            <span>Closed</span>
          ) : owner ? (
            <span>{owner}</span>
          ) : (
            <span className="font-medium text-amber-700 dark:text-amber-400">
              Unassigned
            </span>
          )}
        </p>

        <p
          className={cn(
            "mt-1 truncate text-xs",
            hasUnread ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {previewPrefix(thread)}
          {thread.lastMessage?.body ?? "No messages yet"}
        </p>
      </div>

      {hasUnread && (
        <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {thread.adminUnreadCount > 9 ? "9+" : thread.adminUnreadCount}
        </span>
      )}
    </button>
  );
}
