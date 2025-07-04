import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const EMAIL_VERIFY_LIMIT_SEC = 10 * 60; // 10 minutes

const EmailVerificationPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [timer, setTimer] = useState(EMAIL_VERIFY_LIMIT_SEC);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">(
    token ? "pending" : "idle"
  );

  // Attempt auto-verification if token is present
  useEffect(() => {
    if (!email) {
      setMessage("No email found. Please register or login.");
      setTimeout(() => navigate("/login", { replace: true }), 2500);
      return;
    }
    if (token) {
      setStatus("pending");
      setMessage("Verifying your email...");
      axios
        .get("/api/auth/verify_email", { params: { token, email } })
        .then(res => {
          setStatus("success");
          setMessage(res.data.message || "Email verified! You may now log in.");
          setTimeout(() => navigate("/login", { replace: true }), 2000);
        })
        .catch(err => {
          setStatus("error");
          setMessage(
            err.response?.data?.detail ||
              "Verification failed. The link may be invalid or expired."
          );
          setTimer(EMAIL_VERIFY_LIMIT_SEC); // Let user retry/resend
        });
    }
    // eslint-disable-next-line
  }, [token, email, navigate]);

  // Timer countdown (for resending if user never verifies)
  useEffect(() => {
    if (status !== "idle") return;
    if (timer <= 0) {
      handleTimeout();
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [timer, status]);

  // Timeout logic: resend new verification email, redirect after a bit
  const handleTimeout = async () => {
    setMessage("⏰ Verification time expired. Sending a new verification link...");
    await handleResend();
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 4000);
  };

  // Manual resend handler
  const handleResend = async () => {
    if (!email) return;
    setSending(true);
    setStatus("idle");
    try {
      const res = await axios.post("/api/auth/resend-verification", { email });
      const msg = res.data?.message ||
        "A new verification link was sent to your email.";
      setMessage(msg);
      if (msg === "Email already verified") {
        setStatus("success");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } else {
        setTimer(EMAIL_VERIFY_LIMIT_SEC);
      }
    } catch (err) {
      setMessage("Error resending verification email. Please try again.");
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md border border-cyan-800 rounded-md bg-black px-6 py-8 space-y-6 text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Email Verification</h1>
        <p>
          We’ve sent a verification link to<br />
          <span className="text-emerald-300 font-bold">{email}</span>
        </p>

        {status === "pending" && (
          <div className="text-cyan-400 mt-4">Verifying your email...</div>
        )}

        {status === "success" && (
          <div className="text-emerald-400 mt-4">
            {message || "Verification successful! Redirecting..."}
          </div>
        )}

        {status === "error" && (
          <div className="text-yellow-400 mt-4">
            {message}
            <br />
            Please resend the verification email below.
          </div>
        )}

        {status === "idle" && (
          <>
            <p className="mt-4">
              Please check your inbox (and spam folder).
              <br />
              You must verify within <b>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</b>
            </p>
            {message && (
              <div className="text-yellow-400 mt-4">{message}</div>
            )}
          </>
        )}

        {(status === "idle" || status === "error") && (
          <button
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-2 rounded font-bold mt-4"
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? "Resending..." : "Resend Verification Email"}
          </button>
        )}
      </div>
      <div className="mt-8 text-xs text-gray-600">
        HyphaeOS © 2025 • Mycelial Seed Node
      </div>
    </div>
  );
};

export default EmailVerificationPanel;
