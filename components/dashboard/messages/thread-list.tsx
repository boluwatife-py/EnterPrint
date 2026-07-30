import { MessageSquare, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ThreadSummary } from "@/lib/api/threads-api";

import { ThreadListItem } from "./thread-list-item";
import { ThreadListSkeleton } from "./thread-list-skeleton";

export function ThreadList({
  threads,
  loading,
  query,
  onQueryChange,
  selectedId,
  onSelect,
  visible,
}: {
  threads: ThreadSummary[];
  loading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col border-border md:border-r",
        visible ? "flex" : "hidden md:flex",
      )}
    >
      <div className="shrink-0 border-b border-border p-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Messages
        </h2>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by order or message…"
            className="h-9 pl-8 text-sm"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <ThreadListSkeleton />
        ) : threads.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {query
                ? "No conversations match your search."
                : "No conversations yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {threads.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                selected={selectedId === thread.id}
                onSelect={() => onSelect(thread.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
