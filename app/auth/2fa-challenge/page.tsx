"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { readChallengeId, clearChallengeId } from "@/lib/auth-errors";

export default function TwoFactorChallengePage() {
  const router = useRouter();
  const { twoFactorChallenge } = useAuth();
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setChallengeId(readChallengeId());
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challengeId) {
      setError("Your verification session expired. Please sign in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await twoFactorChallenge(challengeId, code);
      clearChallengeId();
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
      title="Two-factor verification"
      description="Enter the code from your authenticator app to continue."
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
      <form
        className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-6"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-center rounded-full bg-muted p-3 text-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>

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
          {loading ? "Verifying…" : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}
