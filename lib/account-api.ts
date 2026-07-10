// Typed API layer for Account, Settings & Addresses.
//
// Every function here takes an `authFetch` — the token-injecting, refresh-on-401
// fetch helper exposed by `useAuth()` — so calls automatically ride the current
// session and survive access-token expiry. Response/request shapes mirror the
// live backend (see backend-endpoint.md / openapi.json), NOT the old mock draft.

import type { AuthUser } from "@/lib/auth-context";

/** A token-injecting fetch, shaped like `useAuth().authFetch`. */
export type AuthFetch = <T>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  },
) => Promise<T>;

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

export type ProfileUpdate = {
  name?: string;
  phoneNumber?: string;
};

/** PATCH /account/profile — returns the updated user. */
export function updateProfile(authFetch: AuthFetch, body: ProfileUpdate) {
  return authFetch<AuthUser>("/account/profile", {
    method: "PATCH",
    body,
  });
}

/* -------------------------------------------------------------------------- */
/* Password                                                                   */
/* -------------------------------------------------------------------------- */

export type PasswordChange = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

/** PATCH /account/password. */
export function changePassword(authFetch: AuthFetch, body: PasswordChange) {
  return authFetch<{ message: string }>("/account/password", {
    method: "PATCH",
    body,
  });
}

/* -------------------------------------------------------------------------- */
/* Two-factor authentication                                                  */
/* -------------------------------------------------------------------------- */

export type TwoFAEnableResponse = { otpauthUrl: string; secret: string };
export type TwoFAStatusResponse = { requires2FA: boolean };

/** POST /account/2fa/enable — returns the otpauth URL + shared secret to show. */
export function enableTwoFA(authFetch: AuthFetch) {
  return authFetch<TwoFAEnableResponse>("/account/2fa/enable", {
    method: "POST",
  });
}

/** POST /account/2fa/confirm — verifies the first TOTP code, turns 2FA on. */
export function confirmTwoFA(authFetch: AuthFetch, code: string) {
  return authFetch<TwoFAStatusResponse>("/account/2fa/confirm", {
    method: "POST",
    body: { code: code.trim() },
  });
}

/** POST /account/2fa/disable — requires a current TOTP code. */
export function disableTwoFA(authFetch: AuthFetch, code: string) {
  return authFetch<TwoFAStatusResponse>("/account/2fa/disable", {
    method: "POST",
    body: { code: code.trim() },
  });
}

/* -------------------------------------------------------------------------- */
/* Notification preferences                                                   */
/* -------------------------------------------------------------------------- */

export type NotificationChannel = { email: boolean; sms: boolean };
export type NotificationPreferences = {
  orderUpdates: NotificationChannel;
  proofReady: NotificationChannel;
  deliveryUpdates: NotificationChannel;
  messages: NotificationChannel;
  promotions: NotificationChannel;
};

/** GET /account/notifications. */
export function getNotifications(authFetch: AuthFetch) {
  return authFetch<NotificationPreferences>("/account/notifications");
}

/** PATCH /account/notifications — all five keys required. */
export function updateNotifications(
  authFetch: AuthFetch,
  prefs: NotificationPreferences,
) {
  return authFetch<NotificationPreferences>("/account/notifications", {
    method: "PATCH",
    body: prefs,
  });
}

/* -------------------------------------------------------------------------- */
/* Delete account                                                             */
/* -------------------------------------------------------------------------- */

/** DELETE /account — hard delete, requires password + literal confirm string. */
export function deleteAccount(
  authFetch: AuthFetch,
  body: { password: string; confirm: string },
) {
  return authFetch<void>("/account", { method: "DELETE", body });
}

/* -------------------------------------------------------------------------- */
/* Addresses                                                                  */
/* -------------------------------------------------------------------------- */

export type Address = {
  id: string;
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
};

export type AddressInput = {
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  country?: string;
  isDefault?: boolean;
};

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

/** GET /addresses — plain array, default first. */
export function listAddresses(authFetch: AuthFetch) {
  return authFetch<Address[]>("/addresses");
}

/** POST /addresses — setting isDefault unsets it on every other address. */
export function createAddress(authFetch: AuthFetch, input: AddressInput) {
  return authFetch<Address>("/addresses", { method: "POST", body: input });
}

/** PUT /addresses/:id — partial update (only sent fields are applied). */
export function updateAddress(
  authFetch: AuthFetch,
  id: string,
  input: Partial<AddressInput>,
) {
  return authFetch<Address>(`/addresses/${id}`, { method: "PUT", body: input });
}

/** DELETE /addresses/:id. */
export function deleteAddress(authFetch: AuthFetch, id: string) {
  return authFetch<void>(`/addresses/${id}`, { method: "DELETE" });
}
