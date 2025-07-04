import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import type { AxiosError } from "axios";

const EmailVerificationPanel: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setError(true);
      setMessage("Invalid verification link. Please try registering again.");
      return;
    }
    axios
      .get("/api/auth/verify_email", { params: { token, email } })
      .then(() => {
        setSuccess(true);
        setMessage("Email verified! You may now log in.");
      })
      .catch((err: unknown) => {
        const errorObj = err as AxiosError<{ detail?: string }>;
        const detail = errorObj.response?.data?.detail?.toLowerCase?.() || "";
        if (detail.includes("already verified")) {
          setError(true);
          setMessage("This email was already verified. You may log in.");
        } else {
          setError(true);
          setMessage("Verification failed. The link may be invalid or expired.");
        }
      });
  }, [token, email]);

  return (
    <div className="min-h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center px-4 select-none">
      <div className="w-full max-w-md border border-cyan-800 rounded-md bg-black px-6 py-8 text-center space-y-6">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Email Verification</h1>
        <div className={success ? "text-emerald-400" : error ? "text-yellow-400" : "text-cyan-400"}>
          {message}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          You may now close this tab.
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-600">
        HyphaeOS © 2025 • Mycelial Seed Node
      </div>
    </div>
  );
};

export default EmailVerificationPanel;
