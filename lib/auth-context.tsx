"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, type SessionUser } from "./api-client";

export interface UserAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  zip?: string;
  isDefault?: boolean;
}

export interface AuthUser extends SessionUser {
  addresses: UserAddress[];
  createdAt: number;
}

export type AddressInput = Omit<UserAddress, "id" | "isDefault">;

export interface AuthContextValue {
  user: AuthUser | null;
  hydrated: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string; devCode?: string }>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (
    patch: Partial<Pick<AuthUser, "name" | "phone">>,
  ) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (
    current: string,
    next: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;

  // Address book
  addAddress: (input: AddressInput, makeDefault?: boolean) => Promise<UserAddress | null>;
  updateAddress: (id: string, patch: Partial<AddressInput>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  defaultAddress: UserAddress | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const result = await api.me();
    if (result.ok) {
      setUser({
        ...result.data.user,
        addresses: (result.data.addresses as UserAddress[]) ?? [],
        createdAt: Date.now(), // server has this; not surfaced today
      });
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setHydrated(true));
  }, [refresh]);

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      const result = await api.login({ email, password });
      if (!result.ok) return { ok: false, error: result.error };
      await refresh();
      return { ok: true };
    },
    [refresh],
  );

  const signup = useCallback<AuthContextValue["signup"]>(
    async (input) => {
      const result = await api.signup(input);
      if (!result.ok) return { ok: false, error: result.error };
      await refresh();
      return { ok: true, devCode: result.data.devCode };
    },
    [refresh],
  );

  const logout = useCallback<AuthContextValue["logout"]>(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const verifyEmail = useCallback<AuthContextValue["verifyEmail"]>(
    async (code) => {
      const result = await api.verifyEmail(code);
      if (!result.ok) return { ok: false, error: result.error };
      await refresh();
      return { ok: true };
    },
    [refresh],
  );

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (patch) => {
      const result = await api.updateProfile(patch);
      if (!result.ok) return { ok: false, error: result.error };
      await refresh();
      return { ok: true };
    },
    [refresh],
  );

  const changePassword = useCallback<AuthContextValue["changePassword"]>(
    async (current, next) => {
      const result = await api.changePassword(current, next);
      if (!result.ok) return { ok: false, error: result.error };
      return { ok: true };
    },
    [],
  );

  // Addresses ------------------------------------------------------

  const addAddress = useCallback<AuthContextValue["addAddress"]>(
    async (input, makeDefault) => {
      const result = await api.createAddress({ ...input, isDefault: makeDefault });
      if (!result.ok) return null;
      await refresh();
      return result.data.address as UserAddress;
    },
    [refresh],
  );

  const updateAddress = useCallback<AuthContextValue["updateAddress"]>(
    async (id, patch) => {
      await api.updateAddress(id, patch);
      await refresh();
    },
    [refresh],
  );

  const removeAddress = useCallback<AuthContextValue["removeAddress"]>(
    async (id) => {
      await api.deleteAddress(id);
      await refresh();
    },
    [refresh],
  );

  const setDefaultAddress = useCallback<AuthContextValue["setDefaultAddress"]>(
    async (id) => {
      await api.updateAddress(id, { isDefault: true });
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<AuthContextValue>(() => {
    const defaultAddress =
      user?.addresses.find((a) => a.isDefault) ?? user?.addresses[0] ?? null;
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
      refresh,
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
    refresh,
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
