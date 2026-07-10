// components/dashboard/addresses-browser.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, MoreHorizontal, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
  type Address,
  type AddressInput,
} from "@/lib/account-api";
import type { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddressFormDialog } from "./address-form-dialog";

export function AddressesBrowser() {
  const { authFetch } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAddresses(authFetch)
      .then((data) => {
        if (!cancelled) setAddresses(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load your addresses.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setDialogOpen(true);
  }

  // Setting an address default unsets the others server-side; mirror that here.
  function mergeSaved(saved: Address) {
    setAddresses((prev) => {
      const exists = prev.some((a) => a.id === saved.id);
      const next = exists
        ? prev.map((a) => (a.id === saved.id ? saved : a))
        : [...prev, saved];
      return saved.isDefault
        ? next.map((a) => ({ ...a, isDefault: a.id === saved.id }))
        : next;
    });
  }

  async function handleSubmit(input: AddressInput) {
    try {
      if (editing) {
        const saved = await updateAddress(authFetch, editing.id, input);
        mergeSaved(saved);
        toast.success("Address updated");
      } else {
        const saved = await createAddress(authFetch, input);
        mergeSaved(saved);
        toast.success("Address added");
      }
    } catch (error) {
      toast.error((error as ApiError)?.message ?? "Could not save the address.");
      throw error;
    }
  }

  async function handleSetDefault(address: Address) {
    const previous = addresses;
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === address.id })),
    );
    try {
      await updateAddress(authFetch, address.id, { isDefault: true });
      toast.success("Default address updated");
    } catch (error) {
      setAddresses(previous);
      toast.error((error as ApiError)?.message ?? "Could not set default.");
    }
  }

  async function handleDelete(id: string) {
    const previous = addresses;
    setAddresses((prev) => {
      const removed = prev.find((a) => a.id === id);
      const rest = prev.filter((a) => a.id !== id);
      if (removed?.isDefault && rest.length > 0) {
        rest[0] = { ...rest[0], isDefault: true };
      }
      return rest;
    });
    try {
      await deleteAddress(authFetch, id);
      toast.success("Address removed");
    } catch (error) {
      setAddresses(previous);
      toast.error((error as ApiError)?.message ?? "Could not remove address.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading addresses…
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add address
        </Button>
      </div>

      {addresses.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{address.title}</p>
                    {address.isDefault && (
                      <Badge variant="secondary" className="mt-1">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Actions for ${address.title}`}
                      />
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(address)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {!address.isDefault && (
                      <DropdownMenuItem onClick={() => handleSetDefault(address)}>
                        <Star className="mr-2 h-4 w-4" />
                        Set as default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(address.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="text-sm leading-relaxed text-muted-foreground">
                <p>{address.streetAddress}</p>
                <p>
                  {address.city}, {address.state}
                </p>
                <p>{address.country}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <MapPin className="h-6 w-6 text-muted-foreground" />
          <p className="font-medium text-foreground">No saved addresses</p>
          <p className="text-sm text-muted-foreground">
            Add a delivery address to speed up checkout.
          </p>
          <Button size="sm" className="mt-2" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add address
          </Button>
        </div>
      )}

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editing}
        hasOtherAddresses={addresses.length > 0}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
