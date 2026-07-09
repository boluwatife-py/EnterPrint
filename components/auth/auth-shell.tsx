import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  backHref = "/",
  backLabel = "Back to home",
}: AuthShellProps) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-end">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        </div>

        <div className="rounded-sm border border-border bg-card p-8 shadow-sm">
          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}