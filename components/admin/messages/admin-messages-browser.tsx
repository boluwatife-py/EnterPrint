"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import { uploadAttachments, type ThreadMessage } from "@/lib/api/threads-api";
import {
  getAdminThread,
  getAdminThreads,
  markAdminThreadRead,
  sendAdminThreadMessage,
  updateAdminThread,
  type AdminThreadCounts,
  type AdminThreadDetail,
  type AdminThreadListItem,
  type AdminThreadView,
} from "@/lib/api/admin-threads";
import {
  useAdminThreadSocket,
  type AdminSocketEvent,
  type AdminThreadState,
} from "@/lib/hooks/use-admin-thread-socket";
import type { PendingFile } from "@/components/dashboard/messages/pending-attachments";

import { AdminThreadList } from "./admin-thread-list";
import { AdminThreadPanel, MAX_PENDING_FILES } from "./admin-thread-panel";

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024; // matches /uploads/attachments
const LIST_PAGE_SIZE = 100; // API max; use search/filters to narrow beyond this
const REFRESH_DEBOUNCE_MS = 400;

/** Appends `message`, or replaces it in place if the id already exists — keeps
 *  the HTTP send response and the socket echo of the same message from
 *  producing a duplicate bubble. */
function mergeMessage(
  thread: AdminThreadDetail,
  message: ThreadMessage,
): AdminThreadDetail {
  const exists = thread.messages.some((m) => m.id === message.id);
  return {
    ...thread,
    messages: exists
      ? thread.messages.map((m) => (m.id === message.id ? message : m))
      : [...thread.messages, message],
    updatedAt: message.createdAt,
  };
}

/** Fields of the server's thread snapshot that are safe to apply as-is
 *  (`assignedToMe` is viewer-specific, so the debounced refetch handles it). */
function stateFields(t: AdminThreadState) {
  return {
    status: t.status,
    agentId: t.agentId,
    agentRole: t.agentRole,
    updatedAt: t.updatedAt,
  };
}

export function AdminMessagesBrowser({
  initialThreadId,
}: { initialThreadId?: string } = {}) {
  const { authFetch, accessToken, isHydrated } = useAuth();
  const router = useRouter();

  const [summaries, setSummaries] = useState<AdminThreadListItem[]>([]);
  const [counts, setCounts] = useState<AdminThreadCounts | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [view, setView] = useState<AdminThreadView>("open");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(
    initialThreadId ?? null,
  );
  const [activeThread, setActiveThread] = useState<AdminThreadDetail | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [busy, setBusy] = useState(false);

  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [sending, setSending] = useState(false);

  // URL is the single source of truth for the selection (same as the
  // customer inbox): clicking a thread navigates, this effect picks it up.
  useEffect(() => {
    setSelectedId(initialThreadId ?? null);
  }, [initialThreadId]);

  const selectThread = useCallback(
    (id: string | null) => {
      router.push(id ? `/admin/messages/${id}` : "/admin/messages");
    },
    [router],
  );

  // Debounce search so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // --- list ------------------------------------------------------------------

  const listSeq = useRef(0);
  const loadList = useCallback(
    async (silent = false) => {
      if (!accessToken) return;
      const seq = ++listSeq.current; // a slow earlier request must not win
      if (!silent) setLoadingList(true);
      try {
        const res = await getAdminThreads(accessToken, view, search, 1, LIST_PAGE_SIZE);
        if (seq !== listSeq.current) return;
        setSummaries(res.data);
        setCounts(res.counts);
      } catch {
        if (!silent && seq === listSeq.current) toast.error("Couldn't load the inbox.");
      } finally {
        if (!silent && seq === listSeq.current) setLoadingList(false);
      }
    },
    [accessToken, view, search],
  );

  useEffect(() => {
    if (isHydrated) void loadList(false);
  }, [isHydrated, loadList]);

  // Socket events patch state instantly; this quietly reconciles with the
  // server shortly after (counts, filters, threads not in the list yet,
  // viewer-specific fields).
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scheduleRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => void loadList(true), REFRESH_DEBOUNCE_MS);
  }, [loadList]);
  useEffect(() => () => clearTimeout(refreshTimer.current), []);
  // Stable handle so effects that only *call* it don't re-run when the
  // filters (and therefore scheduleRefresh's identity) change.
  const scheduleRefreshRef = useRef(scheduleRefresh);
  useEffect(() => {
    scheduleRefreshRef.current = scheduleRefresh;
  });

  // --- active thread ---------------------------------------------------------

  const threadSeq = useRef(0);
  useEffect(() => {
    if (!selectedId) {
      setActiveThread(null);
      return;
    }
    if (!accessToken) return;

    const seq = ++threadSeq.current;
    const requestedId = selectedId;
    const token = accessToken;
    setLoadingThread(true);

    getAdminThread(token, requestedId)
      .then((data) => {
        if (seq !== threadSeq.current) return;
        setActiveThread({ ...data, adminUnreadCount: 0 });
        setSummaries((prev) =>
          prev.map((t) => (t.id === requestedId ? { ...t, adminUnreadCount: 0 } : t)),
        );
        if (data.adminUnreadCount > 0) {
          markAdminThreadRead(token, requestedId)
            .then(() => scheduleRefreshRef.current())
            .catch(() => {});
        }
      })
      .catch(() => {
        if (seq === threadSeq.current) toast.error("Couldn't load this conversation.");
      })
      .finally(() => {
        if (seq === threadSeq.current) setLoadingThread(false);
      });
  }, [accessToken, selectedId]);

  // Staged attachments / draft must not follow the composer into a different
  // conversation.
  useEffect(() => {
    if (!selectedId) return;
    setPendingFiles((prev) => {
      prev.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
      return [];
    });
    setDraft("");
  }, [selectedId]);

  // --- live updates ------------------------------------------------------------

  const handleSocketEvent = useCallback(
    (event: AdminSocketEvent) => {
      if (event.type === "thread_read") {
        setSummaries((prev) =>
          prev.map((t) =>
            t.id === event.threadId
              ? { ...t, adminUnreadCount: event.adminUnreadCount }
              : t,
          ),
        );
        scheduleRefresh();
        return;
      }

      if (event.type === "thread_updated") {
        const { thread } = event;
        setSummaries((prev) =>
          prev.map((t) => (t.id === thread.id ? { ...t, ...stateFields(thread) } : t)),
        );
        setActiveThread((prev) =>
          prev && prev.id === thread.id ? { ...prev, ...stateFields(thread) } : prev,
        );
        scheduleRefresh();
        return;
      }

      // thread_activity
      const { threadId, message, thread } = event;
      const isOpen = threadId === selectedId;
      const fromCustomer = message.authorType === "customer";
      // The thread is open on screen: treat the customer's message as read
      // instead of letting the badge flash and clear.
      const unread = isOpen && fromCustomer ? 0 : thread.adminUnreadCount;

      setSummaries((prev) => {
        const existing = prev.find((t) => t.id === threadId);
        if (!existing) return prev; // unknown thread: the refetch below adds it
        return [
          { ...existing, ...stateFields(thread), lastMessage: message, adminUnreadCount: unread },
          ...prev.filter((t) => t.id !== threadId),
        ];
      });
      setActiveThread((prev) =>
        prev && prev.id === threadId
          ? { ...mergeMessage(prev, message), ...stateFields(thread), adminUnreadCount: unread }
          : prev,
      );

      if (isOpen && fromCustomer && accessToken) {
        markAdminThreadRead(accessToken, threadId).catch(() => {});
      }
      scheduleRefresh();
    },
    [selectedId, accessToken, scheduleRefresh],
  );

  const socketStatus = useAdminThreadSocket({
    token: accessToken ?? null,
    onEvent: handleSocketEvent,
    // Anything that happened while we were offline: resync list + open thread.
    onReconnect: () => {
      void loadList(true);
      if (selectedId && accessToken) {
        getAdminThread(accessToken, selectedId)
          .then((data) =>
            setActiveThread((prev) =>
              prev && prev.id === data.id ? { ...data, adminUnreadCount: 0 } : prev,
            ),
          )
          .catch(() => {});
      }
    },
  });

  // --- composer ------------------------------------------------------------------

  function handleFilesPicked(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);
    const room = MAX_PENDING_FILES - pendingFiles.length;
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_PENDING_FILES} files per message.`);
      return;
    }

    const accepted: PendingFile[] = [];
    let tooBig = 0;
    let tooMany = 0;

    incoming.forEach((file, i) => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        tooBig++;
        return;
      }
      if (i >= room) {
        tooMany++;
        return;
      }
      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      });
    });

    if (tooBig > 0) {
      toast.error(
        tooBig === 1
          ? "One file is over the 15MB limit and wasn't added."
          : `${tooBig} files are over the 15MB limit and weren't added.`,
      );
    }
    if (tooMany > 0) {
      toast.error(`Only ${MAX_PENDING_FILES} files can be attached per message.`);
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

  /** Replace the open thread with a fresh server copy and mirror it in the list. */
  function applyDetail(updated: AdminThreadDetail) {
    setActiveThread({ ...updated, adminUnreadCount: 0 });
    setSummaries((prev) => {
      const current = prev.find((t) => t.id === updated.id);
      if (!current) return prev;
      const last = updated.messages[updated.messages.length - 1] ?? null;
      return [
        {
          ...current,
          status: updated.status,
          agentId: updated.agentId,
          agentRole: updated.agentRole,
          assignedToMe: updated.assignedToMe,
          lastMessage: last,
          adminUnreadCount: 0,
          updatedAt: updated.updatedAt,
        },
        ...prev.filter((t) => t.id !== updated.id),
      ];
    });
    scheduleRefresh();
  }

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed && pendingFiles.length === 0) return;
    if (!selectedId || !accessToken) return;

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

      const updated = await sendAdminThreadMessage(
        accessToken,
        selectedId,
        body,
        attachmentIds,
      );
      applyDetail(updated);
      setDraft("");
      pendingFiles.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
      setPendingFiles([]);
    } catch {
      toast.error("Couldn't send that message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleAssign(assignment: "me" | "unassign") {
    if (!selectedId || !accessToken) return;
    setBusy(true);
    try {
      const updated = await updateAdminThread(accessToken, selectedId, { assignment });
      applyDetail(updated);
      toast.success(assignment === "me" ? "Assigned to you." : "Thread released.");
    } catch {
      toast.error("Couldn't update the assignment.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleStatus() {
    if (!selectedId || !accessToken || !activeThread) return;
    const next = activeThread.status === "open" ? "closed" : "open";
    setBusy(true);
    try {
      const updated = await updateAdminThread(accessToken, selectedId, { status: next });
      applyDetail(updated);
      toast.success(next === "closed" ? "Thread closed." : "Thread reopened.");
    } catch {
      toast.error("Couldn't update the thread.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid h-[calc(100dvh-9rem)] min-h-[560px] grid-cols-1 overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[360px_1fr]">
      <AdminThreadList
        threads={summaries}
        counts={counts}
        loading={loadingList}
        view={view}
        onViewChange={setView}
        query={searchInput}
        onQueryChange={setSearchInput}
        selectedId={selectedId}
        onSelect={(id) => selectThread(id)}
        visible={!selectedId}
        socketStatus={socketStatus}
      />

      <AdminThreadPanel
        thread={activeThread}
        loading={loadingThread && !activeThread}
        visible={Boolean(selectedId)}
        onBack={() => selectThread(null)}
        draft={draft}
        onDraftChange={setDraft}
        pendingFiles={pendingFiles}
        onFilesPicked={handleFilesPicked}
        onRemoveFile={removePendingFile}
        sending={sending}
        onSend={handleSend}
        busy={busy}
        onAssign={handleAssign}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
