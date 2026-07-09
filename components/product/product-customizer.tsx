"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Clock } from "lucide-react";
import { type Product, computePrice } from "@/lib/data";
import { useCart, type ArtworkInfo } from "@/lib/cart-context";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArtworkPicker } from "@/components/product/artwork-picker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductCustomizer({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();

  const sortedTiers = useMemo(
    () => [...product.quantityTiers].sort((a, b) => a.qty - b.qty),
    [product.quantityTiers],
  );

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const group of product.options) init[group.id] = group.values[0].id;
    return init;
  });
  const [qty, setQty] = useState(sortedTiers[0].qty);
  const [artwork, setArtwork] = useState<ArtworkInfo>({
    type: "upload",
    fileNames: [],
  });

  const { unitPrice, total } = useMemo(
    () => computePrice(product, selected, qty),
    [product, selected, qty],
  );

  const minDesignWords = 10;
  const isArtworkValid = useMemo(() => {
    if (artwork.type === "upload") return (artwork.fileNames?.length ?? 0) > 0;

    if (artwork.type === "design") {
      const wordCount = (artwork.brief ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      return wordCount >= minDesignWords;
    }

    return false;
  }, [artwork]);

  function optionLabelsFor(): { label: string; value: string }[] {
    return product.options.map((group) => {
      const value = group.values.find((v) => v.id === selected[group.id]);
      return { label: group.label, value: value?.label ?? "" };
    });
  }

  function handleAddToCart() {
    if (!isArtworkValid) {
      const message =
        artwork.type === "design"
          ? `Please describe your design request with at least ${minDesignWords} words.`
          : "Please upload at least one artwork file before adding to cart.";

      toast.error("Artwork required", { description: message });
      return;
    }

    addItem({
      id: crypto.randomUUID(),
      productSlug: product.slug,
      name: product.name,
      image: product.image,
      options: Object.fromEntries(
        product.options.map((g) => {
          const v = g.values.find((val) => val.id === selected[g.id]);
          return [g.label, v?.label ?? ""];
        }),
      ),
      optionLabels: optionLabelsFor(),
      quantity: qty,
      unitPrice,
      artwork,
    });
    toast.success("Added to cart", {
      description: `${qty.toLocaleString()} × ${product.name}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
  }

  return (
    <div className="space-y-6">
      {/* Options */}
      {product.options.map((group) => (
        <div key={group.id}>
          <Label className="text-sm font-medium text-foreground">
            {group.label}
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.values.map((value) => {
              const active = selected[group.id] === value.id;
              return (
                <button
                  key={value.id}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [group.id]: value.id }))
                  }
                  className={cn(
                    "rounded-lg border px-3.5 py-2 text-left text-sm transition-colors",
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                  )}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    {value.label}
                  </span>
                  {value.description && (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {value.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Quantity tiers */}
      <div>
        <Label className="text-sm font-medium text-foreground">Quantity</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {sortedTiers.map((tier) => {
            const active = qty === tier.qty;
            return (
              <button
                key={tier.qty}
                type="button"
                onClick={() => setQty(tier.qty)}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-center text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/40",
                )}
              >
                <span className="block font-medium">
                  {tier.qty.toLocaleString()}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {formatNaira(tier.unitPrice)}/unit
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Custom quantity</span>
          <div className="flex items-center rounded-lg border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 10))}
              className="px-2.5 py-2 text-muted-foreground hover:text-foreground"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 border-x border-border bg-transparent py-2 text-center text-sm text-foreground outline-none"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 10)}
              className="px-2.5 py-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Artwork */}
      <div>
        <Label className="text-sm font-medium text-foreground">Artwork</Label>
        <div className="mt-2">
          <ArtworkPicker value={artwork} onChange={setArtwork} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {artwork.type === "design"
            ? `Describe your idea in at least ${minDesignWords} words, or switch to upload if you already have files.`
            : "Upload one or more files to continue."}
        </p>
      </div>

      {/* Price summary */}
      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {qty.toLocaleString()} units × {formatNaira(unitPrice)}
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatNaira(total)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {product.turnaroundDays}-day turnaround
          </div>
        </div>
        <Button
          size="lg"
          className="mt-4 w-full"
          onClick={handleAddToCart}
          disabled={!isArtworkValid}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
