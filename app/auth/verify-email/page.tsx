"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { readPendingEmail, clearPendingEmail } from "@/lib/auth-errors";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(readPendingEmail());
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      setError("We couldn't find the email to verify. Please sign in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyEmail(email, code);
      clearPendingEmail();
      router.replace("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "That code didn't work. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Verify your email"
      description="Enter the 6-digit code we sent to your inbox to activate your account."
      footer={
        <p className="text-sm text-muted-foreground">
          Entered the wrong email?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form
        className="space-y-5 rounded-xl border border-border/70 bg-background/70 p-6"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-center rounded-full bg-muted p-3 text-foreground">
          <Mail className="h-5 w-5" />
        </div>

        <p className="text-center text-sm leading-7 text-muted-foreground">
          {email
            ? `We sent a verification code to ${email}.`
            : "We sent a verification code to your inbox."}
        </p>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter 6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
        </div>

        <Button type="submit" className="w-full py-4.5" disabled={loading}>
          {loading ? "Verifying…" : "Verify email"}
        </Button>
      </form>
    </AuthShell>
  );
}
