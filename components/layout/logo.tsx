import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center", className)}
      aria-label="EnterPrint home"
    >
      <span className="relative block h-9 w-26 overflow-hidden rounded-lg bg-background sm:h-10 sm:w-29 lg:h-12 lg:w-35">
        <Image
          src="/enterprint-logo.jpeg"
          alt="EnterPrint, Print Beyond Limits"
          fill
          priority
          sizes="140px"
          className="object-cover object-center"
        />
      </span>
    </Link>
  );
}
