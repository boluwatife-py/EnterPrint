import { FileText, Film, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MessageAttachment } from "@/lib/api/threads-api";

/** Grid/list of attachments on a sent message. */
export function MessageAttachments({
  attachments,
}: {
  attachments: MessageAttachment[];
}) {
  if (attachments.length === 0) return null;

  const images = attachments.filter((a) => a.kind === "image");
  const others = attachments.filter((a) => a.kind !== "image");

  return (
    <div className="flex flex-col gap-1.5">
      {images.length > 0 && (
        <div
          className={cn(
            "grid gap-1.5",
            images.length > 1 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {images.map((a) => (
            <a
              key={a.id}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border border-border/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.url}
                alt={a.name}
                className="h-32 w-full object-cover"
              />
            </a>
          ))}
        </div>
      )}
      {others.map((a) => (
        <a
          key={a.id}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-2.5 py-2 text-xs hover:bg-background"
        >
          {a.kind === "video" ? (
            <Film className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="min-w-0 flex-1 truncate">{a.name}</span>
          <span className="shrink-0 text-muted-foreground">{a.size}</span>
          <Download className="h-3 w-3 shrink-0 text-muted-foreground" />
        </a>
      ))}
    </div>
  );
}