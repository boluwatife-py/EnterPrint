import { cn } from "@/lib/utils";

/**
 * Generic loading placeholder. Matches the same visual language already
 * used in app/dashboard/loading.tsx (animate-pulse + bg-muted) — pulled out
 * into one component so every skeleton in the app (order rows, dashboard
 * shell, etc.) shares one implementation instead of each screen redefining
 * its own pulse/rounded/bg classes.
 *
 * Usage: <Skeleton className="h-4 w-24" /> — size and shape are controlled
 * entirely via className, same as the shadcn convention.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
