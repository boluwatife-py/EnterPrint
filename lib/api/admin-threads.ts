// lib/api/admin-threads.ts
// Mirrors app/threads/admin_schemas.py. Same conventions as lib/api/admin.ts
// (apiFetch + explicit token).
import { apiFetch } from "@/lib/api/api";
import type { ThreadMessage } from "@/lib/api/threads-api";

export type AdminThreadView =
  | "open"
  | "unread"
  | "unassigned"
  | "mine"
  | "closed"
  | "all";

export type AdminThreadStatus = "open" | "closed";

export type AdminThreadCustomer = {
  id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
};

export type AdminThreadOrder = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  itemNames: string[];
  thumbnail?: string | null;
};

type AdminThreadBase = {
  id: string;
  orderId: string;
  status: AdminThreadStatus;
  customer: AdminThreadCustomer;
  agentId: string | null;
  agentRole: string | null;
  assignedToMe: boolean;
  adminUnreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminThreadListItem = AdminThreadBase & {
  orderStatus?: string | null;
  orderTotal?: number | null;
  lastMessage: ThreadMessage | null;
};

export type AdminThreadDetail = AdminThreadBase & {
  order: AdminThreadOrder | null;
  messages: ThreadMessage[];
};

export type AdminThreadCounts = {
  open: number;
  unread: number;
  unassigned: number;
  mine: number;
  closed: number;
};

export type AdminPaginatedThreads = {
  data: AdminThreadListItem[];
  page: number;
  pageSize: number;
  total: number;
  counts: AdminThreadCounts;
};

export async function getAdminThreads(
  token: string,
  view: AdminThreadView = "open",
  search?: string,
  page = 1,
  pageSize = 50,
) {
  const params = new URLSearchParams({
    view,
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) params.append("search", search);
  return apiFetch<AdminPaginatedThreads>(`/admin/threads?${params.toString()}`, {
    token,
  });
}

export async function getAdminThread(token: string, threadId: string) {
  return apiFetch<AdminThreadDetail>(`/admin/threads/${threadId}`, { token });
}

/** Returns the full refreshed thread (incl. the new message). */
export async function sendAdminThreadMessage(
  token: string,
  threadId: string,
  body: string,
  attachmentIds: string[] = [],
) {
  return apiFetch<AdminThreadDetail>(`/admin/threads/${threadId}/messages`, {
    method: "POST",
    body: { body, attachmentIds },
    token,
  });
}

export async function markAdminThreadRead(token: string, threadId: string) {
  return apiFetch<{ adminUnreadCount: number }>(
    `/admin/threads/${threadId}/read`,
    { method: "POST", token },
  );
}

/** Close / reopen, take over, or release a thread. */
export async function updateAdminThread(
  token: string,
  threadId: string,
  payload: { status?: AdminThreadStatus; assignment?: "me" | "unassign" },
) {
  return apiFetch<AdminThreadDetail>(`/admin/threads/${threadId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}
