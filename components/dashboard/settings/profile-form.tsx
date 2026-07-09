"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    company: user?.company ?? "",
  });
  const [saving, setSaving] = useState(false);

  const initials = (form.name || "You")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaving(true);
    // Mock save — replace with a PATCH /api/account call.
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated");
    }, 600);
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
        <div>
          <Button variant="outline" size="sm">
            <Camera className="mr-2 h-4 w-4" />
            Change photo
          </Button>
          <p className="mt-1.5 text-xs text-muted-foreground">
            JPG or PNG, up to 2MB.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+234…"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="profile-company">Company (optional)</Label>
          <Input
            id="profile-company"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Business name"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}