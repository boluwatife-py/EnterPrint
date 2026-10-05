// app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, PackageCheck, X, ChevronLeft, ChevronRight, ImageOff, PenLine } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getAdminOrders, type AdminOrderListItem } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { formatNaira, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function AdminOrdersPage() {
  const router = useRouter();
  const { accessToken, isHydrated } = useAuth();

  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

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

    getAdminOrders(accessToken, selectedStatus, search, page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data);
        setTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load customer orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // A slow earlier request must not overwrite a newer one.
    return () => {
      cancelled = true;
    };
  }, [accessToken, isHydrated, selectedStatus, search, page]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setSelectedStatus("all");
    setPage(1);
  };

  const hasActiveFilters = searchInput || selectedStatus !== "all";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open an order to see the customer, artwork, proofs, payment and delivery details.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order ID, customer email, payment ref or tracking no."
            className="h-11 pl-9 w-full"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val || "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48 h-10">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="awaiting-proof">Awaiting proof</SelectItem>
              <SelectItem value="in-production">In production</SelectItem>
              <SelectItem value="shipped">Shipped / dispatched</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground h-10 px-2 w-full sm:w-auto justify-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm sm:rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageCheck className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium text-foreground">No orders found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-xs font-semibold text-muted-foreground">
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Delivery</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="cursor-pointer hover:bg-muted/60 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-mono font-medium text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      {order.customerName || order.customerEmail ? (
                        <>
                          <p className="text-foreground">{order.customerName ?? order.customerEmail}</p>
                          {order.customerName && order.customerEmail && (
                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Account deleted</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/40">
                          {order.thumbnail ? (
                            <img src={order.thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[14rem] truncate text-foreground">{order.itemNames[0]}</p>
                          {order.itemCount > 1 && (
                            <p className="text-xs text-muted-foreground">
                              +{order.itemCount - 1} more
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-foreground">{formatNaira(order.total)}</td>
                    <td className="p-4 capitalize text-muted-foreground">{order.deliveryMethod}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <OrderStatusBadge status={order.status} />
                        {order.awaitingProof && (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-400">
                            Proof pending
                          </Badge>
                        )}
                        {order.hasDesignRequest && (
                          <Badge variant="outline" className="gap-1">
                            <PenLine className="h-3 w-3" />
                            Design
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/admin/orders/${order.id}`} />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {total} orders
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
