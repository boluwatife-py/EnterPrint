// components/dashboard/addresses-browser.tsx
"use client";

import { useState } from "react";
import { MapPin, MoreHorizontal, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/lib/mock-addresses";
import { mockAddresses } from "@/lib/mock-addresses";
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
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setDialogOpen(true);
  }

  function handleSave(address: Address) {
    setAddresses((prev) => {
      const exists = prev.some((a) => a.id === address.id);
      const next = exists
        ? prev.map((a) => (a.id === address.id ? address : a))
        : [...prev, address];
      return address.isDefault
        ? next.map((a) => ({ ...a, isDefault: a.id === address.id }))
        : next;
    });
    toast.success(editing ? "Address updated" : "Address added");
  }

  function handleSetDefault(id: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success("Default address updated");
  }

  function handleDelete(id: string) {
    setAddresses((prev) => {
      const removed = prev.find((a) => a.id === id);
      const rest = prev.filter((a) => a.id !== id);
      if (removed?.isDefault && rest.length > 0) {
        rest[0] = { ...rest[0], isDefault: true };
      }
      return rest;
    });
    toast.success("Address removed");
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
                    <p className="text-sm font-medium text-foreground">{address.label}</p>
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
                        aria-label={`Actions for ${address.label}`}
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
                      <DropdownMenuItem onClick={() => handleSetDefault(address.id)}>
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
                <p className="font-medium text-foreground">{address.fullName}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}, {address.state}
                  {address.postalCode ? ` ${address.postalCode}` : ""}
                </p>
                <p>{address.country}</p>
                <p className="mt-1">{address.phone}</p>
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
        onSave={handleSave}
      />
    </div>
  );
}