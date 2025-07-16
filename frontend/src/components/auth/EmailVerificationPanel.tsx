// src/components/EmailVerificationPanel.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { verifyEmail, VerifyEmailResponse } from "@/services/auth";
import axios, { AxiosError } from "axios";

const EmailVerificationPanel: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(true);

  // prevent double-calling in React Strict Mode
  const didVerify = useRef(false);

  useEffect(() => {
    if (didVerify.current) return;
    didVerify.current = true;

    if (!token) {
      setLoading(false);
      setError(true);
      setMessage("Invalid verification link. Please try registering or requesting a new link.");
      setCanResend(true);
      return;
    }

    const resendTimer = setTimeout(() => setCanResend(true), 30000);
    let errorTimer: NodeJS.Timeout;

    setLoading(true);
    setError(false);

    verifyEmail(token, email)
      .then((response: VerifyEmailResponse) => {
        if (response.success) {
          setSuccess(true);
          setMessage(response.message || "Email verified! You may now log in.");
        } else {
          errorTimer = setTimeout(() => {
            setError(true);
            setMessage(response.message || "Verification failed. The link may be invalid or expired.");
            setCanResend(true);
            setLoading(false);
          }, 1000);
        }
      })
      .catch((err: unknown) => {
        const detail = (err as AxiosError<{ detail?: string }>).response?.data?.detail?.toLowerCase() || "";
        errorTimer = setTimeout(() => {
          setError(true);
          if (detail.includes("already verified")) {
            setSuccess(true);
            setMessage("This email was already verified. You may log in.");
          } else if (detail.includes("invalid") || detail.includes("expired")) {
            setMessage("Verification failed. The link may be invalid or expired.");
            setCanResend(true);
          } else {
            setMessage("An error occurred. Please try again or contact support.");
            setCanResend(true);
          }
          setLoading(false);
        }, 1000);
      })
      .finally(() => {
        // if no errorTimer was set, loading should stop
        setLoading(false);
      });

    return () => {
      clearTimeout(resendTimer);
      if (errorTimer) {
        clearTimeout(errorTimer);
      }
    };
  }, [token, email]);

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await axios.post("/api/auth/resend_verification");
      setMessage("Verification email resent. Please check your inbox.");
      setCanResend(false);
      setTimeout(() => setCanResend(true), 30000);
    } catch (err: unknown) {
      const detail = (err as AxiosError<{ detail?: string }>).response?.data?.detail;
      setMessage(detail || "Failed to resend verification email. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center px-4 select-none">
        <div className="w-full max-w-md border border-cyan-800 rounded-md bg-black px-6 py-8 text-center space-y-6">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Email Verification</h1>
          <div className="text-cyan-400">{message}</div>
        </div>
        <div className="mt-8 text-xs text-gray-600">
          HyphaeOS © 2025 • Mycelial Seed Node
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center px-4 select-none">
      <div className="w-full max-w-md border border-cyan-800 rounded-md bg-black px-6 py-8 text-center space-y-6">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Email Verification</h1>
        <div className={success ? "text-emerald-400" : error ? "text-yellow-400" : "text-cyan-400"}>
          {message}
        </div>
        {error && canResend && (
          <button
            onClick={handleResend}
            className="text-sm text-cyan-400 hover:text-cyan-300 underline mt-2"
          >
            Resend Verification Email
          </button>
        )}
        <div className="text-xs text-gray-500 mt-2">You may now close this tab.</div>
      </div>
      <div className="mt-8 text-xs text-gray-600">HyphaeOS © 2025 • Mycelial Seed Node</div>
    </div>
  );
};

export default EmailVerificationPanel;
