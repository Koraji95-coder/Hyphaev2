// src/hooks/useAuth.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import type { User, AuthResult } from "@/services/auth";
import {
  registerUser,
  login    as loginService,
  logout   as logoutService,
  getProfile,
  refreshToken    as refreshTokenService,
  setPin          as setPinService,
  verifyPin       as verifyPinService,
  changePin       as changePinService,
  requestPasswordReset as requestPasswordResetService,
} from "@/services/auth";

type RegisterData = { username: string; email: string; password: string; pin: string };

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<User>;
  login: (u: string, p: string, c?: string) => Promise<User>;
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

function useProvideAuth(): AuthContextType {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error,   setError]   = useState<string | null>(null);

  // on mount: try to refresh token and fetch profile
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      setLoading(true);
      try {
        const newToken = await refreshTokenService();
        setToken(newToken);
        const me = await getProfile();
        setUser(me);
      } catch {
        setUser(null);
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

  const login = useCallback(async (username: string, password: string, code?: string) => {
    setError(null);
    setLoading(true);
    try {
      const res: AuthResult = await loginService({ username, password, code });
      setToken(res.token);
      const me = await getProfile();
      setUser(me);
      return me;
    } catch (e: any) {
      setError(e.message);
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

  const changePin = useCallback(async (oldPin: string, newPin: string) => {
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
  }, []);

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
