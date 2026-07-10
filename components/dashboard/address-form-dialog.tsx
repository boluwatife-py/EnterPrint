// components/dashboard/address-form-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import type { Address, AddressInput } from "@/lib/account-api";
import { NIGERIAN_STATES } from "@/lib/account-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type FormState = {
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  streetAddress: "",
  city: "",
  state: "",
  country: "Nigeria",
};

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  hasOtherAddresses,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address | null;
  hasOtherAddresses: boolean;
  onSubmit: (input: AddressInput) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [makeDefault, setMakeDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(address);

  useEffect(() => {
    if (!open) return;
    if (address) {
      setForm({
        title: address.title,
        streetAddress: address.streetAddress,
        city: address.city,
        state: address.state,
        country: address.country || "Nigeria",
      });
      setMakeDefault(address.isDefault);
    } else {
      setForm(EMPTY_FORM);
      setMakeDefault(!hasOtherAddresses);
    }
  }, [open, address, hasOtherAddresses]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid =
    form.title.trim() &&
    form.streetAddress.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.country.trim();

  async function handleSubmit() {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        streetAddress: form.streetAddress.trim(),
        city: form.city.trim(),
        state: form.state,
        country: form.country.trim() || "Nigeria",
        // A default address can't be un-defaulted here; keep it default.
        isDefault: address?.isDefault ? true : makeDefault,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-sm">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {isEditing ? "Edit address" : "Add address"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this delivery address."
              : "Save a delivery address for faster checkout."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="addr-title">Label</Label>
            <Input
              id="addr-title"
              placeholder="Home, Office…"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="addr-street">Street address</Label>
            <Input
              id="addr-street"
              placeholder="14 Awolowo Road, Flat 3B"
              value={form.streetAddress}
              onChange={(e) => update("streetAddress", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="addr-city">City</Label>
              <Input
                id="addr-city"
                placeholder="City"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addr-state">State</Label>
              <Select
                value={form.state || undefined}
                onValueChange={(value) => update("state", value ?? "")}
              >
                <SelectTrigger id="addr-state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="addr-country">Country</Label>
            <Input
              id="addr-country"
              placeholder="Country"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </div>

          {!address?.isDefault && (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={makeDefault}
                onCheckedChange={(v) => setMakeDefault(Boolean(v))}
                disabled={!hasOtherAddresses}
              />
              Set as default delivery address
            </label>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!isValid || saving} onClick={handleSubmit}>
            {saving
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Add address"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
