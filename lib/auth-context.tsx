"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { mockUser } from "@/lib/mock-account";
import { createAuthFlowError, persistPendingEmail } from "@/lib/auth-errors";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  phoneNumber?: string;
  initials: string;
  role: string;
  emailVerified: boolean;
  requires2FA: boolean;
};

type MockAccount = AuthUser & {
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (values: {
    name: string;
    email: string;
    company?: string;
    phoneNumber?: string;
    password: string;
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_STORAGE_KEY = "enterprint-auth-user";
const ACCESS_TOKEN_STORAGE_KEY = "enterprint-auth-access-token";
const REFRESH_TOKEN_STORAGE_KEY = "enterprint-auth-refresh-token";
const ACCOUNTS_STORAGE_KEY = "enterprint-auth-accounts";
const RESET_STORAGE_KEY = "enterprint-auth-reset";

const defaultAccount: MockAccount = {
  id: "mock-user-1",
  name: mockUser.name,
  email: mockUser.email,
  company: mockUser.company,
  initials: mockUser.initials,
  role: "Operations Lead",
  emailVerified: true,
  requires2FA: false,
  password: "Password123!",
};

function getStoredAccounts(): MockAccount[] {
  if (typeof window === "undefined") return [defaultAccount];

  const stored = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify([defaultAccount]),
    );
    return [defaultAccount];
  }

  try {
    return JSON.parse(stored) as MockAccount[];
  } catch {
    window.localStorage.setItem(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify([defaultAccount]),
    );
    return [defaultAccount];
  }
}

function persistAccounts(accounts: MockAccount[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
      const storedAccessToken = window.localStorage.getItem(
        ACCESS_TOKEN_STORAGE_KEY,
      );
      const storedRefreshToken = window.localStorage.getItem(
        REFRESH_TOKEN_STORAGE_KEY,
      );

      if (storedUser && storedAccessToken && storedRefreshToken) {
        setUser(JSON.parse(storedUser) as AuthUser);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
      }
    } catch {
      // ignore malformed storage values and fall back to unauthenticated state
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    if (user && accessToken && refreshToken) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
      window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  }, [user, accessToken, refreshToken, isHydrated, pathname]);

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts.find(
      (entry) => entry.email.toLowerCase() === normalizedEmail,
    );

    if (!account || account.password !== password) {
      throw new Error(
        "We couldn’t find an account with those details. Try the demo credentials or create a new one.",
      );
    }

    if (!account.emailVerified) {
      persistPendingEmail(account.email);
      throw createAuthFlowError(
        "REQUIRES_EMAIL_VERIFICATION",
        "Please verify your email before signing in.",
      );
    }

    if (account.requires2FA) {
      persistPendingEmail(account.email);
      throw createAuthFlowError(
        "REQUIRES_2FA",
        "Two-factor verification is required to continue.",
      );
    }

    const nextAccessToken = `mock-access-${account.id}-${Date.now()}`;
    const nextRefreshToken = `mock-refresh-${account.id}-${Date.now()}`;

    setUser({
      id: account.id,
      name: account.name,
      email: account.email,
      company: account.company,
      initials: account.initials,
      role: account.role,
      emailVerified: account.emailVerified,
      requires2FA: account.requires2FA,
    });
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
  }, []);

  const signup = useCallback(
    async (values: {
      name: string;
      email: string;
      company: string;
      password: string;
    }) => {
      const normalizedEmail = values.email.trim().toLowerCase();
      const accounts = getStoredAccounts();
      const existing = accounts.find(
        (entry) => entry.email.toLowerCase() === normalizedEmail,
      );

      if (existing) {
        throw new Error(
          "An account with this email already exists. Please sign in instead.",
        );
      }

      const newAccount: MockAccount = {
        id: `mock-user-${Date.now()}`,
        name: values.name.trim(),
        email: values.email.trim(),
        company: (values.company || "").trim() || "",
        phoneNumber: values.phoneNumber?.trim() || "",
        initials: values.name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((segment) => segment[0]?.toUpperCase() ?? "")
          .join(""),
        role: "Customer",
        emailVerified: false,
        requires2FA: false,
        password: values.password,
      };

      const updatedAccounts = [newAccount, ...accounts];
      persistAccounts(updatedAccounts);
      persistPendingEmail(newAccount.email);

      throw createAuthFlowError(
        "REQUIRES_EMAIL_VERIFICATION",
        "Your account was created. We sent a verification email to continue.",
      );
    },
    [],
  );

  const forgotPassword = useCallback(async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts.find(
      (entry) => entry.email.toLowerCase() === normalizedEmail,
    );

    if (!account) {
      throw new Error("No account was found for that email.");
    }

    const resetToken = `reset-${account.id}-${Date.now()}`;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        RESET_STORAGE_KEY,
        JSON.stringify({ email: account.email, token: resetToken }),
      );
    }

    return resetToken;
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      if (!token || newPassword.length < 8) {
        throw new Error(
          "Please provide a valid reset token and a password of at least 8 characters.",
        );
      }

      const storedReset =
        typeof window !== "undefined"
          ? window.localStorage.getItem(RESET_STORAGE_KEY)
          : null;
      if (!storedReset) {
        throw new Error(
          "This reset link is no longer valid. Please request a new one.",
        );
      }

      const parsedReset = JSON.parse(storedReset) as {
        email: string;
        token: string;
      };
      if (parsedReset.token !== token) {
        throw new Error(
          "The reset token does not match the one we issued. Please try again.",
        );
      }

      const accounts = getStoredAccounts();
      const accountIndex = accounts.findIndex(
        (entry) =>
          entry.email.toLowerCase() === parsedReset.email.toLowerCase(),
      );

      if (accountIndex === -1) {
        throw new Error("We could not find the account to update.");
      }

      accounts[accountIndex] = {
        ...accounts[accountIndex],
        password: newPassword,
      };
      persistAccounts(accounts);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(RESET_STORAGE_KEY);
      }
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    if (!user || !refreshToken) return;

    const nextAccessToken = `mock-access-${user.id}-${Date.now()}`;
    setAccessToken(nextAccessToken);
  }, [refreshToken, user]);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    if (typeof window !== "undefined") {
      window.location.assign("/");
    } else {
      router.replace("/");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(user && accessToken && refreshToken),
      isHydrated,
      login,
      signup,
      forgotPassword,
      resetPassword,
      refreshSession,
      logout,
    }),
    [
      accessToken,
      forgotPassword,
      isHydrated,
      login,
      logout,
      refreshSession,
      refreshToken,
      signup,
      resetPassword,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
