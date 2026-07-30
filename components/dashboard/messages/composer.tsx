"use client";

import { useRef } from "react";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingAttachments, type PendingFile } from "./pending-attachments";

export function Composer({
  draft,
  onDraftChange,
  pendingFiles,
  onFilesPicked,
  onRemoveFile,
  sending,
  maxFiles,
  onSend,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  pendingFiles: PendingFile[];
  onFilesPicked: (files: FileList | null) => void;
  onRemoveFile: (key: string) => void;
  sending: boolean;
  maxFiles: number;
  onSend: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = (draft.trim().length > 0 || pendingFiles.length > 0) && !sending;

  return (
    <div className="shrink-0 border-t border-border">
      <PendingAttachments
        files={pendingFiles}
        disabled={sending}
        onRemove={onRemoveFile}
      />

      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            onFilesPicked(e.target.files);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || pendingFiles.length >= maxFiles}
          aria-label="Attach files"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type a message…"
          rows={1}
          disabled={sending}
          className="max-h-32 flex-1 resize-none rounded-lg border border-border bg-background p-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-60"
        />
        <Button size="icon" onClick={onSend} disabled={!canSend} aria-label="Send message">
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}