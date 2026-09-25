// import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import "./globals.css";

import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { listCategories } from "@/lib/api/catalog-api";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderSkeleton } from "@/components/layout/site-header-skeleton";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "EnterPrint - Packaging, Branding & Commercial Printing Marketplace",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await listCategories();

  return (
    <html lang="en" className="light">
      <body
        className="bg-background font-sans antialiased"
        cz-shortcut-listen="true"
      >
        <AuthProvider>
          <CartProvider>
            {children}

            <Toaster position="top-center" />
          </CartProvider>
        </AuthProvider>

        {/* {process.env.NODE_ENV === "production" && <Analytics />} */}
      </body>
    </html>
  );
}
