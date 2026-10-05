// app/admin/design-requests/[id]/page.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  ChevronRight,
  Copy,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import {
  getAdminDesignRequest,
  updateAdminDesignRequestStatus,
  type AdminDesignRequestDetail,
  type DesignRequestStatus,
} from "@/lib/api/admin-design-requests";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DesignRequestStatusBadge,
  budgetLabel,
  projectTypeLabel,
  whatsappUrl,
} from "@/components/admin/design-requests/design-request-helpers";

const STATUSES: { value: DesignRequestStatus; label: string; hint: string }[] = [
  { value: "new", label: "New", hint: "Not followed up yet" },
  { value: "contacted", label: "Contacted", hint: "We've reached out" },
  { value: "closed", label: "Closed", hint: "Done or not pursuing" },
];

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <h2 className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">
        {title}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default function AdminDesignRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken, isHydrated } = useAuth();

  const [req, setReq] = useState<AdminDesignRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<DesignRequestStatus | null>(null);

  useEffect(() => {
    if (!isHydrated || !accessToken || !id) return;
    let cancelled = false;
    setLoading(true);

    getAdminDesignRequest(accessToken, id)
      .then((data) => {
        if (!cancelled) setReq(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Couldn't load this design request.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, isHydrated, id]);

  async function setStatus(status: DesignRequestStatus) {
    if (!accessToken || !req || req.status === status) return;
    setSaving(status);
    try {
      setReq(await updateAdminDesignRequestStatus(accessToken, req.id, status));
      toast.success(`Marked as ${status}.`);
    } catch {
      toast.error("Couldn't update the status.");
    } finally {
      setSaving(null);
    }
  }

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied.`);
    } catch {
      toast.error("Couldn't copy to clipboard.");
    }
  }

  const crumbs = (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      <Link href="/admin/design-requests" className="hover:text-foreground">
        Design requests
      </Link>
      <ChevronRight className="h-3 w-3" />
      <span className="font-mono">{id}</span>
    </nav>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {crumbs}
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="space-y-6">
        {crumbs}
        <p className="text-sm text-muted-foreground">This design request wasn&apos;t found.</p>
      </div>
    );
  }

  const wa = req.phone ? whatsappUrl(req.phone) : null;
  const mailto = `mailto:${req.email}?subject=${encodeURIComponent(
    `Your design request (${req.id})`,
  )}`;

  return (
    <div className="space-y-6">
      {crumbs}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {req.name}
            </h1>
            <DesignRequestStatusBadge status={req.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{req.id}</span> · Submitted {formatDate(req.createdAt)}
          </p>
        </div>
        <Button render={<a href={mailto} />}>
          <Mail className="mr-1.5 h-4 w-4" />
          Reply by email
        </Button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Project">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Project type">{projectTypeLabel(req.projectType)}</Field>
              <Field label="Budget">{budgetLabel(req.budget)}</Field>
            </dl>
          </Card>

          <Card title="Brief">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
              {req.brief}
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Follow-up status">
            <div className="space-y-2">
              {STATUSES.map((s) => {
                const active = req.status === s.value;
                return (
                  <button
                    key={s.value}
                    disabled={saving !== null}
                    onClick={() => setStatus(s.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-60",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/60",
                    )}
                  >
                    <span>
                      <span className="block font-medium text-foreground">{s.label}</span>
                      <span className="block text-xs text-muted-foreground">{s.hint}</span>
                    </span>
                    {saving === s.value && (
                      <span className="text-xs text-muted-foreground">Saving…</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Contact">
            <dl className="space-y-4">
              <Field label="Email">
                <div className="flex items-center justify-between gap-2">
                  <a href={mailto} className="truncate text-primary hover:underline">
                    {req.email}
                  </a>
                  <button
                    onClick={() => copy(req.email, "Email")}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Copy email"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Field>

              {req.phone && (
                <Field label="Phone">
                  <div className="flex items-center justify-between gap-2">
                    <a href={`tel:${req.phone}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      <Phone className="h-3.5 w-3.5" />
                      {req.phone}
                    </a>
                    <button
                      onClick={() => copy(req.phone!, "Phone number")}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label="Copy phone number"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Message on WhatsApp
                    </a>
                  )}
                </Field>
              )}

              {req.company && (
                <Field label="Company">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {req.company}
                  </span>
                </Field>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}