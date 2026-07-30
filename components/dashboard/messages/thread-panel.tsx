import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Thread } from "@/lib/api/threads-api";

import { MessageLog } from "./message-log";
import { Composer } from "./composer";
import type { PendingFile } from "./pending-attachments";

const MAX_PENDING_FILES = 5;

export function ThreadPanel({
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
}: {
  thread: Thread | null;
  loading: boolean;
  visible: boolean;
  onBack: () => void;
  draft: string;
  onDraftChange: (value: string) => void;
  pendingFiles: PendingFile[];
  onFilesPicked: (files: FileList | null) => void;
  onRemoveFile: (key: string) => void;
  sending: boolean;
  onSend: () => void;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        visible ? "flex" : "hidden md:flex",
      )}
    >
      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading conversation...
        </div>
      ) : thread ? (
        <>
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border p-4">
            <div className="flex items-center gap-3">
              <button
                className="text-muted-foreground hover:text-foreground md:hidden"
                onClick={onBack}
                aria-label="Back to inbox"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {thread.orderId}
                </p>
                {thread.agentRole && (
                  <p className="text-xs text-muted-foreground">
                    {thread.agentRole}
                  </p>
                )}
              </div>
            </div>
            <Link
              href={`/dashboard/orders/${thread.orderId}`}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View order
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <MessageLog messages={thread.messages} agentRole={thread.agentRole} />

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

export { MAX_PENDING_FILES };