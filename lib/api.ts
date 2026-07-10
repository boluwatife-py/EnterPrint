// Central API client for the ENTERPRINT backend.
//
// The base URL points at the deployed backend (prefixed with the `/v1` API
// version). It can be overridden with NEXT_PUBLIC_API_BASE_URL for local
// development against http://localhost:8000/v1.

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/v1"
).replace(/\/+$/, "");

export type ApiError = Error & {
  status?: number;
  code?: string;
  fields?: Record<string, string>;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** JSON-serializable body, or a FormData instance for file uploads. */
  body?: unknown;
  /** Bearer access token for protected routes. */
  token?: string | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function buildError(
  message: string,
  status: number,
  code?: string,
  fields?: Record<string, string>,
): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  error.fields = fields;
  return error;
}

/**
 * Thin fetch wrapper that:
 * - prefixes the API base URL
 * - always sends cookies (so the HttpOnly refresh_token round-trips)
 * - attaches the bearer token when provided
 * - parses the standard `{ error: { code, message, fields } }` envelope
 *   (and the one-off `{ detail: "..." }` shape from require_admin)
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, token, headers = {}, signal }: RequestOptions = {},
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    signal,
    headers: {
      // Skip ngrok's interstitial warning page for API requests.
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const envelope = (data ?? {}) as {
      error?: {
        code?: string;
        message?: string;
        fields?: Record<string, string>;
      };
      // FastAPI request-validation errors (422) return `detail` as an array of
      // { loc, msg, type }; require_admin returns it as a plain string.
      detail?: string | Array<{ msg?: string; loc?: Array<string | number> }>;
    };

    let message = envelope.error?.message;
    let fields = envelope.error?.fields;

    if (!message && Array.isArray(envelope.detail)) {
      const items = envelope.detail;
      message = items[0]?.msg || "Please check the highlighted fields.";
      fields = items.reduce<Record<string, string>>((acc, item) => {
        const field = item.loc?.[item.loc.length - 1];
        if (field && item.msg) acc[String(field)] = item.msg;
        return acc;
      }, {});
    } else if (!message && typeof envelope.detail === "string") {
      message = envelope.detail;
    }

    throw buildError(
      message || "Something went wrong. Please try again.",
      response.status,
      envelope.error?.code,
      fields,
    );
  }

  return data as T;
}
