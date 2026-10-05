"use client";

import { useRef } from "react";
import {
  X,
  Trash2,
  Image as ImageIcon,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AdminCategory,
  type OptionGroup,
  type QuantityTier,
} from "@/lib/api/admin";

export const MAX_IMAGES = 8;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** One image in the product gallery as edited in the form. */
export interface ProductImageForm {
  key: string; // stable React key
  url: string; // server URL ("" until a new file has been uploaded)
  previewUrl: string; // what the <img> shows (server URL or blob: URL)
  altText: string;
  isPrimary: boolean;
  file?: File; // set only for images picked but not yet uploaded
}

interface ApiProductImage {
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  displayOrder?: number;
}

const newKey = () => Math.random().toString(36).slice(2);

/** Guarantee exactly one primary image (the first one if none is flagged). */
export function normalizeImages(
  images: ProductImageForm[],
): ProductImageForm[] {
  if (images.length === 0) return images;
  const idx = Math.max(
    0,
    images.findIndex((i) => i.isPrimary),
  );
  return images.map((img, n) => ({ ...img, isPrimary: n === idx }));
}

/** Free blob: URLs created for not-yet-uploaded files. */
export function revokeImagePreviews(images: ProductImageForm[]) {
  images.forEach((i) => {
    if (i.previewUrl.startsWith("blob:")) URL.revokeObjectURL(i.previewUrl);
  });
}

/** Build form images from an API product (falls back to the single `image`). */
export function toImageForms(p: {
  images?: ApiProductImage[] | null;
  image?: string | null;
}): ProductImageForm[] {
  const fromApi = [...(p.images ?? [])]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((i) => ({
      key: newKey(),
      url: i.url,
      previewUrl: i.url,
      altText: i.altText ?? "",
      isPrimary: !!i.isPrimary,
    }));
  if (fromApi.length) return normalizeImages(fromApi);
  if (p.image) {
    return [
      {
        key: newKey(),
        url: p.image,
        previewUrl: p.image,
        altText: "",
        isPrimary: true,
      },
    ];
  }
  return [];
}

export interface ProductFormState {
  slug: string;
  name: string;
  categorySlug: string;
  tagline: string;
  description: string;
  images: ProductImageForm[];
  basePrice: number;
  turnaroundDays: number;
  popular: boolean;
  isActive: boolean;
  tags: string[];
  features: string[];
  options: OptionGroup[];
  quantityTiers: QuantityTier[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  onDelete: () => void;
  editingId: string | null;
  submitting: boolean;
  deleting: boolean;
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  categories: AdminCategory[];
}

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingId,
  submitting,
  deleting,
  form,
  setForm,
  categories,
}: ProductModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  // --- Image Gallery Handlers ---
  const setImages = (images: ProductImageForm[]) =>
    setForm({ ...form, images: normalizeImages(images) });

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file later
    if (files.length === 0) return;

    const slots = MAX_IMAGES - form.images.length;
    if (slots <= 0) {
      toast.error(`You can add up to ${MAX_IMAGES} images per product.`);
      return;
    }

    const accepted: ProductImageForm[] = [];
    for (const file of files) {
      if (accepted.length >= slots) {
        toast.error(`Only ${MAX_IMAGES} images allowed; extra files skipped.`);
        break;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is larger than 5MB and was skipped.`);
        continue;
      }
      accepted.push({
        key: newKey(),
        url: "",
        previewUrl: URL.createObjectURL(file),
        altText: "",
        isPrimary: false,
        file,
      });
    }
    if (accepted.length) setImages([...form.images, ...accepted]);
  };

  const removeImage = (index: number) => {
    const target = form.images[index];
    if (target.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(target.previewUrl);
    }
    setImages(form.images.filter((_, n) => n !== index));
  };

  const makePrimary = (index: number) =>
    setImages(
      form.images.map((img, n) => ({ ...img, isPrimary: n === index })),
    );

  const moveImage = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= form.images.length) return;
    const next = [...form.images];
    [next[index], next[to]] = [next[to], next[index]];
    setImages(next);
  };

  const updateImageAlt = (index: number, altText: string) =>
    setImages(
      form.images.map((img, n) => (n === index ? { ...img, altText } : img)),
    );

  // --- Option Group State Handlers ---
  const addOptionGroup = () => {
    setForm({
      ...form,
      options: [
        ...form.options,
        { label: "", values: [{ id: "", label: "", priceMultiplier: 1.0 }] },
      ],
    });
  };

  const removeOptionGroup = (groupIndex: number) => {
    const next = [...form.options];
    next.splice(groupIndex, 1);
    setForm({ ...form, options: next });
  };

  const updateOptionGroupLabel = (groupIndex: number, label: string) => {
    const next = [...form.options];
    next[groupIndex].label = label;
    setForm({ ...form, options: next });
  };

  const addOptionValue = (groupIndex: number) => {
    const next = [...form.options];
    next[groupIndex].values.push({ id: "", label: "", priceMultiplier: 1.0 });
    setForm({ ...form, options: next });
  };

  const removeOptionValue = (groupIndex: number, valueIndex: number) => {
    const next = [...form.options];
    next[groupIndex].values.splice(valueIndex, 1);
    setForm({ ...form, options: next });
  };

  const updateOptionValue = (
    groupIndex: number,
    valueIndex: number,
    field: string,
    value: any,
  ) => {
    const next = [...form.options];
    next[groupIndex].values[valueIndex] = {
      ...next[groupIndex].values[valueIndex],
      [field]: value,
    };
    setForm({ ...form, options: next });
  };

  // --- Quantity Tier State Handlers ---
  const addQuantityTier = () => {
    setForm({
      ...form,
      quantityTiers: [...form.quantityTiers, { qty: 10, unitPrice: 0 }],
    });
  };

  const removeQuantityTier = (index: number) => {
    const next = [...form.quantityTiers];
    next.splice(index, 1);
    setForm({ ...form, quantityTiers: next });
  };

  const updateQuantityTier = (index: number, field: string, value: number) => {
    const next = [...form.quantityTiers];
    next[index] = { ...next[index], [field]: value };
    setForm({ ...form, quantityTiers: next });
  };

  // Resolve display name for the selected category slug
  const selectedCategoryName =
    categories.find((c) => c.slug === form.categorySlug)?.name ||
    form.categorySlug;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Outer container uses flexbox layout, locked to max height, no scroll on root */}
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden sm:max-w-2xl">
        {/* Fixed Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            {editingId ? "Edit Product" : "Create Product"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Fill out the product information, configuration groups, and tiers
            below.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Body with hidden scrollbar */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 hide-scrollbar">
          <form
            id="product-form"
            onSubmit={handleFormSubmit}
            className="space-y-6"
          >
            {/* Section: General Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                General Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Luxury Business Cards"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    URL Slug <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. luxury-business-cards"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Category
                  </label>
                  <Select
                    value={form.categorySlug}
                    onValueChange={(val) =>
                      setForm({ ...form, categorySlug: val || "" })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category">
                        {selectedCategoryName || "Select category"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Base Price (₦) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm({ ...form, basePrice: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Turnaround (Days)
                  </label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={form.turnaroundDays}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        turnaroundDays: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Tagline
                </label>
                <Input
                  value={form.tagline}
                  onChange={(e) =>
                    setForm({ ...form, tagline: e.target.value })
                  }
                  placeholder="Short marketing hook..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-input rounded-md p-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Detailed product specifications..."
                />
              </div>
            </div>

            {/* Section: Image & Status */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Images & Visibility
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-foreground">
                    Product Images{" "}
                    <span className="text-muted-foreground font-normal">
                      ({form.images.length}/{MAX_IMAGES})
                    </span>
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={form.images.length >= MAX_IMAGES}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                </div>

                {form.images.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-28 rounded-lg border border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <ImageIcon className="h-6 w-6 mb-1 opacity-50" />
                    <span className="text-xs">
                      Click to upload (PNG, JPEG, WEBP, GIF, max 5MB each)
                    </span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {form.images.map((img, index) => (
                      <div
                        key={img.key}
                        className={`rounded-lg border bg-secondary/20 p-2 space-y-2 ${
                          img.isPrimary ? "border-primary" : "border-border"
                        }`}
                      >
                        <div className="relative aspect-square rounded-md overflow-hidden bg-secondary">
                          <img
                            src={img.previewUrl}
                            alt={img.altText || `Product image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {img.isPrimary && (
                            <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              Primary
                            </span>
                          )}
                          {img.file && (
                            <span className="absolute left-1 bottom-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                              New
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-destructive transition-colors"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>

                        <Input
                          value={img.altText}
                          onChange={(e) =>
                            updateImageAlt(index, e.target.value)
                          }
                          placeholder="Alt text (optional)"
                          className="h-8 text-xs"
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveImage(index, -1)}
                              disabled={index === 0}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                              title="Move earlier"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(index, 1)}
                              disabled={index === form.images.length - 1}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                              title="Move later"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => makePrimary(index)}
                            disabled={img.isPrimary}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary disabled:text-primary"
                            title="Use as the main product image"
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${img.isPrimary ? "fill-current" : ""}`}
                            />
                            {img.isPrimary ? "Main" : "Set main"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  The main image is shown in listings. Order here is the order
                  customers see them in.
                </p>
              </div>

              <div className="flex flex-wrap gap-6 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="popular"
                    checked={form.popular}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, popular: checked === true })
                    }
                  />
                  <Label
                    htmlFor="popular"
                    className="text-xs font-medium text-foreground cursor-pointer"
                  >
                    Mark as Popular Item
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, isActive: checked === true })
                    }
                  />
                  <Label
                    htmlFor="isActive"
                    className="text-xs font-medium text-foreground cursor-pointer"
                  >
                    Active Status (Visible to Customers)
                  </Label>
                </div>
              </div>
            </div>

            {/* Section: Options */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Option Groups
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addOptionGroup}
                  className="h-8 text-xs"
                >
                  + Add Group
                </Button>
              </div>

              {form.options.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeOptionGroup(groupIndex)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="max-w-xs">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                      Group Label
                    </label>
                    <Input
                      placeholder="e.g. Size"
                      value={group.label}
                      onChange={(e) =>
                        updateOptionGroupLabel(groupIndex, e.target.value)
                      }
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                      <span>Values & Multipliers</span>
                      <button
                        type="button"
                        onClick={() => addOptionValue(groupIndex)}
                        className="text-primary hover:underline text-xs"
                      >
                        + Add Value
                      </button>
                    </div>

                    {group.values.map((val, valIndex) => (
                      <div key={valIndex} className="flex gap-2 items-center">
                        <Input
                          placeholder="ID"
                          value={val.id}
                          onChange={(e) =>
                            updateOptionValue(
                              groupIndex,
                              valIndex,
                              "id",
                              e.target.value,
                            )
                          }
                          className="h-9 text-xs"
                        />
                        <Input
                          placeholder="Label"
                          value={val.label}
                          onChange={(e) =>
                            updateOptionValue(
                              groupIndex,
                              valIndex,
                              "label",
                              e.target.value,
                            )
                          }
                          className="h-9 text-xs"
                        />
                        <Input
                          type="number"
                          step="any"
                          placeholder="Multiplier"
                          value={val.priceMultiplier}
                          onChange={(e) =>
                            updateOptionValue(
                              groupIndex,
                              valIndex,
                              "priceMultiplier",
                              Number(e.target.value),
                            )
                          }
                          className="h-9 text-xs w-28"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeOptionValue(groupIndex, valIndex)
                          }
                          className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Section: Tiers */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quantity Tiers
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addQuantityTier}
                  className="h-8 text-xs"
                >
                  + Add Tier
                </Button>
              </div>

              {form.quantityTiers.map((tier, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-center bg-secondary/20 p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                      Minimum Qty
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={tier.qty}
                      onChange={(e) =>
                        updateQuantityTier(index, "qty", Number(e.target.value))
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                      Unit Price (₦)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={tier.unitPrice}
                      onChange={(e) =>
                        updateQuantityTier(
                          index,
                          "unitPrice",
                          Number(e.target.value),
                        )
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuantityTier(index)}
                    className="text-muted-foreground hover:text-destructive self-end mb-1 p-2 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Fixed Footer Actions */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-border shrink-0 bg-card">
          {editingId ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={deleting}
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete product"}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="product-form"
              size="sm"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create product"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
