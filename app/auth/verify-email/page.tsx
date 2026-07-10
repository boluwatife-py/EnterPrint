"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/lib/auth-context";
import { readPendingEmail, clearPendingEmail } from "@/lib/auth-errors";

const CODE_LENGTH = 6;

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