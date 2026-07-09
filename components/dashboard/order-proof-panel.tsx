// components/dashboard/order-proof-panel.tsx
"use client";

import { useState } from "react";
import { Check, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function OrderProofPanel({ proofUrl }: { proofUrl: string }) {
  const [comment, setComment] = useState("");
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [resolved, setResolved] = useState<"approved" | "changes" | null>(null);

  if (resolved === "approved") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-5">
        <Check className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">Proof approved — production will begin shortly.</p>
      </div>
    );
  }
  if (resolved === "changes") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-5">
        <MessageSquareWarning className="h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-foreground">Changes requested — our design team has been notified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-card p-5">
      <p className="text-sm font-medium text-foreground">Your proof is ready for review</p>
      <p className="mt-1 text-sm text-muted-foreground">Production won't start until you approve this proof.</p>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <img src={proofUrl} alt="Order proof" className="w-full object-cover" />
      </div>

      {requestingChanges && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What would you like changed?"
          rows={3}
          className="mt-4 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!requestingChanges ? (
          <>
            <Button
              onClick={() => {
                setResolved("approved");
                toast.success("Proof approved");
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve proof
            </Button>
            <Button variant="outline" onClick={() => setRequestingChanges(true)}>
              Request changes
            </Button>
          </>
        ) : (
          <>
            <Button
              disabled={!comment.trim()}
              onClick={() => {
                setResolved("changes");
                toast.success("Changes requested");
              }}
            >
              Send request
            </Button>
            <Button variant="ghost" onClick={() => setRequestingChanges(false)}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}