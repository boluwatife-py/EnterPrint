// components/dashboard/messages-browser.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package, MessageSquare, Plus, Search } from "lucide-react";
import { mockThreads } from "@/lib/mock-account";
import { ThreadPanel } from "./thread-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MessagesBrowser() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(mockThreads[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockThreads;
    return mockThreads.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.messages.some((m) => m.text.toLowerCase().includes(q)),
    );
  }, [query]);

  const selected = mockThreads.find((t) => t.id === selectedId);

  return (
    <div className="grid h-[calc(100dvh-14rem)] min-h-[560px] grid-cols-1 overflow-hidden bg-card md:grid-cols-[320px_1fr]">
      {/* Thread list */}
      <div
        className={cn(
          "flex flex-col border-border md:border-r",
          selectedId ? "hidden md:flex" : "flex",
        )}
      >
        <div className="flex items-center gap-2 border-b border-border p-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages…"
              className="h-9 pl-8 text-sm"
            />
          </div>
          <Button render={<Link href="/contact" />} size="icon" variant="outline" aria-label="Start a new inquiry">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 divide-y divide-border overflow-y-auto">
          {filtered.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No conversations match your search.</p>
          )}
          {filtered.map((thread) => {
            const last = thread.messages[thread.messages.length - 1];
            return (
              <button
                key={thread.id}
                onClick={() => setSelectedId(thread.id)}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/60",
                  selectedId === thread.id && "bg-secondary/60",
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  {thread.orderId ? <Package className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{thread.subject}</p>
                    {thread.unread ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{last?.text}</p>
                  {thread.orderId && (
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{thread.orderId}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active thread */}
      <div className={cn("flex flex-col", selectedId ? "flex" : "hidden md:flex")}>
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{selected.subject}</p>
                {selected.orderId && (
                  <Link href={`/dashboard/orders/${selected.orderId}`} className="text-xs text-primary hover:underline">
                    View order {selected.orderId}
                  </Link>
                )}
              </div>
              <button className="text-sm text-muted-foreground hover:text-foreground md:hidden" onClick={() => setSelectedId(null)}>
                Back
              </button>
            </div>
            <ThreadPanel thread={selected} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Select a conversation to view it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
