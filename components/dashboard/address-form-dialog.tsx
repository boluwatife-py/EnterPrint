// components/dashboard/address-form-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import type { Address } from "@/lib/mock-addresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type FormState = Omit<Address, "id" | "isDefault">;

const EMPTY_FORM: FormState = {
  label: "",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  hasOtherAddresses,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address | null;
  hasOtherAddresses: boolean;
  onSave: (address: Address) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [makeDefault, setMakeDefault] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const isEditing = Boolean(address);

  useEffect(() => {
    if (!open) return;
    if (address) {
      const { id, isDefault, ...rest } = address;
      setForm(rest);
      setMakeDefault(isDefault);
    } else {
      setForm(EMPTY_FORM);
      setMakeDefault(!hasOtherAddresses);
    }
    setPhoneTouched(false);
  }, [open, address, hasOtherAddresses]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const phoneValid = Boolean(form.phone) && isValidPhoneNumber(form.phone);

  const isValid =
    form.label.trim() &&
    form.fullName.trim() &&
    phoneValid &&
    form.line1.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.country.trim();

  function handleSubmit() {
    if (!isValid) return;
    onSave({
      id: address?.id ?? crypto.randomUUID(),
      isDefault: address?.isDefault ? true : makeDefault,
      ...form,
    });
    onOpenChange(false);
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
            <Label htmlFor="addr-label">Label</Label>
            <Input
              id="addr-label"
              placeholder="Home, Office…"
              value={form.label}
              onChange={(e) => update("label", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="addr-name">Full name</Label>
            <Input
              id="addr-name"
              placeholder="Who should we address it to?"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="addr-phone">Phone</Label>
            <PhoneInput
              id="addr-phone"
              international
              defaultCountry="NG"
              placeholder="Enter phone number"
              value={form.phone || undefined}
              onChange={(value) => update("phone", value ?? "")}
              onBlur={() => setPhoneTouched(true)}
              className={`flex h-9 items-center gap-2 rounded-md border bg-transparent outline-0 focus:outline-0  px-3 text-sm text-foreground transition-colors focus-within:ring-2 focus-within:ring-ring/50 ${
                phoneTouched && form.phone && !phoneValid
                  ? "border-destructive"
                  : "border-border"
              }`}
              numberInputProps={{
                className:
                  "flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground",
              }}
              countrySelectProps={{
                className:
                  "bg-transparent text-sm text-foreground outline-none border-none pr-1",
              }}
            />
            {phoneTouched && form.phone && !phoneValid && (
              <p className="text-xs text-destructive">
                Enter a valid phone number.
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="addr-line1">Address line 1</Label>
            <Input
              id="addr-line1"
              placeholder="Street address"
              value={form.line1}
              onChange={(e) => update("line1", e.target.value)}
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
              <Input
                id="addr-state"
                placeholder="State"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
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
          <Button disabled={!isValid} onClick={handleSubmit}>
            {isEditing ? "Save changes" : "Add address"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}