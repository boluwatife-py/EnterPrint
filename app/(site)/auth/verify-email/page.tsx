"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/lib/auth-context";
import { readPendingEmail, clearPendingEmail } from "@/lib/auth-errors";
import { withRedirectParam } from "@/lib/auth-redirect";

const CODE_LENGTH = 6;

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawRedirect = searchParams.get("redirect");
  const redirectTo = rawRedirect ?? "/dashboard";

  useEffect(() => {
    setEmail(readPendingEmail());
  }, []);

  async function submitCode(value: string) {
    if (!email) {
      setError("We couldn't find the email to verify. Please sign in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyEmail(email, value);
      clearPendingEmail();
      router.replace(redirectTo);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCode(code);
  }

  return (
    <AuthShell
      title="Verify your email"
      description="Enter the 6-digit code we sent to your inbox to activate your account."
      footer={
        <p className="text-sm text-muted-foreground">
          Entered the wrong email?{" "}
          <Link
            href={withRedirectParam("/auth/login", rawRedirect)}
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
        <div className="flex items-center justify-center rounded-full p-3 text-foreground">
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
          <div className="flex justify-center">
            <InputOTP
              id="code"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(value) => {
                setCode(value);
                if (error) setError(null);
                if (value.length === CODE_LENGTH) {
                  void submitCode(value);
                }
              }}
              disabled={loading}
            >
              <InputOTPGroup>
                {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} className="py-5 px-5" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-4.5"
          disabled={loading || code.length !== CODE_LENGTH}
        >
          {loading ? "Verifying…" : "Verify email"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailPageSkeleton />}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

function VerifyEmailPageSkeleton() {
  return (
    <AuthShell
      title="Verify your email"
      description="Preparing your secure verification experience."
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
      <div className="space-y-5 rounded-xl border border-border/70 bg-background/70 p-6">
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
      </div>
    </AuthShell>
  );
}