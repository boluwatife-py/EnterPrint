// lib/hooks/use-admin-thread-socket.ts
"use client";

import { useEffect, useRef, useState } from "react";

import type { ThreadMessage } from "@/lib/api/threads-api";
import type { AdminThreadStatus } from "@/lib/api/admin-threads";

/** Viewer-independent thread snapshot pushed by the server. */
export type AdminThreadState = {
  id: string;
  orderId: string;
  status: AdminThreadStatus;
  agentId: string | null;
  agentRole: string | null;
  unreadCount: number;
  adminUnreadCount: number;
  updatedAt: string;
};

export type AdminSocketEvent =
  | {
      type: "thread_activity";
      threadId: string;
      message: ThreadMessage;
      thread: AdminThreadState;
    }
  | { type: "thread_read"; threadId: string; adminUnreadCount: number }
  | { type: "thread_updated"; thread: AdminThreadState };

export type SocketStatus = "connecting" | "open" | "closed";

const PING_EVERY_MS = 25_000;

/**
 * Where the API's websocket lives. Prefer an explicit NEXT_PUBLIC_WS_URL;
 * otherwise derive it from the HTTP API base. If your existing
 * use-thread-socket.ts builds this differently, copy that logic here.
 */
function wsBase(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const api = process.env.NEXT_PUBLIC_API_URL ?? "";
  return api.replace(/^http/, "ws").replace(/\/$/, "");
}

/**
 * One socket for the whole admin inbox. Reconnects with backoff, keeps the
 * connection alive with pings, and tells the caller when it came back so it
 * can resync anything missed while offline.
 */
export function useAdminThreadSocket({
  token,
  onEvent,
  onReconnect,
}: {
  token: string | null;
  onEvent: (event: AdminSocketEvent) => void;
  onReconnect?: () => void;
}): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>("connecting");

  // Latest callbacks without re-opening the socket when they change.
  const onEventRef = useRef(onEvent);
  const onReconnectRef = useRef(onReconnect);
  useEffect(() => {
    onEventRef.current = onEvent;
    onReconnectRef.current = onReconnect;
  });

  useEffect(() => {
    if (!token) return;

    let ws: WebSocket | null = null;
    let stopped = false;
    let attempt = 0;
    let hasOpenedBefore = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;

    const connect = () => {
      setStatus("connecting");
      ws = new WebSocket(
        `${wsBase()}/admin/threads/ws?token=${encodeURIComponent(token)}`,
      );

      ws.onopen = () => {
        attempt = 0;
        setStatus("open");
        if (hasOpenedBefore) onReconnectRef.current?.();
        hasOpenedBefore = true;
        pingTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) ws.send("ping");
        }, PING_EVERY_MS);
      };

      ws.onmessage = (e) => {
        if (e.data === "pong") return;
        try {
          onEventRef.current(JSON.parse(e.data) as AdminSocketEvent);
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onclose = (e) => {
        clearInterval(pingTimer);
        setStatus("closed");
        if (stopped) return;
        // 4401 bad token / 4403 not an admin: retrying can't help. A refreshed
        // access token changes `token`, which re-runs this effect.
        if (e.code === 4401 || e.code === 4403) return;
        const delay = Math.min(15_000, 1000 * 2 ** attempt++);
        retryTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => ws?.close();
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      clearInterval(pingTimer);
      ws?.close();
    };
  }, [token]);

  return status;
}
