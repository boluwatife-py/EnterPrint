import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeaderSkeleton } from "@/components/layout/site-header-skeleton";

export const metadata: Metadata = {
  title: "EnterPrint — Packaging, Branding & Commercial Printing Marketplace",
  description:
    "Order custom packaging, labels, business cards, banners and branded merch online. Customize products, upload artwork, track production and get delivery anywhere. Africa's world-class printing marketplace.",
  generator: "v0.app",
  keywords: [
    "printing",
    "packaging",
    "custom boxes",
    "business cards",
    "labels",
    "Nigeria printing",
    "branding",
  ],
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#1a2340",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className="antialiased bg-background font-sans"
        cz-shortcut-listen="true"
      >
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-dvh flex-col">
              <Suspense fallback={<SiteHeaderSkeleton />}>
                <SiteHeader />
              </Suspense>
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster position="top-center" />
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
