"use client";

import { useState } from "react";
import { PenTool, CheckCircle2 } from "lucide-react";
import { categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function DesignRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [projectType, setProjectType] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Design request submitted", {
      description: "Our design team will reach out within 24 hours.",
    });
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15">
          <CheckCircle2 className="h-7 w-7 text-accent" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-foreground">
          Request received
        </h2>
        <p className="mx-auto mt-2 max-w-md text-pretty text-muted-foreground">
          Thank you. One of our senior designers will review your brief and get
          back to you within 24 hours with concepts and a quote.
        </p>
        <Button className="mt-6" onClick={() => setSubmitted(false)}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <PenTool className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Project brief</h2>
          <p className="text-sm text-muted-foreground">
            Tell us what you need designed.
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required placeholder="Jane Doe" className="h-11" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="jane@company.com"
              className="h-11"
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input id="company" placeholder="Acme Inc." className="h-11" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-type">Project type</Label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger id="project-type" className="h-11 w-full">
                <SelectValue
                  placeholder="Select a category"
                  className="w-full text-left"
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
                <SelectItem value="branding">Full Branding / Logo</SelectItem>
                <SelectItem value="other">Something else</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="budget">Estimated budget</Label>
          <Select>
            <SelectTrigger id="budget" className="h-11 w-full">
              <SelectValue
                placeholder="Select a budget range"
                className="w-full text-left"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-50k">Under ₦50,000</SelectItem>
              <SelectItem value="50-150k">₦50,000 – ₦150,000</SelectItem>
              <SelectItem value="150-500k">₦150,000 – ₦500,000</SelectItem>
              <SelectItem value="over-500k">Over ₦500,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="brief">Brief</Label>
          <Textarea
            id="brief"
            required
            rows={5}
            placeholder="Describe your brand, target audience, style preferences, colors, and what you'd like us to design..."
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto sm:justify-self-start sm:px-8"
        >
          Submit design request
        </Button>
      </div>
    </form>
  );
}
