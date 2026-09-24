"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/lib/auth-context";
import { readChallengeId, clearChallengeId } from "@/lib/auth-errors";
import { withRedirectParam } from "@/lib/auth-redirect";

const CODE_LENGTH = 6;

function TwoFactorChallengePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { twoFactorChallenge } = useAuth();
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawRedirect = searchParams.get("redirect");
  const redirectTo = rawRedirect ?? "/dashboard";

  useEffect(() => {
    setChallengeId(readChallengeId());
  }, []);

  async function submitCode(value: string) {
    if (!challengeId) {
      setError("Your verification session expired. Please sign in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await twoFactorChallenge(challengeId, value);
      clearChallengeId();
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
      title="Two-factor verification"
      description="Enter the code from your authenticator app to continue."
      footer={
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <Link
            href={withRedirectParam("/auth/login", rawRedirect)}
            className="font-medium text-foreground hover:text-primary"
          >
            Return to login
          </Link>
        </p>
      }
    >
      <form
        className="space-y-5 rounded-xl border border-border/70 bg-background/70 p-6"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-center rounded-full p-3 text-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>

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
          {loading ? "Verifying…" : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function TwoFactorChallengePage() {
  return (
    <Suspense fallback={<TwoFactorChallengePageSkeleton />}>
      <TwoFactorChallengePageContent />
    </Suspense>
  );
}

function TwoFactorChallengePageSkeleton() {
  return (
    <AuthShell
      title="Two-factor verification"
      description="Preparing your secure verification experience."
      footer={
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground hover:text-primary"
          >
            Return to login
          </Link>
        </p>
      }
    >
      <div className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-6">
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
      </div>
    </AuthShell>
  );
}