// src/hooks/useAuth.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api } from "@/services/api";
import type { User } from "@/services/auth";
import {
  registerUser,
  login as loginService,
  logout as logoutService,
  getProfile,
  refreshToken as refreshTokenService,
  setPin as setPinService,
  verifyPin as verifyPinService,
  changePin as changePinService,
  requestPasswordReset as requestPasswordResetService,
} from "@/services/auth";

type RegisterData = {
  username: string;
  email: string;
  password: string;
  pin: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<User>;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setPin: (pin: string) => Promise<any>;
  verifyPin: (pin: string) => Promise<any>;
  changePin: (oldPin: string, newPin: string) => Promise<any>;
  requestPasswordReset: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

function useProvideAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // On mount: try to refresh & fetch profile
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { access_token } = await refreshTokenService();
        setToken(access_token);

        // Attach Authorization header for subsequent calls
        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

        const me = await getProfile();
        setUser(me);
      } catch {
        // not logged in / refresh failed
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    setLoading(true);
    try {
      const newUser = await registerUser(data);
      return newUser;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await loginService({ username, password });
      setToken(access_token);

      // Attach Authorization header for subsequent calls
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      const me = await getProfile();
      setUser(me);
      return me;
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await logoutService();
      setUser(null);
      setToken(null);
      delete api.defaults.headers.common["Authorization"];
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const setPin = useCallback(async (pin: string) => {
    setError(null);
    setLoading(true);
    try {
      return await setPinService(pin);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPin = useCallback(async (pin: string) => {
    setError(null);
    setLoading(true);
    try {
      return await verifyPinService(pin);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePin = useCallback(
    async (oldPin: string, newPin: string) => {
      setError(null);
      setLoading(true);
      try {
        return await changePinService(oldPin, newPin);
      } catch (e: any) {
        setError(e.message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      return await requestPasswordResetService(email);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    setPin,
    verifyPin,
    changePin,
    requestPasswordReset,
  };
}
