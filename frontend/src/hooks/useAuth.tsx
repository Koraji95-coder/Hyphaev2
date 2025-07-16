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
import type { UserProfile, SimpleMessage } from "@/services/auth";
import {
  registerUser,
  login as loginService,
  logout as logoutService,
  getProfile,
  refreshToken as refreshTokenService,
  setPin as setPinService,
  verifyPin as verifyPinService,
  changePin as changePinService,
  changePassword as changePasswordService,
  changeUsername as changeUsernameService,
  changeEmail as changeEmailService,
  cancelPendingEmail as cancelPendingEmailService,
  requestPasswordReset as requestPasswordResetService,
} from "@/services/auth";

export interface AxiosErrorLike {
  response?: {
    status?: number; 
    data?: {
      detail?: string;
      message?: string;
    };
  };
  message?: string;
}

type RegisterData = {
  username: string;
  email: string;
  password: string;
  pin: string;
};

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  pinVerified: boolean;
  

  refreshUser: () => Promise<UserProfile>;

  register: (data: RegisterData) => Promise<UserProfile>;
  login: (username: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;

  setPin: (pin: string) => Promise<SimpleMessage>;
  verifyPin: (pin: string) => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<SimpleMessage>;
  changePassword: (oldPwd: string, newPwd: string) => Promise<SimpleMessage>;
  changeUsername: (newUsername: string) => Promise<SimpleMessage>;
  changeEmail: (newEmail: string) => Promise<SimpleMessage>;
  cancelPendingEmail: () => Promise<SimpleMessage>;
  requestPasswordReset: (email: string) => Promise<SimpleMessage>;
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    console.log('[DEBUG] AuthProvider mounted');
    return () => {
      console.log('[DEBUG] AuthProvider unmounted');
    };
  }, []);
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

function useProvideAuth(): AuthContextType {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pinVerified, setPinVerified] = useState<boolean>(false);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const storedToken = localStorage.getItem("auth_access_token");
        if (storedToken && isValidToken(storedToken)) {
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          setToken(storedToken);
          const profile = await getProfile();
          setUser(profile);
          setPinVerified(profile.pin_verified || false);
        } else {
          // only try to refresh _if_ a refresh_token cookie is present
          const hasRefreshCookie = document.cookie
            .split("; ")
            .some((c) => c.startsWith("refresh_token="));

          if (hasRefreshCookie) {
            try {
              const { access_token } = await refreshTokenService();
              if (access_token && isValidToken(access_token)) {
                setToken(access_token);
                api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
                localStorage.setItem("auth_access_token", access_token);
                const profile = await getProfile();
                setUser(profile);
                setPinVerified(profile.pin_verified || false);
              }
            } catch {
              console.warn("Refresh token invalid or expired, requiring login");
              setUser(null);
              setToken(null);
              delete api.defaults.headers.common["Authorization"];
              localStorage.removeItem("auth_access_token");
            }
          } else {
            console.warn("No refresh_token cookie found, requiring login");
            setUser(null);
            setToken(null);
            delete api.defaults.headers.common["Authorization"];
            localStorage.removeItem("auth_access_token");
          }
        }
      } catch (err) {
        console.warn("Initial auth failed:", err);
        setUser(null);
        setToken(null);
        delete api.defaults.headers.common["Authorization"];
        localStorage.removeItem("auth_access_token");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Validate JWT (basic check for 3 segments)
  const isValidToken = (t: string): boolean => t.split(".").length === 3;

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await getProfile();
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(
    async (data: RegisterData): Promise<UserProfile> => {
      setError(null);
      setLoading(true);
      try {
        const profile = await registerUser(data);
        setUser(profile);
        return profile;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Login
  const login = useCallback(
    async (username: string, password: string): Promise<UserProfile> => {
      setError(null);
      setLoading(true);
      try {
        const result = await loginService({ username, password });
        const { access_token } = result;
        if (access_token && isValidToken(access_token)) {
          setToken(access_token);
          setPinVerified(false); // Always require PIN after login!
          api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
          localStorage.setItem("auth_access_token", access_token);
          const profile = await getProfile();
          setUser(profile);
          return profile;
        }
        throw new Error("Invalid access token received");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      await logoutService();
      setUser(null);
      setToken(null);
      setPinVerified(false);
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("auth_access_token");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set PIN
  const setPin = useCallback(
    async (pin: string): Promise<SimpleMessage> => {
      setError(null);
      setLoading(true);
      try {
        return await setPinService(pin);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Verify PIN
  const verifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      setError(null);
      setLoading(true);
      try {
        const { success } = await verifyPinService(pin);
        if (success) setPinVerified(true);
        return success;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Change PIN
  const changePin = useCallback(
    async (oldPin: string, newPin: string): Promise<SimpleMessage> => {
      setError(null);
      setLoading(true);
      try {
        return await changePinService(oldPin, newPin);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Change Password
  const changePassword = useCallback(
    async (oldPwd: string, newPwd: string): Promise<SimpleMessage> => {
      setError(null);
      setLoading(true);
      try {
        return await changePasswordService(oldPwd, newPwd);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

// Change Username (with broadcast, and custom error for already current username)
  const changeUsername = useCallback(
    async (newUsername: string): Promise<SimpleMessage> => {
      setError(null);
      setLoading(true);
      try {
        console.log("useAuth - Attempting changeUsername"); // Log before the service call
        const res = await changeUsernameService(newUsername);
        console.log("useAuth - changeUsername successful:", res); // Log on success

        // Success logic: update user, broadcast, etc.
        setUser((prev) => (prev ? { ...prev, username: newUsername } : prev));
        const channel = new BroadcastChannel("usernameUpdates");
        channel.postMessage({ type: "usernameUpdated", newUsername });
        channel.close();
        return res; // Return success message
      } catch (e: unknown) {
        console.error("useAuth - Caught error in changeUsername:", e); // Log the caught error

        let msg = "Unknown error";
        if (typeof e === "object" && e !== null && "response" in e) {
          const err = e as AxiosErrorLike;
          console.log("useAuth - Axios error response:", err.response); // Log the Axios response

          if (err.response?.status === 400) {
            console.log("useAuth - Status is 400"); // Log if status is 400
            if (err.response.data?.detail === 'That is already your current username') {
              console.log("useAuth - Matching specific username error detail"); // Log if detail matches
              msg = 'That is already your current username'; // Or your preferred frontend message
            } else if (err.response.data?.detail === 'Username already taken') {
               console.log("useAuth - Matching 'Username already taken' detail"); // Log if taken
               msg = 'Username already taken';
            } else {
              console.log("useAuth - 400 but not specific username or taken error"); // Log other 400s
              msg = err.response?.data?.detail || err.response?.data?.message || 'Bad request.';
            }
          } else {
            console.log("useAuth - Non-400 HTTP error or network error"); // Log other errors
            msg =
              err.response?.data?.detail ||
              err.response?.data?.message ||
              err.message ||
              String(e);
          }

        } else if (e instanceof Error) {
           console.log("useAuth - Caught non-Axios Error:", e.message); // Log generic Error
           msg = e.message;
        }

         console.log("useAuth - Setting error state to:", msg); // Log the message being set
         setError(msg); // Set the error state

         console.log("useAuth - Re-throwing error:", msg); // Log before re-throwing
         throw new Error(msg); // Re-throw the error

      } finally {
        console.log("useAuth - changeUsername finally block"); // Log finally block
        setLoading(false); // Ensure loading state is reset
      }
    },
    [] // Dependencies for useCallback (empty as it doesn't depend on props/state from outside)
  );


  // Change Email (with MycoCore event broadcast)
  const changeEmail = useCallback(
    async (newEmail: string): Promise<SimpleMessage> => {
      setError(null);
      setLoading(true);
      try {
        const res = await changeEmailService(newEmail);

        // Broadcast to "emailUpdates" for MycoCore and others
        const emailChannel = new BroadcastChannel("emailUpdates");
        emailChannel.postMessage({ type: "emailUpdated", newEmail });
        emailChannel.close();

        return res;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );


  // Cancel Pending Email
  const cancelPendingEmailFn = useCallback(async (): Promise<SimpleMessage> => {
    setError(null);
    setLoading(true);
    try {
      return await cancelPendingEmailService();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Request Password Reset
  const requestPasswordReset = useCallback(
    async (email: string): Promise<SimpleMessage> => {
      setError(null);
      setLoading(true);
      try {
        return await requestPasswordResetService(email);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    user,
    token,
    loading,
    error,
    pinVerified,
    refreshUser,
    register,
    login,
    logout,
    setPin,
    verifyPin,
    changePin,
    changePassword,
    changeUsername,
    changeEmail,
    requestPasswordReset,
    cancelPendingEmail: cancelPendingEmailFn,
  };
}
