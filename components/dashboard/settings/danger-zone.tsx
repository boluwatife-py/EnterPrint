"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function DangerZone() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText.trim().toLowerCase() === "delete";

  function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    // Mock delete — replace with a DELETE /api/account call, then logout.
    setTimeout(() => {
      setDeleting(false);
      setOpen(false);
      toast.success("Account deletion requested");
      logout?.();
    }, 700);
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-card p-6">
      <h2 className="font-serif text-lg font-semibold text-destructive">
        Danger zone
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Deleting your account removes your profile, saved addresses, and
        order history. This can't be undone.
      </p>

      <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Delete {user?.name ? `${user.name}'s` : "your"} account
          </p>
          <p className="text-xs text-muted-foreground">
            All data associated with this account will be permanently
            removed.
          </p>
        </div>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete account
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Delete account</DialogTitle>
            <DialogDescription>
              This is permanent. Type <strong>delete</strong> to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5 py-2">
            <Label htmlFor="confirm-delete">Confirmation</Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!canDelete || deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}