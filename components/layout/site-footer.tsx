import Link from "next/link";
import { Logo } from "./logo";
import { categories } from "@/lib/data";
import { Shield, Truck, CreditCard, Headphones } from "lucide-react";

const trust = [
  { icon: Truck, label: "Nationwide & global delivery" },
  { icon: Shield, label: "Quality guarantee" },
  { icon: CreditCard, label: "Secure payments" },
  { icon: Headphones, label: "Dedicated support" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 border-b border-border py-8 sm:grid-cols-4">
          {trust.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The world-class marketplace for packaging, branding, and
              commercial printing across Africa and beyond.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Products</h3>
            <ul className="mt-4 space-y-3">
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "About EnterPrint", url: "/about" },
                { label: "How it works", url: "/how-it-works" },
                { label: "Sustainability", url: "/sustainability" },
                { label: "Careers", url: "/careers" },
                { label: "Contact", url: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.url}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Help Center", url: "/help-center" },
                { label: "Track your order", url: "/track-order" },
                { label: "Delivery info", url: "/delivery-info" },
                { label: "Returns", url: "/returns" },
                { label: "Design guidelines", url: "/design-guidelines" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.url}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {"\u00A9"} {new Date().getFullYear()} EnterPrint. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
