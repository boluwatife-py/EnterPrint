"use client";

import { useRef, useState } from "react";
import { Upload, PenTool, X, FileText, CheckCircle2 } from "lucide-react";
import type { ArtworkInfo } from "@/lib/cart-context";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ArtworkPicker({
  value,
  onChange,
}: {
  value: ArtworkInfo;
  onChange: (info: ArtworkInfo) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const nextNames = Array.from(
      new Set([
        ...(value.fileNames ?? []),
        ...Array.from(files).map((f) => f.name),
      ]),
    );

    onChange({ type: "upload", fileNames: nextNames, brief: value.brief });
  }

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
              fileNames: value.fileNames,
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
              fileNames: value.fileNames,
            })
          }
        />
      </div>

      {value.type === "upload" ? (
        <div className="mt-4">
          {value.fileNames && value.fileNames.length > 0 ? (
            <ul className="space-y-2">
              {value.fileNames.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    {name}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    onClick={() =>
                      onChange({
                        type: "upload",
                        fileNames: value.fileNames?.filter((n) => n !== name),
                      })
                    }
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-sm font-medium text-primary hover:underline"
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
                PDF, AI, PSD, PNG or JPG up to 100MB. Or click to browse.
              </span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.ai,.psd,.png,.jpg,.jpeg,.svg"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
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
