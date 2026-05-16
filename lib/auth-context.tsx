"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "udvash:auth-v1";

export interface UserAddress {
  id: string;
  label: string;            // e.g. "বাসা", "অফিস"
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  zip?: string;
  isDefault?: boolean;
}

export interface AuthUser {
  email: string;
  name: string;
  phone?: string;
  emailVerified: boolean;
  addresses: UserAddress[];
  createdAt: number;
}

export type AddressInput = Omit<UserAddress, "id" | "isDefault">;

export interface AuthContextValue {
  user: AuthUser | null;
  hydrated: boolean;
  isLoggedIn: boolean;
  /** Mock login — accepts any non-empty email + password. */
  login: (email: string, password: string) => { ok: boolean; error?: string };
  /** Mock signup — creates user, marks email NOT verified. */
  signup: (input: { name: string; email: string; phone?: string; password: string }) =>
    { ok: boolean; error?: string };
  logout: () => void;
  /** Mark email verified (after OTP entry). */
  verifyEmail: (code: string) => { ok: boolean; error?: string };
  /** Update profile name / phone. */
  updateProfile: (patch: Partial<Pick<AuthUser, "name" | "phone">>) => void;
  /** Mock password change. */
  changePassword: (current: string, next: string) => { ok: boolean; error?: string };

  // Address book ----------------------------------------------------------
  addAddress: (input: AddressInput, makeDefault?: boolean) => UserAddress;
  updateAddress: (id: string, patch: Partial<AddressInput>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  defaultAddress: UserAddress | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_OTP = "123456";          // accept this code, or any 6-digit
const DEMO_PASSWORD_MIN = 6;

function readFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.email !== "string" || typeof parsed.name !== "string") return null;
    return {
      email: parsed.email,
      name: parsed.name,
      phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
      emailVerified: Boolean(parsed.emailVerified),
      addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
      createdAt: typeof parsed.createdAt === "number" ? parsed.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const writeRef = useRef(false);

  useEffect(() => {
    setUser(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!writeRef.current) {
      writeRef.current = true;
      return;
    }
    try {
      if (user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [user, hydrated]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setUser(readFromStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(
    (email: string, password: string): { ok: boolean; error?: string } => {
      const e = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false, error: "সঠিক ইমেইল দিন" };
      if (password.length < DEMO_PASSWORD_MIN) return { ok: false, error: "পাসওয়ার্ড অন্তত ৬ অক্ষর" };
      // Mock: if there's a stored user with this email, log them in. Else create one.
      const existing = readFromStorage();
      if (existing && existing.email === e) {
        setUser(existing);
      } else {
        setUser({
          email: e,
          name: e.split("@")[0],
          phone: undefined,
          emailVerified: true,             // Login flow assumes already verified.
          addresses: [],
          createdAt: Date.now(),
        });
      }
      return { ok: true };
    },
    [],
  );

  const signup = useCallback(
    (input: { name: string; email: string; phone?: string; password: string }):
      { ok: boolean; error?: string } => {
      const e = input.email.trim().toLowerCase();
      if (!input.name.trim()) return { ok: false, error: "নাম দিন" };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false, error: "সঠিক ইমেইল দিন" };
      if (input.password.length < DEMO_PASSWORD_MIN)
        return { ok: false, error: "পাসওয়ার্ড অন্তত ৬ অক্ষর" };
      setUser({
        email: e,
        name: input.name.trim(),
        phone: input.phone?.trim(),
        emailVerified: false,
        addresses: [],
        createdAt: Date.now(),
      });
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(() => setUser(null), []);

  const verifyEmail = useCallback((code: string): { ok: boolean; error?: string } => {
    const cleaned = code.replace(/\D/g, "");
    if (cleaned.length !== 6) return { ok: false, error: "৬ ডিজিটের কোড দিন" };
    if (cleaned !== DEMO_OTP && !/^\d{6}$/.test(cleaned))
      return { ok: false, error: "ভুল কোড" };
    setUser((u) => (u ? { ...u, emailVerified: true } : u));
    return { ok: true };
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<AuthUser, "name" | "phone">>) => {
      setUser((u) => (u ? { ...u, ...patch } : u));
    },
    [],
  );

  const changePassword = useCallback(
    (current: string, next: string): { ok: boolean; error?: string } => {
      if (current.length < DEMO_PASSWORD_MIN)
        return { ok: false, error: "বর্তমান পাসওয়ার্ড ভুল" };
      if (next.length < DEMO_PASSWORD_MIN)
        return { ok: false, error: "নতুন পাসওয়ার্ড অন্তত ৬ অক্ষর" };
      // Mock: any non-empty current password "works". Persist nothing — we don't store the hash.
      return { ok: true };
    },
    [],
  );

  // Address handlers ------------------------------------------------------

  const addAddress = useCallback(
    (input: AddressInput, makeDefault: boolean = false): UserAddress => {
      const newId = randomId();
      let result: UserAddress = { id: newId, ...input };
      setUser((u) => {
        if (!u) {
          result = { id: newId, ...input, isDefault: true };
          return u;
        }
        const shouldBeDefault = makeDefault || u.addresses.length === 0;
        const cleared = shouldBeDefault
          ? u.addresses.map((a) => ({ ...a, isDefault: false }))
          : u.addresses;
        const added: UserAddress = { id: newId, ...input, isDefault: shouldBeDefault };
        result = added;
        return { ...u, addresses: [...cleared, added] };
      });
      return result;
    },
    [],
  );

  const updateAddress = useCallback(
    (id: string, patch: Partial<AddressInput>) => {
      setUser((u) => {
        if (!u) return u;
        return {
          ...u,
          addresses: u.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        };
      });
    },
    [],
  );

  const removeAddress = useCallback((id: string) => {
    setUser((u) => {
      if (!u) return u;
      const remaining = u.addresses.filter((a) => a.id !== id);
      // If we removed the default, promote the first remaining one.
      const removedWasDefault = u.addresses.find((a) => a.id === id)?.isDefault;
      const next =
        removedWasDefault && remaining.length > 0
          ? remaining.map((a, i) => ({ ...a, isDefault: i === 0 }))
          : remaining;
      return { ...u, addresses: next };
    });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setUser((u) => {
      if (!u) return u;
      return {
        ...u,
        addresses: u.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      };
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const defaultAddress = user?.addresses.find((a) => a.isDefault) ?? user?.addresses[0] ?? null;
    return {
      user,
      hydrated,
      isLoggedIn: !!user,
      login,
      signup,
      logout,
      verifyEmail,
      updateProfile,
      changePassword,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      defaultAddress,
    };
  }, [
    user,
    hydrated,
    login,
    signup,
    logout,
    verifyEmail,
    updateProfile,
    changePassword,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used within <AuthProvider>");
  return ctx;
}
