// lib/api/admin-design-requests.ts
// Mirrors app/design_requests/admin_schemas.py (same conventions as lib/api/admin.ts).
import { apiFetch } from "@/lib/api/api";

export type DesignRequestStatus = "new" | "contacted" | "closed";
export type DesignRequestView = "all" | DesignRequestStatus;

export type AdminDesignRequestListItem = {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  projectType: string;
  budget: string;
  status: DesignRequestStatus | string;
  briefPreview: string;
  createdAt: string;
};

export type AdminDesignRequestDetail = Omit<AdminDesignRequestListItem, "briefPreview"> & {
  brief: string;
};

export type AdminDesignRequestCounts = {
  all: number;
  new: number;
  contacted: number;
  closed: number;
};

export type AdminPaginatedDesignRequests = {
  data: AdminDesignRequestListItem[];
  page: number;
  pageSize: number;
  total: number;
  counts: AdminDesignRequestCounts;
};

export async function getAdminDesignRequests(
  token: string,
  status: DesignRequestView = "all",
  search?: string,
  page = 1,
  pageSize = 20,
) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (status !== "all") params.append("status", status);
  if (search) params.append("search", search);
  return apiFetch<AdminPaginatedDesignRequests>(
    `/admin/design-requests?${params.toString()}`,
    { token },
  );
}

export async function getAdminDesignRequest(token: string, id: string) {
  return apiFetch<AdminDesignRequestDetail>(`/admin/design-requests/${id}`, { token });
}

/** Returns the refreshed request. */
export async function updateAdminDesignRequestStatus(
  token: string,
  id: string,
  status: DesignRequestStatus,
) {
  return apiFetch<AdminDesignRequestDetail>(`/admin/design-requests/${id}`, {
    method: "PATCH",
    body: { status },
    token,
  });
}