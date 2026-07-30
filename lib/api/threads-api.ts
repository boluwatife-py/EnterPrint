// Typed API layer for support threads (order messaging).
//
// Reads + writes needed by the messages inbox/thread view: list, get,
// mark-read, send (with optional attachments), and the attachment upload
// that backs `attachmentIds` on send. The live WS connection for push
// updates is opened separately via `lib/hooks/use-thread-socket.ts`, using
// `getThreadSocketUrl()` below.

import type { AuthFetch } from "@/lib/api/account-api";
import { API_BASE_URL } from "@/lib/api/api";

export type MessageAttachment = {
  id: string;
  name: string;
  url: string;
  kind: "image" | "video" | "file";
  size: string;
};

export type ThreadMessage = {
  id: string;
  authorType: "customer" | "admin" | "system";
  authorId: string | null;
  body: string;
  attachments: MessageAttachment[];
  createdAt: string;
};

export type Thread = {
  id: string;
  orderId: string;
  customerId: string;
  agentId: string | null;
  agentRole: string | null;
  unreadCount: number;
  messages: ThreadMessage[];
  createdAt: string;
  updatedAt: string;
};

/**
 * GET /threads/:id — full thread with message history. Load this once up
 * front, then open the WS socket (see use-thread-socket.ts) for anything
 * posted after.
 */
export function getThread(
  authFetch: AuthFetch,
  threadId: string,
  options: { signal?: AbortSignal } = {},
) {
  return authFetch<Thread>(`/threads/${threadId}`, { signal: options.signal });
}

export type ThreadSummary = {
  id: string;
  orderId: string;
  customerId: string;
  agentId: string | null;
  agentRole: string | null;
  unreadCount: number;
  lastMessage: ThreadMessage | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedThreads = {
  data: ThreadSummary[];
  page: number;
  pageSize: number;
  total: number;
};

/** GET /threads — inbox list view. Customers see only their own threads. */
export function listThreads(
  authFetch: AuthFetch,
  params: { page?: number; pageSize?: number } = {},
) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return authFetch<PaginatedThreads>(`/threads${qs ? `?${qs}` : ""}`);
}

/** POST /threads/:id/read — resets unreadCount to 0 for the calling customer. */
export function markThreadRead(authFetch: AuthFetch, threadId: string) {
  return authFetch<{ unreadCount: number }>(`/threads/${threadId}/read`, {
    method: "POST",
  });
}

/**
 * POST /threads/:id/messages — returns the FULL thread (not just the new
 * message), so the caller can replace state directly with the response
 * rather than manually appending and risking a duplicate once the WS echo
 * arrives. (The WS push is deduped by message id anyway — see
 * `mergeThreadMessage` in messages-browser.tsx.)
 *
 * `body` is required server-side (min length 1) even when attachmentIds
 * is non-empty — an attachment-only send still needs *some* body text.
 * The component supplies a fallback string when the draft is empty.
 */
export function sendMessage(
  authFetch: AuthFetch,
  threadId: string,
  body: string,
  attachmentIds: string[] = [],
) {
  return authFetch<Thread>(`/threads/${threadId}/messages`, {
    method: "POST",
    body: { body, attachmentIds },
  });
}

export type AttachmentUploadResult = {
  files: MessageAttachment[];
};

export function uploadAttachments(authFetch: AuthFetch, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return authFetch<AttachmentUploadResult>(`/uploads/attachments`, {
    method: "POST",
    body: formData as unknown as Record<string, unknown>,
  });
}

/**
 * Builds the ws(s):// URL for `GET /threads/:id/ws`, mirroring whatever
 * HTTP API base the rest of this file talks to. Adjust the env var name
 * here if your app uses a different one for the API base URL.
 *
 * Browsers can't send custom headers on the WS handshake, so the auth
 * token is passed as a query param instead — make sure the FastAPI ws
 * route reads it from there (or swap this for cookie-based auth if your
 * backend supports it).
 */
export function getThreadSocketUrl(threadId: string, token: string | null) {
  const wsBase = API_BASE_URL.replace(/^http/, "ws").replace(/\/$/, "");
  const url = new URL(`${wsBase}/threads/${threadId}/ws`);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}