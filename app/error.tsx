"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or crash reporting service
    console.error("Application error captured:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-10 w-10" />
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-destructive">
        Application Error
      </p>

      <h1 className="mt-2 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Something went wrong
      </h1>

      <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground">
        An unexpected error occurred while loading this page. Our production
        line is on it, but you can try refreshing the page below.
      </p>

      {/* Helpful Error Digest fallback */}
      {error.digest && (
        <p className="mt-2 text-xs font-mono text-muted-foreground/85">
          Error Reference:{" "}
          <span className="bg-secondary px-1.5 py-0.5 rounded border border-border">
            {error.digest}
          </span>
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button
          onClick={() => reset()}
          size="lg"
          className="h-12 px-6 inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>

        <Button
          render={<Link href="/" />}
          variant="secondary"
          size="lg"
          className="h-12 px-6"
        >
          Back to Homepage
        </Button>
      </div>

      <div className="mt-12 text-sm text-muted-foreground">
        Need assistance?{" "}
        <Link
          href="/support"
          className="font-semibold text-primary underline underline-offset-4 hover:text-accent"
        >
          Contact our support desk
        </Link>
      </div>
    </div>
  );
}
