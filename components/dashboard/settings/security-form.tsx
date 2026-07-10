"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  changePassword,
  confirmTwoFA,
  disableTwoFA,
  enableTwoFA,
  type TwoFAEnableResponse,
} from "@/lib/account-api";
import type { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Server rule: ≥8 chars with upper, lower, digit and symbol.
const STRONG =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function SecurityForm() {
  const { user, authFetch, updateUser } = useAuth();

  // Password change
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  // 2FA
  const twoFactor = Boolean(user?.requires2FA);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [enrollment, setEnrollment] = useState<TwoFAEnableResponse | null>(null);
  const [otp, setOtp] = useState("");
  const [twoFABusy, setTwoFABusy] = useState(false);

  const mismatch = confirm.length > 0 && next !== confirm;
  const weak = next.length > 0 && !STRONG.test(next);
  const canSubmit =
    current.length > 0 && STRONG.test(next) && next === confirm && !saving;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await changePassword(authFetch, {
        currentPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated");
    } catch (error) {
      toast.error((error as ApiError)?.message ?? "Could not update password.");
    } finally {
      setSaving(false);
    }
  }

  async function startEnable() {
    setTwoFABusy(true);
    try {
      const data = await enableTwoFA(authFetch);
      setEnrollment(data);
      setOtp("");
      setSetupOpen(true);
    } catch (error) {
      toast.error((error as ApiError)?.message ?? "Could not start 2FA setup.");
    } finally {
      setTwoFABusy(false);
    }
  }

  async function confirmEnable() {
    if (otp.length !== 6) return;
    setTwoFABusy(true);
    try {
      const { requires2FA } = await confirmTwoFA(authFetch, otp);
      updateUser({ requires2FA });
      setSetupOpen(false);
      setEnrollment(null);
      setOtp("");
      toast.success("Two-factor authentication enabled");
    } catch (error) {
      toast.error((error as ApiError)?.message ?? "That code didn't match.");
    } finally {
      setTwoFABusy(false);
    }
  }

  async function confirmDisable() {
    if (otp.length !== 6) return;
    setTwoFABusy(true);
    try {
      const { requires2FA } = await disableTwoFA(authFetch, otp);
      updateUser({ requires2FA });
      setDisableOpen(false);
      setOtp("");
      toast.success("Two-factor authentication disabled");
    } catch (error) {
      toast.error((error as ApiError)?.message ?? "That code didn't match.");
    } finally {
      setTwoFABusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use at least 8 characters with an uppercase, lowercase, number, and
          symbol.
        </p>

        <div className="mt-6 grid gap-4 sm:max-w-sm">
          <div className="grid gap-1.5">
            <Label htmlFor="pwd-current">Current password</Label>
            <Input
              id="pwd-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pwd-new">New password</Label>
            <Input
              id="pwd-new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={weak ? "border-destructive" : undefined}
            />
            {weak && (
              <p className="text-xs text-destructive">
                Needs 8+ chars with upper, lower, number, and symbol.
              </p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pwd-confirm">Confirm new password</Label>
            <Input
              id="pwd-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={mismatch ? "border-destructive" : undefined}
            />
            {mismatch && (
              <p className="text-xs text-destructive">Passwords don&apos;t match.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} disabled={!canSubmit}>
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
        {twoFactor ? (
          <Button
            variant="outline"
            disabled={twoFABusy}
            onClick={() => {
              setOtp("");
              setDisableOpen(true);
            }}
          >
            Disable
          </Button>
        ) : (
          <Button onClick={startEnable} disabled={twoFABusy}>
            {twoFABusy ? "Starting…" : "Enable"}
          </Button>
        )}
      </div>

      {/* Enable / setup dialog */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="sm:max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Set up two-factor authentication
            </DialogTitle>
            <DialogDescription>
              Scan the QR code with an authenticator app, then enter the 6-digit
              code to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {enrollment?.otpauthUrl && (
              <div className="rounded-lg border border-border bg-background p-3">
                <QRCodeSVG value={enrollment.otpauthUrl} size={160} />
              </div>
            )}
            {enrollment?.secret && (
              <div className="w-full text-center">
                <p className="text-xs text-muted-foreground">
                  Or enter this code manually
                </p>
                <p className="mt-1 break-all font-mono text-sm text-foreground">
                  {enrollment.secret}
                </p>
              </div>
            )}
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSetupOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmEnable}
              disabled={otp.length !== 6 || twoFABusy}
            >
              {twoFABusy ? "Verifying…" : "Confirm & enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable dialog */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="sm:max-w-sm rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Disable two-factor authentication
            </DialogTitle>
            <DialogDescription>
              Enter a current 6-digit code from your authenticator app to turn
              it off.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-2">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDisableOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDisable}
              disabled={otp.length !== 6 || twoFABusy}
            >
              {twoFABusy ? "Disabling…" : "Disable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
