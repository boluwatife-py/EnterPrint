import { Suspense } from "react";

import { listCategories } from "@/lib/api/catalog-api";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderSkeleton } from "@/components/layout/site-header-skeleton";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await listCategories();

  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeader categories={categories} />
      </Suspense>

      <main className="flex-1">{children}</main>

      <SiteFooter categories={categories} />
    </div>
  );
}
