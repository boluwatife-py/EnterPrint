"use client";

import { PenTool, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { listCategories, type Category } from "@/lib/api/catalog-api";
import { createDesignRequest } from "@/lib/api/design-requests-api";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Field States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState<"under-50k" | "50-150k" | "150-500k" | "over-500k" | "">("");
  const [brief, setBrief] = useState("");

  // Track validation or API errors inline
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await listCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    loadCategories();
  }, []);

  // Clear a specific field's error when the user modifies it
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Strict client-side validation mapping to the CreateDesignRequestRequest Pydantic Schema
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    // 1. Name validation (min_length=2)
    if (name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters long.";
    }

    // 2. Email validation (EmailStr pattern match)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // 3. Project Type validation (Required)
    if (!projectType) {
      newErrors.projectType = "Please select a project type.";
    }

    // 4. Budget validation (Literal matching)
    const validBudgets = ["under-50k", "50-150k", "150-500k", "over-500k"];
    if (!budget) {
      newErrors.budget = "Please select an estimated budget range.";
    } else if (!validBudgets.includes(budget)) {
      newErrors.budget = "Invalid budget range selection.";
    }

    // 5. Brief validation (min_length=10)
    if (brief.trim().length < 10) {
      newErrors.brief = "Please write a brief of at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({}); // Reset general errors

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await createDesignRequest({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || null,
        phone: phone.trim() || null,
        projectType,
        budget: budget as "under-50k" | "50-150k" | "150-500k" | "over-500k",
        brief: brief.trim(),
      });

      setSubmitted(true);
      toast.success("Success!", {
        description: response.message,
      });

      // Clear fields
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setProjectType("");
      setBudget("");
      setBrief("");
    } catch (error: any) {
      // Map API failures or rate limits directly to a global submit error
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "An error occurred while submitting your request.",
      }));
    } finally {
      setIsSubmitting(false);
    }
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
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
              placeholder="Jane Doe"
              className={`h-11 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.name && (
              <p className="text-xs text-destructive text-red-500 font-medium mt-1">{errors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              placeholder="jane@company.com"
              className={`h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.email && (
              <p className="text-xs text-destructive text-red-500 font-medium mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 80 1234 5678"
              className="h-11"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="project-type">Project type</Label>
          <Select
            value={projectType}
            onValueChange={(value) => {
              setProjectType(value ?? "");
              clearError("projectType");
            }}
          >
            <SelectTrigger 
              id="project-type" 
              className={`h-11 w-full ${errors.projectType ? "border-destructive focus:ring-destructive" : ""}`}
            >
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
          {errors.projectType && (
            <p className="text-xs text-destructive text-red-500 font-medium mt-1">{errors.projectType}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="budget">Estimated budget</Label>
          <Select
            value={budget}
            onValueChange={(value) => {
              setBudget(value as any);
              clearError("budget");
            }}
          >
            <SelectTrigger 
              id="budget" 
              className={`h-11 w-full ${errors.budget ? "border-destructive focus:ring-destructive" : ""}`}
            >
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
          {errors.budget && (
            <p className="text-xs text-destructive text-red-500 font-medium mt-1">{errors.budget}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="brief">Brief</Label>
          <Textarea
            id="brief"
            rows={5}
            value={brief}
            onChange={(e) => {
              setBrief(e.target.value);
              clearError("brief");
            }}
            placeholder="Describe your brand, target audience, style preferences, colors, and what you'd like us to design..."
            className={`${errors.brief ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {errors.brief && (
            <p className="text-xs text-destructive text-red-500 font-medium mt-1">{errors.brief}</p>
          )}
        </div>

        {/* Global form submission error if network/api fails */}
        {errors.submit && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
            {errors.submit}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:w-auto sm:justify-self-start sm:px-8 flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Submitting..." : "Submit design request"}
        </Button>
      </div>
    </form>
  );
}