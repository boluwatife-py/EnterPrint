"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  CreditCard,
  LogOut,
  Menu,
  X,
  Printer,
  PaintRoller,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Sidebar / mobile menu entries for the EnterPrint admin console. */
const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Desingn Requests", href: "/admin/design-requests", icon: PaintRoller },
];

/**
 * Decide whether a nav item should be highlighted for the current URL.
 *
 * "/admin" is a prefix of every admin URL, so it needs an exact match or it
 * would stay lit everywhere. Everything else matches by path segment, so
 * "/admin/orders/EP-12345" highlights "Orders" while "/admin/orders-archive"
 * never matches "/admin/orders".
 *
 * @param pathname - Current URL path from `usePathname()`.
 * @param href - The nav item's target path.
 * @returns True when the item represents the current section.
 */
function isRouteActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Brand mark shown at the top of the sidebar and the mobile header.
 *
 * @param compact - Use the smaller mobile-header sizing and hide the tagline.
 */
function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact ? "gap-2.5" : "gap-3")}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary/10 text-primary",
          compact ? "h-8 w-8" : "h-9 w-9"
        )}
      >
        <Printer className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </div>
      <div>
        <h1 className="text-sm font-semibold text-foreground tracking-tight">
          EnterPrint Admin
        </h1>
        {!compact && (
          <p className="text-[11px] text-muted-foreground">
            Packaging &amp; Print Console
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Shell for every /admin route in the EnterPrint portal.
 *
 * The shell is locked to the viewport height (`h-dvh` + `overflow-hidden`), so
 * the page itself never scrolls. The sidebar (desktop) and header (mobile)
 * therefore stay put, and only the <main> content area scrolls.
 *
 * Also acts as the auth guard: non-admins are redirected to the storefront.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isHydrated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Once auth state has hydrated, bounce anyone who isn't a signed-in admin.
  useEffect(() => {
    if (isHydrated && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [isHydrated, user, isAdmin, router]);

  // Close the mobile menu on navigation so it doesn't cover the new page.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Render a loader (never the admin UI) until we know the user is an admin.
  if (!isHydrated || !isAdmin) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground text-sm">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading EnterPrint admin...
        </div>
      </div>
    );
  }

  return (
    // Fixed-height shell: overflow-hidden stops the body from scrolling.
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      {/* Desktop Sidebar: full height, never scrolls with the page */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-border bg-card">
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
          <BrandMark />
        </div>

        {/* Navigation Links (scrolls internally only if the list outgrows the screen) */}
        <nav className="flex-1 min-h-0 space-y-1.5 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive = isRouteActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer / Logout: pinned to the bottom of the sidebar */}
        <div className="shrink-0 p-4 border-t border-border">
          <div className="flex items-center justify-between gap-3 px-2 py-2 mb-2">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                {user?.name}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Right column: mobile header on top, scrollable content below */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col">
        {/* Mobile header: sits above <main>, so it stays visible while content scrolls */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <BrandMark compact />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Dropdown Menu (capped height so it can never push content off-screen) */}
        {mobileMenuOpen && (
          <div className="shrink-0 max-h-[70dvh] overflow-y-auto border-b border-border bg-card p-4 md:hidden space-y-1">
            {navigation.map((item) => {
              const isActive = isRouteActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-border">
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        )}

        {/* Main Content View: the ONLY scroll container on the page */}
        <main className="flex-1 min-h-0 w-full overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}