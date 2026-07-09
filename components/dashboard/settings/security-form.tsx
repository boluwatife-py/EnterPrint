"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function SecurityForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit =
    current.length > 0 && next.length >= 8 && next === confirm;

  function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    // Mock save — replace with a POST /api/account/password call.
    setTimeout(() => {
      setSaving(false);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated");
    }, 600);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use at least 8 characters. We recommend a mix of letters and
          numbers.
        </p>

        <div className="mt-6 grid gap-4 sm:max-w-sm">
          <div className="grid gap-1.5">
            <Label htmlFor="pwd-current">Current password</Label>
            <Input
              id="pwd-current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pwd-new">New password</Label>
            <Input
              id="pwd-new"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pwd-confirm">Confirm new password</Label>
            <Input
              id="pwd-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={mismatch ? "border-destructive" : undefined}
            />
            {mismatch && (
              <p className="text-xs text-destructive">
                Passwords don't match.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
            {saving ? "Updating…" : "Update password"}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Two-factor authentication
            </h2>
            <Badge variant={twoFactor ? "secondary" : "outline"}>
              {twoFactor ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add an extra layer of security using an authenticator app.
          </p>
        </div>
        <Button
          variant={twoFactor ? "outline" : "default"}
          onClick={() => {
            setTwoFactor((v) => !v);
            toast.success(
              twoFactor ? "Two-factor disabled" : "Two-factor enabled",
            );
          }}
        >
          {twoFactor ? "Disable" : "Enable"}
        </Button>
      </div>
    </div>
  );
}