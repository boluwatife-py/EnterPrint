"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  PenTool,
  X,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import type { ArtworkInfo } from "@/lib/cart-context";
import { uploadArtwork } from "@/lib/api/uploads-api";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Matches the backend's hard limit in upload_artwork (§5 of the API spec).
// The whole request fails if any single file exceeds this, so we filter
// oversized files out client-side before ever calling the endpoint.
const MAX_ARTWORK_BYTES = 15 * 1024 * 1024;

type PendingUpload = {
  localId: string;
  file: File;
  status: "uploading" | "error";
  error?: string;
};

function formatMB(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function ArtworkPicker({
  value,
  onChange,
  onUploadingChange,
}: {
  value: ArtworkInfo;
  onChange: (info: ArtworkInfo) => void;
  /** Fires whenever any file transitions into/out of the "uploading" state. */
  onUploadingChange?: (isUploading: boolean) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive the "is anything uploading" signal as a side effect rather than
  // inline inside a setState updater — updater functions must stay pure
  // (React can invoke them outside of an actual commit, e.g. during
  // render for bailout checks), so calling onUploadingChange from one
  // trips "Cannot update a component while rendering a different
  // component."
  useEffect(() => {
    onUploadingChange?.(pending.some((p) => p.status === "uploading"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  function runUpload(entries: PendingUpload[]) {
    const localIds = entries.map((e) => e.localId);

    uploadArtwork(entries.map((e) => e.file))
      .then((uploaded) => {
        setPending((prev) => prev.filter((p) => !localIds.includes(p.localId)));
        onChange({
          type: "upload",
          files: [...(value.files ?? []), ...uploaded],
          brief: value.brief,
        });
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Upload failed. Try again.";
        setPending((prev) =>
          prev.map((p) =>
            localIds.includes(p.localId)
              ? { ...p, status: "error", error: message }
              : p,
          ),
        );
      });
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const oversized = files.filter((f) => f.size > MAX_ARTWORK_BYTES);
    const valid = files.filter((f) => f.size <= MAX_ARTWORK_BYTES);

    const oversizedEntries: PendingUpload[] = oversized.map((f) => ({
      localId: crypto.randomUUID(),
      file: f,
      status: "error",
      error: `${formatMB(f.size)} exceeds the 15MB limit.`,
    }));

    const validEntries: PendingUpload[] = valid.map((f) => ({
      localId: crypto.randomUUID(),
      file: f,
      status: "uploading",
    }));

    if (oversizedEntries.length > 0 || validEntries.length > 0) {
      setPending((prev) => [...prev, ...oversizedEntries, ...validEntries]);
    }

    if (validEntries.length > 0) {
      runUpload(validEntries);
    }
  }

  function retry(localId: string) {
    const entry = pending.find((p) => p.localId === localId);
    if (!entry) return;

    setPending((prev) =>
      prev.map((p) =>
        p.localId === localId
          ? { ...p, status: "uploading", error: undefined }
          : p,
      ),
    );
    runUpload([{ ...entry, status: "uploading", error: undefined }]);
  }

  function removePending(localId: string) {
    setPending((prev) => prev.filter((p) => p.localId !== localId));
  }

  function removeUploaded(id: string) {
    onChange({
      type: "upload",
      files: value.files?.filter((f) => f.id !== id),
      brief: value.brief,
    });
  }

  const hasAnyFiles =
    (value.files && value.files.length > 0) || pending.length > 0;

  return (
    <div>
      <div className="flex gap-2">
        <ModeTab
          active={value.type === "upload"}
          icon={<Upload className="h-4 w-4" />}
          label="Upload artwork"
          onClick={() =>
            onChange({
              type: "upload",
              files: value.files,
              brief: value.brief,
            })
          }
        />
        <ModeTab
          active={value.type === "design"}
          icon={<PenTool className="h-4 w-4" />}
          label="Request a design"
          onClick={() =>
            onChange({
              type: "design",
              brief: value.brief,
              files: value.files,
            })
          }
        />
      </div>

      {value.type === "upload" ? (
        <div className="mt-4">
          {hasAnyFiles ? (
            <ul className="space-y-2">
              {value.files?.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    {file.name}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeUploaded(file.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}

              {pending.map((p) => (
                <li
                  key={p.localId}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2.5",
                    p.status === "error"
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border bg-secondary/50",
                  )}
                >
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    {p.status === "uploading" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="flex flex-col">
                      {p.file.name}
                      {p.status === "error" && (
                        <span className="text-xs text-destructive">
                          {p.error}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    {p.status === "error" && (
                      <button
                        type="button"
                        aria-label={`Retry ${p.file.name}`}
                        onClick={() => retry(p.localId)}
                        className="text-muted-foreground transition-colors hover:text-primary"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${p.file.name}`}
                      onClick={() => removePending(p.localId)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                </li>
              ))}

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-sm font-medium text-primary hover:underline cursor-pointer"
              >
                Add more files
              </button>
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={cn(
                "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
            >
              <Upload className="h-7 w-7 text-muted-foreground" />
              <span className="mt-3 text-sm font-medium text-foreground">
                Drag &amp; drop your files here
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                PDF, AI, PSD, PNG or JPG up to 15MB. Or click to browse.
              </span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.ai,.psd,.png,.jpg,.jpeg,.svg"
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files);
              // Allow re-selecting the same file after removing it.
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-accent/10 p-3 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              Our in-house design team will create print-ready artwork for you.
              Describe what you need below.
            </span>
          </div>
          <Textarea
            value={value.brief ?? ""}
            onChange={(e) =>
              onChange({ type: "design", brief: e.target.value })
            }
            placeholder="Tell us about your brand, colors, style, and what you'd like on this product..."
            rows={4}
            className="min-h 30 sm:min-h-40"
          />
        </div>
      )}
    </div>
  );
}

function ModeTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
