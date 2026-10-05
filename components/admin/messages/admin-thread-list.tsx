import { MessageSquare, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  AdminThreadCounts,
  AdminThreadListItem,
  AdminThreadView,
} from "@/lib/api/admin-threads";
import type { SocketStatus } from "@/lib/hooks/use-admin-thread-socket";

import { ThreadListSkeleton } from "@/components/dashboard/messages/thread-list-skeleton";
import { AdminThreadListItemRow } from "./admin-thread-list-item";

const VIEWS: { key: AdminThreadView; label: string; count?: keyof AdminThreadCounts }[] = [
  { key: "open", label: "Open", count: "open" },
  { key: "unread", label: "Unread", count: "unread" },
  { key: "unassigned", label: "Unassigned", count: "unassigned" },
  { key: "mine", label: "Mine", count: "mine" },
  { key: "closed", label: "Closed", count: "closed" },
];

const STATUS_LABEL: Record<SocketStatus, string> = {
  open: "Live",
  connecting: "Connecting…",
  closed: "Reconnecting…",
};

export function AdminThreadList({
  threads,
  counts,
  loading,
  view,
  onViewChange,
  query,
  onQueryChange,
  selectedId,
  onSelect,
  visible,
  socketStatus,
}: {
  threads: AdminThreadListItem[];
  counts: AdminThreadCounts | null;
  loading: boolean;
  view: AdminThreadView;
  onViewChange: (v: AdminThreadView) => void;
  query: string;
  onQueryChange: (v: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  visible: boolean;
  socketStatus: SocketStatus;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col border-border md:border-r",
        visible ? "flex" : "hidden md:flex",
      )}
    >
      <div className="shrink-0 space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Support inbox
          </h2>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                socketStatus === "open"
                  ? "bg-emerald-500"
                  : "animate-pulse bg-amber-500",
              )}
            />
            {STATUS_LABEL[socketStatus]}
          </span>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search customer, order or message…"
            className="h-9 pl-8 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {VIEWS.map((v) => {
            const n = v.count && counts ? counts[v.count] : null;
            const active = view === v.key;
            return (
              <button
                key={v.key}
                onClick={() => onViewChange(v.key)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {v.label}
                {n !== null && n > 0 && (
                  <span className={cn("ml-1", active ? "opacity-90" : "opacity-70")}>
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <ThreadListSkeleton />
        ) : threads.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {query ? "No conversations match your search." : "Nothing here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {threads.map((t) => (
              <AdminThreadListItemRow
                key={t.id}
                thread={t}
                selected={selectedId === t.id}
                onSelect={() => onSelect(t.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
