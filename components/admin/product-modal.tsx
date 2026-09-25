"use client";

import { useState, useEffect, useRef } from "react";
import { X, Trash2, Image as ImageIcon } from "lucide-react";
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

export interface ProductFormState {
  slug: string;
  name: string;
  categorySlug: string;
  tagline: string;
  description: string;
  image: string;
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
  onSubmit: (e: React.FormEvent, imageFile: File | null) => void;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (form.image) {
      setPreviewUrl(form.image);
    } else {
      setPreviewUrl("");
    }
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [form.image, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    setForm({ ...form, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, imageFile);
  };

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
                Image & Visibility
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-foreground">
                  Product Image
                </label>
                <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-secondary/20">
                  {previewUrl ? (
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border bg-secondary flex items-center justify-center shrink-0">
                      <img
                        src={previewUrl}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-destructive transition-colors"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-md border border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center text-muted-foreground shrink-0">
                      <ImageIcon className="h-5 w-5 mb-0.5 opacity-50" />
                      <span className="text-[9px]">No Image</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/gif"
                      onChange={handleImageChange}
                      className="cursor-pointer text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {imageFile ? (
                        <span className="text-primary font-medium">
                          Selected: {imageFile.name}
                        </span>
                      ) : (
                        "Upload image (PNG, JPEG, WEBP, GIF, max 5MB)."
                      )}
                    </p>
                  </div>
                </div>
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