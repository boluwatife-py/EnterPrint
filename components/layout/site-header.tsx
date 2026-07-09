// components/site-header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  Search,
  Truck,
  MessageCircle,
  User,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./logo";
import {
  ProductsMenu,
  packagingSlugs,
  printSlugs,
  categoryIcons,
} from "./products-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useCart } from "@/lib/cart-context";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
// components/site-header.tsx — only the changed pieces

function HeaderIconLink({
  href,
  label,
  icon: Icon,
  badge,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            render={<Link href={href} aria-label={label} />}
            variant={active ? "secondary" : "ghost"}
            size="icon"
            className="relative"
          />
        }
      >
        <Icon
          className={cn(
            "h-5 w-5",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        />
        {badge ? (
          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-accent px-1 text-xs text-accent-foreground">
            {badge}
          </Badge>
        ) : null}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const packaging = packagingSlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean);
  const print = printSlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Main navigation"
          >
            <ProductsMenu active={pathname.startsWith("/products")} />
            <Link
              href="/design-request"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname.startsWith("/design-request")
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              Request a Design
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <HeaderIconLink
            href="/dashboard"
            label="Your dashboard"
            icon={User}
            active={pathname === "/dashboard"}
          />

          <HeaderIconLink
            href="/dashboard/messages"
            label="Your Messages"
            icon={MessageCircle}
            active={pathname.startsWith("/dashboard/messages")}
          />
          <HeaderIconLink
            href="/track-order"
            label="Track an order"
            icon={Truck}
            active={pathname.startsWith("/track-order")}
          />
          
          {/* Search */}
          <div className="relative hidden sm:block">
            <Popover>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <PopoverTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Search products"
                          className="hidden sm:inline-flex"
                        />
                      }
                    />
                  }
                >
                  <Search className="h-5 w-5" />
                </TooltipTrigger>
                <TooltipContent>Search products</TooltipContent>
              </Tooltip>

              <PopoverContent align="end" className="w-72 p-2">
                <form action="/products" className="flex items-center gap-2">
                  <input
                    autoFocus
                    name="q"
                    type="text"
                    placeholder="Search boxes, cards, labels…"
                    className="w-full bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 shrink-0 px-3 text-xs"
                  >
                    Go
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

          <HeaderIconLink
            href="/cart"
            label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            icon={ShoppingCart}
            badge={itemCount || undefined}
          />

          <div className="mx-1 hidden h-6 w-px bg-border md:block" />

          {/* Start an order — icon-only from sm, full button from md up, never just vanishes */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  render={<Link href="/products" aria-label="Start an order" />}
                  size="icon"
                  className="md:hidden"
                />
              }
            >
              <PenLine className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent>Start an order</TooltipContent>
          </Tooltip>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <nav
                className="mt-6 flex flex-col gap-1 px-2"
                aria-label="Mobile navigation"
              >
                <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Packaging
                </p>
                {packaging.map((c) => {
                  const Icon = categoryIcons[c!.icon];
                  return (
                    <Link
                      key={c!.slug}
                      href={`/products?category=${c!.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {c!.name}
                    </Link>
                  );
                })}

                <p className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Paper print
                </p>
                {print.map((c) => {
                  const Icon = categoryIcons[c!.icon];
                  return (
                    <Link
                      key={c!.slug}
                      href={`/products?category=${c!.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {c!.name}
                    </Link>
                  );
                })}

                <div className="my-2 border-t border-border" />

                {[
                  {
                    href: "/design-request",
                    label: "Request a Design",
                    icon: PenLine,
                  },
                  {
                    href: "/track-order",
                    label: "Track an order",
                    icon: Truck,
                  },
                  {
                    href: "/support",
                    label: "Talk to support",
                    icon: MessageCircle,
                  },
                  { href: "/dashboard", label: "Your dashboard", icon: User },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                      pathname === link.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
