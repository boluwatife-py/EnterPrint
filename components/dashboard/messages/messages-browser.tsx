"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import {
  listThreads,
  getThread,
  markThreadRead,
  sendMessage,
  uploadAttachments,
  type ThreadSummary,
  type Thread,
  type ThreadMessage,
} from "@/lib/api/threads-api";
import { useThreadSocket } from "@/lib/hooks/use-thread-socket";

import { ThreadList } from "./thread-list";
import { ThreadPanel, MAX_PENDING_FILES } from "./thread-panel";
import type { PendingFile } from "./pending-attachments";

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024; // 15MB, matches /uploads/attachments

/** Appends `message` to `thread`, or replaces it in place if the id already
 * exists — keeps the HTTP send response and the WS echo of that same
 * message from producing a duplicate bubble. */
function mergeThreadMessage(thread: Thread, message: ThreadMessage): Thread {
  const exists = thread.messages.some((m) => m.id === message.id);
  return {
    ...thread,
    messages: exists
      ? thread.messages.map((m) => (m.id === message.id ? message : m))
      : [...thread.messages, message],
    updatedAt: message.createdAt,
  };
}

export function MessagesBrowser({
  initialThreadId,
}: { initialThreadId?: string } = {}) {
  // NOTE: assumes useAuth() also exposes a raw `token` for the WS query
  // param (browsers can't send custom headers on the WS handshake, so it
  // can't just ride along on authFetch like the HTTP calls below do).
  // Swap `token` for whatever your auth-context actually calls it.
  const { authFetch, accessToken } = useAuth();
  const router = useRouter();

  const [summaries, setSummaries] = useState<ThreadSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [query, setQuery] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(
    initialThreadId ?? null,
  );
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);

  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [sending, setSending] = useState(false);

  // Keep local selection in sync with the URL — this is now the ONLY place
  // selectedId gets set. The URL is the single source of truth: clicking a
  // thread just navigates, and this effect picks up the resulting param
  // change. That avoids the old race where a local setSelectedId() and the
  // router transition each triggered their own fetch/loading cycle.
  useEffect(() => {
    setSelectedId(initialThreadId ?? null);
  }, [initialThreadId]);

  const selectThread = useCallback(
    (id: string | null, options: { replace?: boolean } = {}) => {
      const url = id ? `/dashboard/messages/${id}` : "/dashboard/messages";
      if (options.replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router],
  );

  // Load the inbox once on mount.
  useEffect(() => {
    let cancelled = false;
    listThreads(authFetch, { pageSize: 50 })
      .then((res) => {
        if (cancelled) return;
        setSummaries(res.data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Couldn't load your messages.");
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  // Load full thread + mark read whenever selection changes. Cancels the
  // in-flight request on cleanup so a fast thread switch can't let a stale
  // response land after a newer one.
  useEffect(() => {
    if (!selectedId) {
      setActiveThread(null);
      return;
    }

    const controller = new AbortController();
    const requestedId = selectedId;
    setLoadingThread(true);

    getThread(authFetch, requestedId, { signal: controller.signal })
      .then((data) => {
        setActiveThread(data);
        setSummaries((prev) =>
          prev.map((t) =>
            t.id === requestedId ? { ...t, unreadCount: 0 } : t,
          ),
        );
        if (data.unreadCount > 0) {
          markThreadRead(authFetch, requestedId).catch(() => {});
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return; // expected on supersede/unmount
        toast.error("Couldn't load this conversation.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingThread(false);
      });

    return () => controller.abort();
  }, [authFetch, selectedId]);

  // Clear any staged attachments when switching to a different thread, so
  // files don't silently follow the composer into a different conversation.
  // Guarded on selectedId being non-null so this doesn't fire when the URL
  // briefly resolves through a null/loading state during a route transition.
  useEffect(() => {
    if (!selectedId) return;

    setPendingFiles((prev) => {
      prev.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
      return [];
    });
    setDraft("");
  }, [selectedId]);

  // Live push for the currently open thread. Messages posted by the other
  // side (or from another tab/device) land here without a refetch.
  const handleSocketMessage = useCallback(
    (message: ThreadMessage) => {
      setActiveThread((prev) =>
        prev && prev.id === selectedId
          ? mergeThreadMessage(prev, message)
          : prev,
      );
      setSummaries((prev) =>
        prev.map((t) =>
          t.id === selectedId
            ? { ...t, lastMessage: message, updatedAt: message.createdAt }
            : t,
        ),
      );
      // The thread is open, so treat incoming messages as already read
      // rather than letting the unread badge flash and then clear.
      if (message.authorType !== "customer" && selectedId) {
        markThreadRead(authFetch, selectedId).catch(() => {});
      }
    },
    [authFetch, selectedId],
  );

  useThreadSocket({
    threadId: selectedId,
    token: accessToken ?? null,
    onMessage: handleSocketMessage,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return summaries;
    return summaries.filter(
      (t) =>
        t.orderId.toLowerCase().includes(q) ||
        t.lastMessage?.body.toLowerCase().includes(q),
    );
  }, [summaries, query]);

  function handleFilesPicked(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);
    const room = MAX_PENDING_FILES - pendingFiles.length;
    if (room <= 0) {
      toast.error(
        `You can attach up to ${MAX_PENDING_FILES} files per message.`,
      );
      return;
    }

    const accepted: PendingFile[] = [];
    let rejectedForSize = 0;
    let rejectedForCount = 0;

    incoming.forEach((file, i) => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        rejectedForSize++;
        return;
      }
      if (i >= room) {
        rejectedForCount++;
        return;
      }
      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      });
    });

    if (rejectedForSize > 0) {
      toast.error(
        rejectedForSize === 1
          ? "One file is over the 15MB limit and wasn't added."
          : `${rejectedForSize} files are over the 15MB limit and weren't added.`,
      );
    }
    if (rejectedForCount > 0) {
      toast.error(
        `Only ${MAX_PENDING_FILES} files can be attached per message.`,
      );
    }

    setPendingFiles((prev) => [...prev, ...accepted]);
  }

  function removePendingFile(key: string) {
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.key === key);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.key !== key);
    });
  }

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed && pendingFiles.length === 0) return;
    if (!selectedId) return;

    setSending(true);
    try {
      let attachmentIds: string[] = [];

      if (pendingFiles.length > 0) {
        const uploaded = await uploadAttachments(
          authFetch,
          pendingFiles.map((p) => p.file),
        );
        attachmentIds = uploaded.files.map((f) => f.id);
      }

      // Body is required server-side even for attachment-only sends.
      const body =
        trimmed ||
        (pendingFiles.length === 1
          ? `Sent ${pendingFiles[0].file.name}`
          : `Sent ${pendingFiles.length} attachments`);

      const updated = await sendMessage(
        authFetch,
        selectedId,
        body,
        attachmentIds,
      );
      setActiveThread(updated);
      setDraft("");
      pendingFiles.forEach(
        (p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl),
      );
      setPendingFiles([]);

      setSummaries((prev) => {
        const last = updated.messages[updated.messages.length - 1];
        const rest = prev.filter((t) => t.id !== selectedId);
        const current = prev.find((t) => t.id === selectedId);
        if (!current) return prev;
        return [
          { ...current, lastMessage: last, updatedAt: updated.updatedAt },
          ...rest,
        ];
      });
    } catch {
      toast.error("Couldn't send that message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid h-[calc(100dvh-14rem)] min-h-[560px] grid-cols-1 overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[340px_1fr]">
      <ThreadList
        threads={filtered}
        loading={loadingList}
        query={query}
        onQueryChange={setQuery}
        selectedId={selectedId}
        onSelect={(id) => selectThread(id)}
        visible={!selectedId}
      />

      <ThreadPanel
        thread={activeThread}
        loading={loadingThread}
        visible={Boolean(selectedId)}
        onBack={() => selectThread(null)}
        draft={draft}
        onDraftChange={setDraft}
        pendingFiles={pendingFiles}
        onFilesPicked={handleFilesPicked}
        onRemoveFile={removePendingFile}
        sending={sending}
        onSend={handleSend}
      />
    </div>
  );
}