"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type Channel = "email" | "sms";
type PrefKey =
  | "orderUpdates"
  | "proofReady"
  | "deliveryUpdates"
  | "messages"
  | "promotions";

const PREFS: { key: PrefKey; label: string; description: string }[] = [
  {
    key: "orderUpdates",
    label: "Order status updates",
    description: "Production stage changes for your active orders.",
  },
  {
    key: "proofReady",
    label: "Proof ready for review",
    description: "When a design proof needs your approval.",
  },
  {
    key: "deliveryUpdates",
    label: "Delivery updates",
    description: "Dispatch confirmations and delivery tracking.",
  },
  {
    key: "messages",
    label: "Support messages",
    description: "New replies in your support conversations.",
  },
  {
    key: "promotions",
    label: "Offers and promotions",
    description: "Occasional discounts and new product announcements.",
  },
];

type PrefState = Record<PrefKey, Record<Channel, boolean>>;

const DEFAULT_STATE: PrefState = {
  orderUpdates: { email: true, sms: true },
  proofReady: { email: true, sms: true },
  deliveryUpdates: { email: true, sms: false },
  messages: { email: true, sms: false },
  promotions: { email: false, sms: false },
};

export function NotificationsForm() {
  const [prefs, setPrefs] = useState<PrefState>(DEFAULT_STATE);
  const [saving, setSaving] = useState(false);

  function toggle(key: PrefKey, channel: Channel) {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  }

  function handleSave() {
    setSaving(true);
    // Mock save — replace with a PATCH /api/account/notifications call.
    setTimeout(() => {
      setSaving(false);
      toast.success("Notification preferences saved");
    }, 500);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-semibold text-foreground">
        Notifications
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose how we reach you for each type of update.
      </p>

      <div className="mt-6 divide-y divide-border">
        <div className="grid grid-cols-[1fr_60px_60px] items-center gap-2 pb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Update</span>
          <span className="text-center">Email</span>
          <span className="text-center">SMS</span>
        </div>
        {PREFS.map((pref) => (
          <div
            key={pref.key}
            className="grid grid-cols-[1fr_60px_60px] items-center gap-2 py-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {pref.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {pref.description}
              </p>
            </div>
            <div className="flex justify-center">
              <Checkbox
                checked={prefs[pref.key].email}
                onCheckedChange={() => toggle(pref.key, "email")}
                aria-label={`${pref.label} via email`}
              />
            </div>
            <div className="flex justify-center">
              <Checkbox
                checked={prefs[pref.key].sms}
                onCheckedChange={() => toggle(pref.key, "sms")}
                aria-label={`${pref.label} via SMS`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}