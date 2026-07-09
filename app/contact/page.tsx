"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const contactChannels = [
  {
    icon: Mail,
    label: "Email us",
    value: "hello@enterprint.com",
    href: "mailto:hello@enterprint.com",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+234 800 123 4567",
    href: "tel:+2348001234567",
  },
  {
    icon: MessageCircle,
    label: "Live chat",
    value: "Chat with support",
    href: "/support",
  },
];

const offices = [
  {
    city: "Lagos, Nigeria",
    address: "12 Adeyemi Close, Victoria Island",
    hours: "Mon – Sat, 8am – 6pm",
  },
  {
    city: "Ibadan, Nigeria",
    address: "45 Ring Road, Challenge",
    hours: "Mon – Sat, 8am – 6pm",
  },
];

const reasons = [
  "General enquiry",
  "Order support",
  "Bulk / corporate order",
  "Designer marketplace",
  "Something else",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    reason: reasons[0],
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitting(true);
    // Mock submit — replace with a POST /api/contact call.
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      toast.success("Message sent — we'll be in touch shortly");
    }, 700);
  }

  return (
    <>
      {/* Hero, matching homepage hero layout */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div className="flex flex-col items-start">
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Let's talk about
              <br />
              your next print.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Questions about an order, a bulk quote, or just want to say hello?
              Our team replies within one business day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <Link
                    key={channel.label}
                    href={channel.href}
                    className="flex items-center gap-2 border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {channel.value}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-3/2 overflow-hidden border border-border bg-secondary">
              <Image
                src="/contact-hero.jpeg"
                alt="EnterPrint support team assisting a customer"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 w-44 border border-border bg-foreground p-4 text-background shadow-md sm:w-52">
              <p className="font-serif text-lg font-semibold">EnterPrint</p>
              <p className="mt-2 text-[11px] leading-snug text-background/70">
                Avg. response time
                <br />
                Under 4 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form + offices */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          {/* Form */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Send us a message
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill out the form and our team will get back to you shortly.
            </p>

            {sent ? (
              <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-14 text-center">
                <Send className="h-6 w-6 text-muted-foreground" />
                <p className="font-medium text-foreground">Message sent</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Thanks, {form.name.split(" ")[0] || "there"} — we'll reply to{" "}
                  {form.email} shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="contact-name">Full name</Label>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="contact-reason">What's this about?</Label>
                  <select
                    id="contact-reason"
                    value={form.reason}
                    onChange={(e) => update("reason", e.target.value)}
                    className="h-9 rounded-md border border-border bg-transparent px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    {reasons.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Tell us a bit about what you need…"
                    rows={5}
                    className="rounded-md border border-border bg-transparent p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/50"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 h-11"
                  disabled={
                    submitting ||
                    !form.name.trim() ||
                    !form.email.trim() ||
                    !form.message.trim()
                  }
                >
                  {submitting ? "Sending…" : "Send message"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
          </div>

          {/* Offices */}
          <div className="flex flex-col gap-4">
            {offices.map((office) => (
              <div
                key={office.city}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {office.city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {office.address}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {office.hours}
                  </p>
                </div>
              </div>
            ))}

            <div className="relative mt-2 aspect-4/3 overflow-hidden rounded-xl border border-border bg-secondary">
              <Image
                src="/contact-office.png"
                alt="EnterPrint production facility"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
