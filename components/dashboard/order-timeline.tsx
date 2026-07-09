// components/dashboard/order-timeline.tsx
"use client";

import { Check } from "lucide-react";
import { PRODUCTION_STAGES } from "@/lib/production-stages";
import { cn } from "@/lib/utils";

export function OrderTimeline({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-160 items-start sm:min-w-0">
        {PRODUCTION_STAGES.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div
              key={stage}
              className="flex flex-1 flex-col items-center text-center"
            >
              <div className="flex w-full items-center">
                <div
                  className={cn(
                    "h-px flex-1",
                    i === 0
                      ? "opacity-0"
                      : done || active
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-background text-primary",
                    !done &&
                      !active &&
                      "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div
                  className={cn(
                    "h-px flex-1",
                    i === PRODUCTION_STAGES.length - 1
                      ? "opacity-0"
                      : done
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
              </div>
              <p
                className={cn(
                  "mt-2 max-w-22.5 text-xs",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {stage}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
