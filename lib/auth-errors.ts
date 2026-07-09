export type AuthStatus =
  | "REQUIRES_EMAIL_VERIFICATION"
  | "REQUIRES_2FA"
  | "UNAUTHORIZED";

export type AuthFlowError = Error & {
  status?: AuthStatus;
};

const PENDING_EMAIL_STORAGE_KEY = "enterprint-auth-pending-email";

export function createAuthFlowError(status: AuthStatus, message: string) {
  const error = new Error(message) as AuthFlowError;
  error.status = status;
  return error;
}

export function getAuthRedirectPath(error: unknown): string | null {
  if (error instanceof Error && "status" in error) {
    const status = (error as AuthFlowError).status;

    switch (status) {
      case "REQUIRES_EMAIL_VERIFICATION":
        return "/auth/verify-email";
      case "REQUIRES_2FA":
        return "/auth/2fa-challenge";
      default:
        return null;
    }
  }

  return null;
}

export function persistPendingEmail(email: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PENDING_EMAIL_STORAGE_KEY, email.trim());
  }
}

export function readPendingEmail() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PENDING_EMAIL_STORAGE_KEY);
}

export function clearPendingEmail() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PENDING_EMAIL_STORAGE_KEY);
  }
}
