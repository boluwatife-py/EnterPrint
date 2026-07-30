import { FileText, Film, X } from "lucide-react";

export type PendingFile = {
  key: string;
  file: File;
  previewUrl: string | null; // object URL, only for images
};

export function PendingAttachments({
  files,
  disabled,
  onRemove,
}: {
  files: PendingFile[];
  disabled: boolean;
  onRemove: (key: string) => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-t border-border px-3 pt-3">
      {files.map((p) => (
        <div
          key={p.key}
          className="group relative flex items-center gap-2 rounded-lg border border-border bg-secondary/50 py-1 pl-1 pr-2 text-xs"
        >
          {p.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.previewUrl}
              alt={p.file.name}
              className="h-8 w-8 rounded object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-muted-foreground">
              {p.file.type.startsWith("video/") ? (
                <Film className="h-3.5 w-3.5" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
            </span>
          )}
          <span className="max-w-32 truncate text-foreground">
            {p.file.name}
          </span>
          <button
            type="button"
            onClick={() => onRemove(p.key)}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label={`Remove ${p.file.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}