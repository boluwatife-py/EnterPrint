// components/dashboard/floating-chat-button.tsx
"use client";

import { useRef, useState } from "react";
import { MessageCircle, Paperclip, Send, X, ImageIcon, VideoIcon } from "lucide-react";
import { mockThreads } from "@/lib/mock-account";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageScroller } from "@/components/ui/message-scroller";
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Attachment, AttachmentContent, AttachmentMedia, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction, AttachmentGroup } from "@/components/ui/attachment";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Linkify } from "./linkify";

type PendingFile = {
  id: string;
  file: File;
  kind: "image" | "video" | "file";
  previewUrl: string;
  state: "uploading" | "done";
};

export function FloatingChatButton() {
  const [message, setMessage] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thread = mockThreads[0];

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const next: PendingFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      kind: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
      previewUrl: URL.createObjectURL(file),
      state: "uploading",
    }));
    setPendingFiles((prev) => [...prev, ...next]);

    // Real upload goes here — swap the timeout for your actual upload call
    // (presigned S3/Cloudinary URL, then PATCH the message with the resulting file URL).
    next.forEach((f) => {
      setTimeout(() => {
        setPendingFiles((prev) => prev.map((p) => (p.id === f.id ? { ...p, state: "done" } : p)));
      }, 1200);
    });
  }

  function removePendingFile(id: string) {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleSend() {
    if (!message.trim() && pendingFiles.length === 0) return;
    // POST { text: message, attachments: pendingFiles } to your thread endpoint here
    setMessage("");
    setPendingFiles([]);
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            aria-label="Open support chat"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          />
        }
      >
        <MessageCircle className="h-6 w-6" />
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="font-serif">Support</SheetTitle>
        </SheetHeader>

        <MessageScroller className="flex-1 px-4 py-4">
          <Marker>
            <MarkerContent>Today</MarkerContent>
          </Marker>

          {thread?.messages?.map((m, i) => (
            <Message key={i} align={m.fromSupport ? "start" : "end"}>
              {m.fromSupport && (
                <MessageAvatar>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-secondary text-xs">EP</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
              )}
              <MessageContent>
                {m.attachments?.length ? (
                  <AttachmentGroup className="mb-1.5">
                    {m.attachments.map((att) => (
                      <Attachment key={att.url} size="sm" orientation="vertical">
                        <AttachmentMedia variant="image">
                          {att.kind === "video" ? (
                            <video src={att.url} className="h-full w-full object-cover" muted />
                          ) : (
                            <img src={att.url} alt={att.name} className="h-full w-full object-cover" />
                          )}
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle className="flex items-center gap-1">
                            {att.kind === "video" ? <VideoIcon className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                            {att.name}
                          </AttachmentTitle>
                          <AttachmentDescription>{att.size}</AttachmentDescription>
                        </AttachmentContent>
                      </Attachment>
                    ))}
                  </AttachmentGroup>
                ) : null}

                {m.text && (
                  <Bubble>
                    <BubbleContent>
                      <Linkify text={m.text} />
                    </BubbleContent>
                  </Bubble>
                )}
              </MessageContent>
              <MessageFooter className="text-xs text-muted-foreground">
                {m.time}
                {!m.fromSupport && m.read ? " · Read" : ""}
              </MessageFooter>
            </Message>
          ))}

          {!thread && (
            <p className="text-sm text-muted-foreground">
              Send a message and a member of our team will get back to you.
            </p>
          )}
        </MessageScroller>

        {pendingFiles.length > 0 && (
          <AttachmentGroup className="border-t border-border px-3 pt-3">
            {pendingFiles.map((f) => (
              <Attachment key={f.id} size="sm" state={f.state}>
                <AttachmentMedia variant="image">
                  {f.kind === "video" ? (
                    <video src={f.previewUrl} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={f.previewUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{f.file.name}</AttachmentTitle>
                  <AttachmentDescription>
                    {f.state === "uploading" ? "Uploading…" : `${(f.file.size / 1024).toFixed(0)} KB`}
                  </AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction aria-label={`Remove ${f.file.name}`} onClick={() => removePendingFile(f.id)}>
                    <X className="h-3.5 w-3.5" />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            ))}
          </AttachmentGroup>
        )}

        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            className="text-muted-foreground hover:text-foreground"
            aria-label="Attach an image or video"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSend}
            disabled={!message.trim() && pendingFiles.length === 0}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}