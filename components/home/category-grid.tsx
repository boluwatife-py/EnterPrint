import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/data";

const MAX_CATEGORIES = 10;

// Column spans per item index, tuned so every row fills exactly —
// no item left dangling at any breakpoint.
// md (4 cols): rows of [2,1,1] [2,1,1] [1,1,1,1] = 4,4,4
// lg (5 cols): rows of [2,1,1,1] [2,1,1,1] [2,3]   = 5,5,5
const spanClasses = [
  "md:col-span-2 lg:col-span-2", // 0
  "md:col-span-1 lg:col-span-1", // 1
  "md:col-span-1 lg:col-span-1", // 2
  "md:col-span-2 lg:col-span-1", // 3
  "md:col-span-1 lg:col-span-2", // 4
  "md:col-span-1 lg:col-span-1", // 5
  "md:col-span-1 lg:col-span-1", // 6
  "md:col-span-1 lg:col-span-1", // 7
  "md:col-span-1 lg:col-span-2", // 8
  "md:col-span-1 lg:col-span-3", // 9
];

export function CategoryGrid() {
  const displayedCategories = categories.slice(0, MAX_CATEGORIES);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything you print, in one place
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          See all categories
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {displayedCategories.map((category, i) => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className={`group relative flex flex-col justify-end overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${spanClasses[i]}`}
          >
            <div className="absolute inset-0">
              <Image
                src={category.image || "/placeholder.svg"}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-primary/85 via-primary/40 to-transparent" />
            </div>
            <div className="relative z-10 mt-24">
              <h3 className="font-semibold text-primary-foreground text-balance">
                {category.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-primary-foreground/80">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
