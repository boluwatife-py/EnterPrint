// components/dashboard/order-proof-panel.tsx
"use client";

import { useState } from "react";
import {
  Check,
  MessageSquareWarning,
  Loader2,
  FileVideo,
  Image as ImageIcon,
  File as FileIcon,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderProof } from "@/lib/api/orders-api";

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif",
]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "avi", "mkv", "m4v"]);

/**
 * OrderProof carries only a `url`, no `kind` -- derive the type from the
 * URL's extension so the icon/label is right even though we never render
 * the media inline here (see note below on why: opening in a new tab
 * offloads all preview/zoom/download handling to the browser instead of
 * us building it).
 */
function getProofKind(url: string): "image" | "video" | "file" {
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0] ?? "";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  return "file";
}

export function OrderProofPanel({
  proof,
  onApprove,
  onReject,
}: {
  proof: OrderProof;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}) {
  const [comment, setComment] = useState("");
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [approving, setApproving] = useState(false);
  const [sendingChanges, setSendingChanges] = useState(false);

  const proofKind = getProofKind(proof.url);
  const ProofIcon =
    proofKind === "image"
      ? ImageIcon
      : proofKind === "video"
        ? FileVideo
        : FileIcon;
  const proofLabel =
    proofKind === "image"
      ? "Image proof"
      : proofKind === "video"
        ? "Video proof"
        : "Proof file";

  async function handleApprove() {
    setApproving(true);
    try {
      await onApprove();
      // Parent updates local proof.status on success, which flips
      // isAwaitingProof false and unmounts this panel.
    } finally {
      setApproving(false);
    }
  } 

  async function handleSendChanges() {
    if (!comment.trim()) return;
    setSendingChanges(true);
    try {
      await onReject(comment.trim());
      setRequestingChanges(false);
      setComment("");
    } finally {
      setSendingChanges(false);
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Your proof is ready for review
        </p>
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          Version {proof.version}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Production won&apos;t start until you approve this proof.
      </p>
      <a
        href={proof.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex w-fit items-center gap-2 rounded-lg border border-border bg-secondary/40 px-2 py-1 text-sm transition-colors hover:border-primary/40 hover:bg-secondary/70"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
          <ProofIcon className="h-4 w-4" />
        </span>
        <span className="text-foreground">{proofLabel}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </a>

      {proof.notes && (
        <p className="mt-3 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
          {proof.notes}
        </p>
      )}

      {requestingChanges && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What would you like changed?"
          rows={3}
          disabled={sendingChanges}
          className="mt-4 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-60"
        />
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!requestingChanges ? (
          <>
            <Button onClick={handleApprove} disabled={approving}>
              {approving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Approve proof
            </Button>
            <Button
              variant="outline"
              onClick={() => setRequestingChanges(true)}
              disabled={approving}
            >
              <MessageSquareWarning className="mr-2 h-4 w-4" />
              Request changes
            </Button>
          </>
        ) : (
          <>
            <Button
              disabled={!comment.trim() || sendingChanges}
              onClick={handleSendChanges}
            >
              {sendingChanges && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send request
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setRequestingChanges(false);
                setComment("");
              }}
              disabled={sendingChanges}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
