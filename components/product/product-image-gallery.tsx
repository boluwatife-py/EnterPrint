"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/lib/api/catalog-api";

type Props = {
  images: ProductImage[];
  fallbackImage: string;
  productName: string;
  popular: boolean;
};

export function ProductImageGallery({ images, fallbackImage, productName, popular }: Props) {
  // Fallback to single image or placeholder if array is empty
  const imageList = images && images.length > 0 ? images : [{ url: fallbackImage, isPrimary: true, altText: productName }];
  
  const [selectedImage, setSelectedImage] = useState<string>(
    imageList.find((img) => img.isPrimary)?.url || imageList[0].url
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Main Preview Box */}
      <div className="overflow-hidden rounded-2xl border border-border bg-secondary relative aspect-square">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-all duration-300"
        />
        {popular && (
          <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground">
            Popular
          </Badge>
        )}
      </div>

      {/* Thumbnails Row */}
      {imageList.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {imageList.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedImage(img.url)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedImage === img.url
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}