import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  RotateCcw,
  UserCheck,
  UserMinus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils/format";
import type { AdminThreadDetail } from "@/lib/api/admin-threads";
import { Composer } from "@/components/dashboard/messages/composer";
import type { PendingFile } from "@/components/dashboard/messages/pending-attachments";

import { AdminMessageLog } from "./admin-message-log";

export const MAX_PENDING_FILES = 5;

export function AdminThreadPanel({
  thread,
  loading,
  visible,
  onBack,
  draft,
  onDraftChange,
  pendingFiles,
  onFilesPicked,
  onRemoveFile,
  sending,
  onSend,
  busy,
  onAssign,
  onToggleStatus,
}: {
  thread: AdminThreadDetail | null;
  loading: boolean;
  visible: boolean;
  onBack: () => void;
  draft: string;
  onDraftChange: (v: string) => void;
  pendingFiles: PendingFile[];
  onFilesPicked: (files: FileList | null) => void;
  onRemoveFile: (key: string) => void;
  sending: boolean;
  onSend: () => void;
  /** true while a status/assignment change is in flight */
  busy: boolean;
  onAssign: (assignment: "me" | "unassign") => void;
  onToggleStatus: () => void;
}) {
  return (
    <div className={cn("flex min-h-0 flex-col", visible ? "flex" : "hidden md:flex")}>
      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading conversation...
        </div>
      ) : thread ? (
        <>
          {/* Header */}
          <div className="shrink-0 space-y-3 border-b border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <button
                  className="mt-0.5 text-muted-foreground hover:text-foreground md:hidden"
                  onClick={onBack}
                  aria-label="Back to inbox"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {thread.customer.name ?? thread.customer.email ?? "Unknown customer"}
                  </p>
                  {thread.customer.email && (
                    <a
                      href={`mailto:${thread.customer.email}`}
                      className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Mail className="h-3 w-3" />
                      {thread.customer.email}
                    </a>
                  )}
                </div>
              </div>

              <Link
                href={`/admin/orders/${thread.orderId}`}
                className="flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
              >
                View order
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {thread.orderId}
              </Badge>
              {thread.order && (
                <>
                  <Badge variant="outline">{thread.order.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatNaira(thread.order.total)}
                    {thread.order.itemNames[0] && (
                      <>
                        {" · "}
                        {thread.order.itemNames[0]}
                        {thread.order.itemNames.length > 1 &&
                          ` +${thread.order.itemNames.length - 1} more`}
                      </>
                    )}
                  </span>
                </>
              )}
              {thread.status === "closed" && <Badge variant="secondary">Closed</Badge>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {thread.assignedToMe ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onAssign("unassign")}
                >
                  <UserMinus className="mr-1 h-3.5 w-3.5" />
                  Release
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onAssign("me")}
                >
                  <UserCheck className="mr-1 h-3.5 w-3.5" />
                  {thread.agentId ? "Take over" : "Assign to me"}
                </Button>
              )}
              <Button size="sm" variant="outline" disabled={busy} onClick={onToggleStatus}>
                {thread.status === "open" ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Close thread
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Reopen
                  </>
                )}
              </Button>
              {thread.agentId && !thread.assignedToMe && (
                <span className="text-xs text-muted-foreground">
                  Handled by {thread.agentRole ?? "another agent"}
                </span>
              )}
            </div>
          </div>

          <AdminMessageLog
            threadId={thread.id}
            messages={thread.messages}
            customerName={thread.customer.name ?? "Customer"}
            agentRole={thread.agentRole}
          />

          <Composer
            draft={draft}
            onDraftChange={onDraftChange}
            pendingFiles={pendingFiles}
            onFilesPicked={onFilesPicked}
            onRemoveFile={onRemoveFile}
            sending={sending}
            maxFiles={MAX_PENDING_FILES}
            onSend={onSend}
          />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select a conversation to view it here.
          </p>
        </div>
      )}
    </div>
  );
}
