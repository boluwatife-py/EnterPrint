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
  LayoutDashboard,
  Package,
  MapPin,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Category } from "@/lib/api/catalog-api";

/** Single source of truth for every dashboard section. */
const dashboardNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/** Utility links shared between desktop icons and the mobile drawer. */
const utilityNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/design-request", label: "Request a Design", icon: PenLine },
  { href: "/track-order", label: "Track an order", icon: Truck },
  { href: "/contact", label: "Talk to support", icon: MessageCircle },
];

function isDashboardSectionActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

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

/**
 * Desktop account control: a clickable user icon that goes straight to
 * `/dashboard` (the protected-route guard bounces signed-out users to
 * login on its own), plus a separate chevron that opens a dropdown —
 * either the full dashboard nav, or a Login / Sign up prompt.
 */
function DashboardMenu({ pathname }: { pathname: string }) {
  const { user, isAuthenticated, isHydrated, logout } = useAuth();
  const active = pathname.startsWith("/dashboard");
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              nativeButton={false}
              onMouseEnter={openMenu}
              onMouseLeave={scheduleClose}
              render={
                <Button
                  render={
                    <Link href="/dashboard" aria-label="Go to your dashboard" />
                  }
                  variant={active ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(!isHydrated && "opacity-0")}
                />
              }
            />
          }
        >
          <User className="h-5 w-5" />
        </TooltipTrigger>
        <TooltipContent>
          {isAuthenticated ? "Your dashboard" : "Log in"}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "transition-all duration-150", // Optional: smooths out width hydration shifts
          isAuthenticated ? "w-64" : "w-24",
        )}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2.5 px-1.5 py-1.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                {user?.initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {user?.name}
                </span>
              </span>
            </div>
            <DropdownMenuSeparator />
            {dashboardNav.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.href}
                  render={<Link href={item.href} />}
                  className={cn(
                    isDashboardSectionActive(pathname, item.href) &&
                      "bg-secondary text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem render={<Link href="/auth/login" />}>
              Log in
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/auth/signup" />}>
              Sign up
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type SiteHeaderProps = {
  categories: Category[];
};

export function SiteHeader({ categories }: SiteHeaderProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const packaging = packagingSlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean);
  const print = printSlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-8">
          <Logo />
          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Main navigation"
          >
            <ProductsMenu
              active={pathname.startsWith("/products")}
              categories={categories}
            />
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
          {/* Dashboard dropdown — desktop only; mobile uses the drawer */}
          <span className="hidden md:inline-flex">
            <DashboardMenu pathname={pathname} />
          </span>

          <span className="hidden md:inline-flex">
            <HeaderIconLink
              href="/track-order"
              label="Track an order"
              icon={Truck}
              active={pathname.startsWith("/track-order")}
            />
          </span>

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

          {/* Start an order — full button from md up; mobile uses the drawer CTA */}
          <Button
            render={<Link href="/products" />}
            className="hidden md:inline-flex"
          >
            Start an order
          </Button>

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
            <SheetContent side="right" className="flex w-80 flex-col p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <nav
                className="flex-1 overflow-y-auto overscroll-contain px-2 py-4"
                aria-label="Mobile navigation"
              >
                {isAuthenticated ? (
                  <>
                    <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Your dashboard
                    </p>
                    {dashboardNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                            isDashboardSectionActive(pathname, item.href)
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Account
                    </p>
                    <Link
                      href="/auth/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <LogIn className="h-4 w-4" />
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign up
                    </Link>
                  </>
                )}

                <div className="my-2 border-t border-border" />

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

                <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  More
                </p>
                {utilityNav.map((link) => {
                  const Icon = link.icon;
                  return (
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
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-border p-4">
                <Button
                  render={<Link href="/products" />}
                  onClick={() => setOpen(false)}
                  className="w-full"
                >
                  Start an order
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
