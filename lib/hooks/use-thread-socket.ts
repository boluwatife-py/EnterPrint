"use client";

import { useEffect, useRef } from "react";

import { getThreadSocketUrl, type ThreadMessage } from "@/lib/api/threads-api";

/**
 * Shape of frames sent from `thread_ws_manager.broadcast()`. Adjust this
 * to match whatever envelope your `app/threads/router.py` actually emits
 * on a new message — this assumes `{ type: "message", message: {...} }`.
 * If the backend just sends the raw message with no envelope, the
 * fallback branch in the handler below covers that too.
 */
type ThreadSocketFrame =
  | { type: "message"; message: ThreadMessage }
  | { type: string; [key: string]: unknown };

type UseThreadSocketOptions = {
  threadId: string | null;
  token: string | null;
  onMessage: (message: ThreadMessage) => void;
  enabled?: boolean;
};

const MAX_RETRY_DELAY_MS = 15000;

/**
 * Opens a WS connection to `/threads/:id/ws` for live push of new
 * messages, reconnecting with backoff if the socket drops (e.g. the
 * worker restarts, or the network blips). Closes and reopens whenever
 * `threadId` changes.
 *
 * Note: the backend broadcast is in-process only (see ws_manager.py's
 * module docstring) — this hook will reconnect fine across worker
 * restarts, but a message posted via a different worker than the one
 * this socket landed on won't be pushed until that gap is closed with
 * Redis pub/sub. The `getThread` fetch on thread-switch is what keeps
 * things eventually consistent in the meantime.
 */
export function useThreadSocket({
  threadId,
  token,
  onMessage,
  enabled = true,
}: UseThreadSocketOptions) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!threadId || !enabled) return;

    let socket: WebSocket | null = null;
    let closedByCleanup = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    function connect() {
      if (!threadId) return;
      socket = new WebSocket(getThreadSocketUrl(threadId, token));

      socket.onopen = () => {
        attempt = 0;
      };

      socket.onmessage = (event) => {
        let frame: ThreadSocketFrame | ThreadMessage;
        try {
          frame = JSON.parse(event.data);
        } catch {
          return; // Malformed frame — drop it, don't crash the socket.
        }

        if ("type" in frame && frame.type === "message" && "message" in frame) {
          onMessageRef.current((frame as { message: ThreadMessage }).message);
        } else if ("id" in frame && "body" in frame) {
          // Fallback: server sent a bare ThreadMessage with no envelope.
          onMessageRef.current(frame as unknown as ThreadMessage);
        }
      };

      socket.onclose = (event) => {
        if (closedByCleanup) return;
        if (event.code === 4401 || event.code === 4404) return; // don't retry auth/not-found
        attempt += 1;
        const delay = Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS);
        retryTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();

    return () => {
      closedByCleanup = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
      socket = null;
    };
  }, [threadId, token, enabled]);
}
