"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { readPendingEmail, clearPendingEmail } from "@/lib/auth-errors";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(readPendingEmail());
    return () => {
      clearPendingEmail();
    };
  }, []);

  return (
    <AuthShell
      title="Verify your email"
      description="We’ve queued a verification email for your account so you can continue safely."
      footer={
        <p className="text-sm text-muted-foreground">
          Already verified?{" "}
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
        <div className="flex items-center justify-center rounded-full bg-muted p-3 text-foreground">
          <Mail className="h-5 w-5" />
        </div>

        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Verification email sent
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            {email
              ? `A message was prepared for ${email}.`
              : "A message was prepared for your inbox."}
          </p>
        </div>

        <Button render={<Link href="/auth/login" />} className="w-full py-4.5">
          Continue to sign in
        </Button>
      </div>
    </AuthShell>
  );
}
