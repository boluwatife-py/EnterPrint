import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import type { Product } from "@/lib/data"
import { formatNaira } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

export function ProductCard({ product, show_badge }: { product: Product, show_badge?: boolean }) {
  const from = Math.min(...product.quantityTiers.map((t) => t.unitPrice))
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xs border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.popular && show_badge && (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">Popular</Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-foreground text-pretty">{product.name}</h3>
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{product.tagline}</p>
        <div className="mt-3 flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <div>
            <span className="text-xs text-muted-foreground">from </span>
            <span className="font-bold text-foreground">{formatNaira(from)}</span>
            <span className="text-xs text-muted-foreground">/unit</span>
          </div>
          <span className="text-xs font-medium text-primary group-hover:underline">Customize</span>
        </div>
      </div>
    </Link>
  )
}
