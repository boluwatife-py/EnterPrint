// components/auth/protected-route.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardLoading } from "@/app/dashboard/loading";

export function ProtectedRoute({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Hook runs unconditionally, every render, no matter what isHydrated is.
  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`,
      );
    }
  }, [isAuthenticated, isHydrated, pathname, router]);

  // Every early return happens AFTER all hooks have already been called.
  if (!isHydrated) {
    return fallback ?? <DashboardLoading />;
  }

  if (!isAuthenticated) {
    // While the effect triggers the navigation, render the same loading UI
    // so the page doesn't show a brief empty state.
    return fallback ?? <DashboardLoading />;
  }

  return <>{children}</>;
}
