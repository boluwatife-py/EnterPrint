// lib/api/design-requests-api.ts
import { apiFetch } from "./api";

export interface CreateDesignRequestPayload {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  projectType: string;
  budget: "under-50k" | "50-150k" | "150-500k" | "over-500k";
  brief: string;
}

export interface DesignRequestResponse {
  id: string;
  message: string;
}

/**
 * Sends a public design request submission using apiFetch.
 * Pass the raw object to the body — apiFetch handles the JSON serialization internally.
 */
export async function createDesignRequest(
  payload: CreateDesignRequestPayload
): Promise<DesignRequestResponse> {
  return apiFetch<DesignRequestResponse>("/design-requests", {
    method: "POST",
    body: payload as any, // Cast to avoid strict RequestInit type checks
  });
}