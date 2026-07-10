"use client";

import { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { updateProfile } from "@/lib/account-api";
import type { ApiError } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm() {
  const { user, authFetch, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phoneNumber ?? "");
  const [saving, setSaving] = useState(false);

  const initials = (name || "You")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const phoneValid = Boolean(phone) && isValidPhoneNumber(phone);
  const nameValid = name.trim().length >= 2;
  const dirty = name !== (user?.name ?? "") || phone !== (user?.phoneNumber ?? "");
  const canSave = dirty && nameValid && phoneValid && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const updated = await updateProfile(authFetch, {
        name: name.trim(),
        phoneNumber: phone,
      });
      updateUser(updated);
      toast.success("Profile updated");
    } catch (error) {
      const message =
        (error as ApiError)?.message ?? "Could not update your profile.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-semibold text-foreground">
        Profile
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This information is used on invoices and order communications.
      </p>

      <div className="mt-6 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-secondary text-lg font-medium text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {name.length > 0 && !nameValid && (
            <p className="text-xs text-destructive">
              Enter at least 2 characters.
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={user?.email ?? ""}
            readOnly
            disabled
            aria-describedby="profile-email-hint"
          />
          <p id="profile-email-hint" className="text-xs text-muted-foreground">
            Contact support to change your email.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="profile-phone">Phone</Label>
          <PhoneInput
            id="profile-phone"
            international
            defaultCountry="NG"
            placeholder="Enter phone number"
            value={phone || undefined}
            onChange={(value) => setPhone(value ?? "")}
            className={`flex h-9 items-center gap-2 rounded-md border bg-transparent px-3 text-sm text-foreground transition-colors focus-within:ring-2 focus-within:ring-ring/50 ${
              phone && !phoneValid ? "border-destructive" : "border-border"
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
          {phone && !phoneValid && (
            <p className="text-xs text-destructive">
              Enter a valid phone number.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={!canSave}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
