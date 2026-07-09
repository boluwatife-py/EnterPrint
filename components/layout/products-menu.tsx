// components/products-menu.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Package,
  PackageOpen,
  Sticker,
  CreditCard,
  FilePen,
  FileText,
  BookOpen,
  Flag,
  Signpost,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

export const categoryIcons: Record<string, LucideIcon> = {
  package: Package,
  "package-open": PackageOpen,
  sticker: Sticker,
  "credit-card": CreditCard,
  "file-pen": FilePen,
  "file-text": FileText,
  "book-open": BookOpen,
  flag: Flag,
  signpost: Signpost,
  shirt: Shirt,
};

export const packagingSlugs = [
  "boxes-packaging",
  "pouches-flexible",
  "labels-stickers",
  "signage-displays",
];
export const printSlugs = [
  "business-cards",
  "stationery",
  "flyers-leaflets",
  "booklets-catalogs",
  "large-format",
  "branded-merch",
];

function CategoryLink({
  slug,
  name,
  description,
  icon,
}: {
  slug: string;
  name: string;
  description: string;
  icon: string;
}) {
  const Icon = categoryIcons[icon];
  return (
    <NavigationMenuLink
      render={<Link href={`/products?category=${slug}`} />}
      className="group/item flex items-start gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-secondary"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors group-hover/item:bg-background group-hover/item:text-foreground">
        {Icon && <Icon className="h-4 w-4" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">
          {name}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </NavigationMenuLink>
  );
}

export function ProductsMenu({ active }: { active?: boolean }) {
  const router = useRouter();
  const packaging = packagingSlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean);
  const print = printSlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            onClick={() => router.push("/products")}
            className={cn(
              "bg-transparent! px-0! text-sm font-medium",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Products
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid grid-cols-[260px_260px_200px] gap-8 p-8">
              <div>
                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Packaging
                </p>
                <div className="flex flex-col gap-1">
                  {packaging.map((c) => (
                    <CategoryLink
                      key={c!.slug}
                      slug={c!.slug}
                      name={c!.name}
                      description={c!.description}
                      icon={c!.icon}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Paper print
                </p>
                <div className="flex flex-col gap-1">
                  {print.map((c) => (
                    <CategoryLink
                      key={c!.slug}
                      slug={c!.slug}
                      name={c!.name}
                      description={c!.description}
                      icon={c!.icon}
                    />
                  ))}
                </div>
              </div>

              <NavigationMenuLink
                render={<Link href="/design-request" />}
                className="flex flex-col justify-between rounded-xl bg-secondary p-4 transition-colors hover:bg-secondary/70"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Not sure what you need?
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Tell us your brief and we&apos;ll design it for you.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Request a design
                  <ArrowRight className="h-3 w-3" />
                </span>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
