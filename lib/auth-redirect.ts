/**
 * Appends (or merges in) a `redirect` query param onto an auth-flow path,
 * so a multi-step flow (login -> verify-email -> 2fa -> back to where the
 * user started) can carry the original destination through every hop.
 *
 * No-op if `redirect` is null/empty — callers can pass
 * `searchParams.get("redirect")` straight through without an `if` guard.
 */
export function withRedirectParam(
  path: string,
  redirect: string | null | undefined,
): string {
  if (!redirect) return path;

  const [base, existingQuery] = path.split("?");
  const params = new URLSearchParams(existingQuery);
  params.set("redirect", redirect);
  return `${base}?${params.toString()}`;
}