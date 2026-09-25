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
  LogOut, 
  Menu, 
  X, 
  ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders & Payments", href: "/admin/orders", icon: ShoppingBag },
  { name: "Live Chat", href: "/admin/chat", icon: MessageSquare },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isHydrated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isHydrated && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [isHydrated, user, isAdmin, router]);

  if (!isHydrated || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground text-sm">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading admin portal...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight">Admin Portal</h1>
            <p className="text-[11px] text-muted-foreground">Management Console</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
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
                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer / Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between gap-3 px-2 py-2 mb-2">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">{user?.name}</span>
              <span className="text-[11px] text-muted-foreground truncate">{user?.email}</span>
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

      {/* Mobile Header & Sidebar Overlay */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-foreground">Admin Portal</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card p-4 md:hidden space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
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

        {/* Main Content View */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}