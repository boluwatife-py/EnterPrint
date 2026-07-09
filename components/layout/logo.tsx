import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center", className)}
      aria-label="EnterPrint home"
    >
      {/*
        The source art sits on a white canvas with generous margins.
        A fixed-aspect white tile + object-cover trims that margin so the
        lockup fills its height and reads cleanly on any surface.
      */}
      <span className="relative block h-9 w-[104px] overflow-hidden rounded-lg bg-white ring-1 ring-black/5 sm:h-10 sm:w-[116px] lg:h-12 lg:w-[140px]">
        <Image
          src="/enterprint-logo.png"
          alt="EnterPrint — Print Beyond Limits"
          fill
          priority
          sizes="140px"
          className="object-cover object-center"
        />
      </span>
    </Link>
  )
}
