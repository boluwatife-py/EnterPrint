"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Package, ImageIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminProducts,
  getAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadAdminImage,
  type Product,
  type AdminCategory,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNaira } from "@/lib/utils/format";
import { toast } from "sonner";
import {
  ProductModal,
  type ProductFormState,
} from "@/components/admin/product-modal";

export default function AdminProductsPage() {
  const { accessToken, isHydrated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<ProductFormState>({
    slug: "",
    name: "",
    categorySlug: "",
    tagline: "",
    description: "",
    image: "",
    basePrice: 0,
    turnaroundDays: 7,
    popular: false,
    isActive: true,
    tags: [],
    features: [],
    options: [],
    quantityTiers: [],
  });

  const loadData = useCallback(async () => {
    if (!isHydrated || !accessToken) return;
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        getAdminProducts(accessToken, search, selectedCategory, selectedStatus),
        getAdminCategories(accessToken),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      toast.error("Failed to load catalog inventory.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, isHydrated, search, selectedCategory, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      slug: "",
      name: "",
      categorySlug: categories[0]?.slug || "",
      tagline: "",
      description: "",
      image: "",
      basePrice: 0,
      turnaroundDays: 7,
      popular: false,
      isActive: true,
      tags: [],
      features: [],
      options: [],
      quantityTiers: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      name: p.name,
      categorySlug: p.categorySlug,
      tagline: p.tagline || "",
      description: p.description || "",
      image: p.image || "",
      basePrice: p.basePrice,
      turnaroundDays: p.turnaroundDays,
      popular: p.popular,
      isActive: p.isActive === true,
      tags: p.tags || [],
      features: p.features || [],
      options: p.options || [],
      quantityTiers: p.quantityTiers || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, imageFile: File | null) => {
    e.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    try {
      let imageUrl = form.image;

      if (imageFile) {
        const uploadRes = await uploadAdminImage(accessToken, imageFile);
        imageUrl = uploadRes.url;
      }

      const payload = {
        ...form,
        image: imageUrl,
      };

      if (editingId) {
        await updateAdminProduct(accessToken, editingId, payload);
        toast.success("Product updated successfully.");
      } else {
        await createAdminProduct(accessToken, payload);
        toast.success("Product created successfully.");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(
        err.message ||
          "Failed to save product. Check unique slugs or field formats.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !editingId) return;
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(true);
    try {
      await deleteAdminProduct(accessToken, editingId);
      toast.success("Product deleted.");
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error("Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters =
    search || selectedCategory !== "all" || selectedStatus !== "all";

  // Lookup helper for category name display
  const getCategoryName = (slug: string) => {
    const found = categories.find((c) => c.slug === slug);
    return found ? found.name : slug;
  };

  const selectedCategoryDisplayName =
    selectedCategory === "all"
      ? "All Categories"
      : getCategoryName(selectedCategory);

  // Status display label lookup
  const getStatusDisplayName = (statusVal: string) => {
    if (statusVal === "true") return "Active";
    if (statusVal === "false") return "Inactive";
    return "All Status";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Products Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage catalog items, pricing tiers, and configuration options.
            Click any row to edit.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or slug..."
            className="h-11 pl-9 w-full"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val || "all")}
          >
            <SelectTrigger className="w-full sm:w-48 h-10">
              <SelectValue placeholder="All Categories">
                {selectedCategoryDisplayName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => setSelectedStatus(val || "all")}
          >
            <SelectTrigger className="w-full sm:w-36 h-10">
              <SelectValue placeholder="All Status">
                {getStatusDisplayName(selectedStatus)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground h-10 px-2 w-full sm:w-auto justify-center"
              title="Clear filters"
            >
              <X className="h-4 w-4 mr-1 sm:mr-0" />
              <span className="sm:hidden">Clear filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Products Display Container */}
      <div className="rounded-sm sm:rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium text-foreground">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Base Price</th>
                    <th className="p-4">Turnaround</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => openEditModal(p)}
                      className="hover:bg-muted/60 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 flex items-center gap-3">
                        {p.image ? (
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-secondary border border-border shrink-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-secondary/60 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                            <ImageIcon className="h-4 w-4 opacity-50" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {p.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {p.slug}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {getCategoryName(p.categorySlug)}
                        </Badge>
                      </td>
                      <td className="p-4 font-semibold text-foreground">
                        {formatNaira(p.basePrice)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {p.turnaroundDays} days
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        {!p.isActive ? (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Inactive
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          >
                            Active
                          </Badge>
                        )}
                        {p.popular && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                            Popular
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openEditModal(p)}
                  className="p-4 space-y-3 hover:bg-muted/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-secondary/60 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                          <ImageIcon className="h-5 w-5 opacity-50" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-foreground text-sm">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {p.slug}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Price & Turnaround
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatNaira(p.basePrice)}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        • {p.turnaroundDays} days
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <Badge variant="secondary" className="text-[10px]">
                        {getCategoryName(p.categorySlug)}
                      </Badge>
                      {!p.isActive ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground"
                        >
                          Inactive
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        >
                          Active
                        </Badge>
                      )}
                      {p.popular && (
                        <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Extracted Modal Component */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        editingId={editingId}
        submitting={submitting}
        deleting={deleting}
        form={form}
        setForm={setForm}
        categories={categories}
      />
    </div>
  );
}