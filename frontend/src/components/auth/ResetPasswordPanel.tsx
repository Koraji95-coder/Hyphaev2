import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { verifyResetToken } from "@/services/auth";

const ResetPasswordPanel: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing token");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await verifyResetToken(token, password);
      setMessage(res.message);
      setError(null);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.detail || "Reset failed"
        : "Reset failed";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center px-4">
      <form
        onSubmit={handleReset}
        className="w-full max-w-md border border-emerald-800 rounded-md bg-black px-6 py-8 space-y-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            HyphaeOS
          </h1>
          <p className="mt-1 text-sm tracking-widest text-cyan-400">PASSWORD RESET</p>
        </div>
        <div className="space-y-1">
          <label className="text-emerald-400 uppercase text-xs">New Synaptic Key</label>
          <input
            type="password"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-emerald-400 uppercase text-xs">Confirm Key</label>
          <input
            type="password"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-sm font-bold">
          Reset Password
        </button>
        {message && <div className="text-emerald-400 text-center text-sm">{message}</div>}
        {error && <div className="text-yellow-400 text-center text-sm">{error}</div>}
      </form>
      <div className="mt-8 text-xs text-gray-600">HyphaeOS © 2025 • Recovery Node Sector-3</div>
    </div>
  );
};

export default ResetPasswordPanel;
