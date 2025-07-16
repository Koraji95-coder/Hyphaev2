// src/components/EmailChangeVerificationPanel.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";
import { verifyEmailChange } from "@/services/auth";

const EmailChangeVerificationPanel: React.FC = () => {
  const { refreshUser } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";

  const [message, setMessage] = useState("Verifying your new email…");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(true);
      setMessage("Invalid verification link. Please request a new email change.");
      return;
    }

    verifyEmailChange(token)
      .then(async () => {
        setSuccess(true);
        setMessage("Email verified successfully! You may now close this tab.");
        try {
          await refreshUser();
        } catch {/* ignore */}
        // notify other tabs immediately
        const channel = new BroadcastChannel("emailVerified");
        channel.postMessage("verified");
        // Don't close the channel immediately—let browser clean up
      })
      .catch((err: unknown) => {
        const detail = (err as AxiosError<{ detail?: string }>).response
          ?.data?.detail
          ?.toLowerCase() || "";
        setError(true);
        if (detail.includes("invalid or expired")) {
          setMessage("Verification failed. The link may be invalid or expired.");
        } else {
          setMessage("An error occurred. Please try again or contact support.");
        }
      });
  }, [token, refreshUser]);

  return (
    <div className="min-h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center px-4 select-none">
      <div className="w-full max-w-md border border-cyan-800 rounded-md bg-black px-6 py-8 text-center space-y-6">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">
          Email Change Verification
        </h1>
        <div
          className={
            success
              ? "text-emerald-400"
              : error
              ? "text-yellow-400"
              : "text-cyan-400"
          }
        >
          {message}
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-600">
        HyphaeOS © 2025 • Mycelial Seed Node
      </div>
    </div>
  );
};

export default EmailChangeVerificationPanel;
