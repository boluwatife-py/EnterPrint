// app/admin/design-requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, PenLine, Search } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import {
  getAdminDesignRequests,
  type AdminDesignRequestCounts,
  type AdminDesignRequestListItem,
  type DesignRequestView,
} from "@/lib/api/admin-design-requests";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DesignRequestStatusBadge,
  budgetLabel,
  projectTypeLabel,
} from "@/components/admin/design-requests/design-request-helpers";

const PAGE_SIZE = 20;

const VIEWS: { key: DesignRequestView; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "closed", label: "Closed" },
];

export default function AdminDesignRequestsPage() {
  const router = useRouter();
  const { accessToken, isHydrated } = useAuth();

  const [items, setItems] = useState<AdminDesignRequestListItem[]>([]);
  const [counts, setCounts] = useState<AdminDesignRequestCounts | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<DesignRequestView>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!isHydrated || !accessToken) return;
    let cancelled = false;
    setLoading(true);

    getAdminDesignRequests(accessToken, view, search, page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setTotal(res.total);
        setCounts(res.counts);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load design requests.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // A slow earlier request must not overwrite a newer one.
    return () => {
      cancelled = true;
    };
  }, [accessToken, isHydrated, view, search, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Design requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Leads from the public design form. Open one to read the brief and follow up.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, company, phone or brief"
            className="h-11 w-full pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {VIEWS.map((v) => {
            const active = view === v.key;
            const n = counts?.[v.key];
            return (
              <button
                key={v.key}
                onClick={() => {
                  setView(v.key);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {v.label}
                {typeof n === "number" && <span className="ml-1 opacity-70">{n}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-card sm:rounded-xl">
        {loading ? (
          <div className="space-y-4 divide-y divide-border p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PenLine className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-foreground">No design requests found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-xs font-semibold text-muted-foreground">
                  <th className="p-4">Requester</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {items.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/admin/design-requests/${r.id}`)}
                    className="cursor-pointer transition-colors hover:bg-muted/60"
                  >
                    <td className="p-4">
                      <p className="font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.company ? `${r.company} · ` : ""}
                        {r.email}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-foreground">{projectTypeLabel(r.projectType)}</p>
                      <p className="line-clamp-1 max-w-[18rem] text-xs text-muted-foreground">
                        {r.briefPreview}
                      </p>
                    </td>
                    <td className="p-4 text-muted-foreground">{budgetLabel(r.budget)}</td>
                    <td className="p-4">
                      <DesignRequestStatusBadge status={r.status} />
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(r.createdAt)}</td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/admin/design-requests/${r.id}`} />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {total} requests
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}