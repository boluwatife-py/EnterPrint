// app/auth/login/loading.tsx — reuses the same visual rhythm as
// LoginPageSkeleton already inside your page component, but this one
// fires earlier, during the route transition itself
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginLoading() {
  return (
    <AuthShell title="Sign in to your account" description="Preparing your secure portal experience.">
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
      </div>
    </AuthShell>
  );
}