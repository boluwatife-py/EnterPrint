"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  getNotifications,
  updateNotifications,
  type NotificationPreferences,
} from "@/lib/account-api";
import type { ApiError } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type Channel = "email" | "sms";
type PrefKey = keyof NotificationPreferences;

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

const DEFAULT_STATE: NotificationPreferences = {
  orderUpdates: { email: true, sms: true },
  proofReady: { email: true, sms: true },
  deliveryUpdates: { email: true, sms: false },
  messages: { email: true, sms: false },
  promotions: { email: false, sms: false },
};

export function NotificationsForm() {
  const { authFetch } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getNotifications(authFetch)
      .then((data) => {
        if (!cancelled) setPrefs(data);
      })
      .catch(() => {
        // Keep defaults; surface a soft error.
        if (!cancelled) toast.error("Could not load your preferences.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  function toggle(key: PrefKey, channel: Channel) {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await updateNotifications(authFetch, prefs);
      setPrefs(saved);
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error(
        (error as ApiError)?.message ?? "Could not save preferences.",
      );
    } finally {
      setSaving(false);
    }
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
                disabled={loading}
                onCheckedChange={() => toggle(pref.key, "email")}
                aria-label={`${pref.label} via email`}
              />
            </div>
            <div className="flex justify-center">
              <Checkbox
                checked={prefs[pref.key].sms}
                disabled={loading}
                onCheckedChange={() => toggle(pref.key, "sms")}
                aria-label={`${pref.label} via SMS`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}
