"use client";

import { useState } from "react";
import {
  UserRound,
  ShieldCheck,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { SecurityForm } from "@/components/dashboard/settings/security-form";
import { NotificationsForm } from "@/components/dashboard/settings/notifications-form";
import { DangerZone } from "@/components/dashboard/settings/danger-zone";

const TABS = [
  { slug: "profile", label: "Profile", icon: UserRound },
  { slug: "security", label: "Security", icon: ShieldCheck },
  { slug: "notifications", label: "Notifications", icon: Bell },
  { slug: "danger", label: "Danger zone", icon: AlertTriangle },
] as const;

type TabSlug = (typeof TABS)[number]["slug"];

export default function SettingsPage() {
  const [active, setActive] = useState<TabSlug>("profile");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Account
        </p>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, security, and communication preferences.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Tab nav */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.slug;
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => setActive(tab.slug)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors lg:shrink",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  tab.slug === "danger" && isActive && "text-destructive",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active panel */}
        <div className="min-w-0">
          {active === "profile" && <ProfileForm />}
          {active === "security" && <SecurityForm />}
          {active === "notifications" && <NotificationsForm />}
          {active === "danger" && <DangerZone />}
        </div>
      </div>
    </div>
  );
}