"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TwoFactorChallengePage() {
  const [code, setCode] = useState("");

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
      <div className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-6">
        <div className="flex items-center justify-center rounded-full bg-muted p-3 text-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter 6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </div>
        <Button className="w-full py-4.5">Continue</Button>
      </div>
    </AuthShell>
  );
}
