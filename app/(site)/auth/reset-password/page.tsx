"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, form.password);
      setSuccess(
        "Your password has been updated. You can sign in with your new password now.",
      );
      window.setTimeout(
        () =>
          router.replace(
            `/auth/login?message=${encodeURIComponent("Password reset complete. Please sign in.")}`,
          ),
        800,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to reset your password right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Choose a new password"
      description={
        email
          ? `Set a new password for ${email}.`
          : "Set a new password for your account."
      }
      footer={
        <p className="text-sm text-muted-foreground">
          Need another code?{" "}
          <Link
            href="/auth/forgot-password"
            className="font-medium text-foreground hover:text-primary"
          >
            Try again
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Minimum 8 characters"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
            placeholder="Repeat your password"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating password…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordPageSkeleton />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

function ResetPasswordPageSkeleton() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Preparing your secure reset experience."
      footer={
        <p className="text-sm text-muted-foreground">
          Need another code?{" "}
          <Link
            href="/auth/forgot-password"
            className="font-medium text-foreground hover:text-primary"
          >
            Try again
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
      </div>
    </AuthShell>
  );
}
