"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  createAuthFlowError,
  persistChallengeId,
  persistPendingEmail,
} from "@/lib/auth-errors";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  initials: string;
  emailVerified: boolean;
  requires2FA: boolean;
};

type LoginSuccess = { user: AuthUser; accessToken: string };
type LoginInterrupt =
  | { status: "REQUIRES_EMAIL_VERIFICATION"; email: string }
  | { status: "REQUIRES_2FA"; email: string; challengeId: string };
type LoginResult = LoginSuccess | LoginInterrupt;

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (values: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  twoFactorChallenge: (challengeId: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  refreshSession: () => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_STORAGE_KEY = "enterprint-auth-user";
const ACCESS_TOKEN_STORAGE_KEY = "enterprint-auth-access-token";

function isInterrupt(result: LoginResult): result is LoginInterrupt {
  return "status" in result;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const accessTokenRef = useRef<string | null>(null);

  const persistSession = useCallback(
    (nextUser: AuthUser | null, nextToken: string | null) => {
      setUser(nextUser);
      setAccessToken(nextToken);
      accessTokenRef.current = nextToken;

      if (typeof window === "undefined") return;
      if (nextUser && nextToken) {
        window.localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(nextUser),
        );
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, nextToken);
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      }
    },
    [],
  );

  // Handle a successful auth response (login / verify / 2fa), which all share
  // the `{ user, accessToken }` shape (refresh token arrives as a cookie).
  const applyLoginResult = useCallback(
    (result: LoginResult) => {
      if (isInterrupt(result)) {
        persistPendingEmail(result.email);
        if (result.status === "REQUIRES_2FA") {
          persistChallengeId(result.challengeId);
          throw createAuthFlowError(
            "REQUIRES_2FA",
            "Two-factor verification is required to continue.",
          );
        }
        throw createAuthFlowError(
          "REQUIRES_EMAIL_VERIFICATION",
          "Please verify your email before signing in.",
        );
      }

      persistSession(result.user, result.accessToken);
    },
    [persistSession],
  );

  // On first mount, try to re-establish a session using the HttpOnly refresh
  // cookie: refresh -> access token -> /account/me. Falls back to logged-out.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { accessToken: token } = await apiFetch<{ accessToken: string }>(
          "/auth/refresh",
          { method: "POST" },
        );
        const me = await apiFetch<AuthUser>("/account/me", { token });
        if (!cancelled) persistSession(me, token);
      } catch {
        if (!cancelled) persistSession(null, null);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [persistSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiFetch<LoginResult>("/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });
      applyLoginResult(result);
    },
    [applyLoginResult],
  );

  const signup = useCallback(
    async (values: {
      name: string;
      email: string;
      phoneNumber: string;
      password: string;
      confirmPassword: string;
    }) => {
      const result = await apiFetch<{ status: string; email: string }>(
        "/auth/signup",
        {
          method: "POST",
          body: {
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            phoneNumber: values.phoneNumber.trim(),
            password: values.password,
            confirmPassword: values.confirmPassword,
          },
        },
      );

      persistPendingEmail(result.email);
      throw createAuthFlowError(
        "REQUIRES_EMAIL_VERIFICATION",
        "Your account was created. We sent a verification email to continue.",
      );
    },
    [],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const result = await apiFetch<LoginResult>("/auth/verify-email", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), code: code.trim() },
      });
      applyLoginResult(result);
    },
    [applyLoginResult],
  );

  const twoFactorChallenge = useCallback(
    async (challengeId: string, code: string) => {
      const result = await apiFetch<LoginResult>("/auth/2fa-challenge", {
        method: "POST",
        body: { challengeId, code: code.trim() },
      });
      applyLoginResult(result);
    },
    [applyLoginResult],
  );

  const forgotPassword = useCallback(async (email: string) => {
    const { message } = await apiFetch<{ message: string }>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: { email: email.trim().toLowerCase() },
      },
    );
    return message;
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      const { message } = await apiFetch<{ message: string }>(
        "/auth/reset-password",
        {
          method: "POST",
          body: { token, newPassword },
        },
      );
      return message;
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    try {
      const { accessToken: token } = await apiFetch<{ accessToken: string }>(
        "/auth/refresh",
        { method: "POST" },
      );
      setAccessToken(token);
      accessTokenRef.current = token;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
      }
      return token;
    } catch {
      persistSession(null, null);
      return null;
    }
  }, [persistSession]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Even if the server call fails, clear the local session.
    }
    persistSession(null, null);

    if (typeof window !== "undefined") {
      window.location.assign("/");
    } else {
      router.replace("/");
    }
  }, [persistSession, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isHydrated,
      login,
      signup,
      verifyEmail,
      twoFactorChallenge,
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
      resetPassword,
      signup,
      twoFactorChallenge,
      user,
      verifyEmail,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
