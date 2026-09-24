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
      <Image
        src="/enterprint-logo.png"
        alt="EnterPrint, Print Beyond Limits"
        width={140}
        height={40}
        priority
        className="h-9 w-auto sm:h-10 lg:h-12 object-contain"
      />
    </Link>
  );
}