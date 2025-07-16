// src/components/auth/MycelialRegisterPanel.tsx
import React, { useState, useRef, useEffect } from "react";
import { Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

const EMAIL_VERIFY_LIMIT_SEC = 10 * 60; // 10 minutes
const AUTO_REDIRECT_SEC   = 60;        // 1 minute to redirect to login

const MycelialRegisterPanel: React.FC = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [username,   setUsername]   = useState("");
  const [email,      setEmail]      = useState("");
  const [synapticKey,setSynapticKey]= useState("");
  const [neuralPin,  setNeuralPin]  = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentLine,  setCurrentLine]    = useState("");
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [timer,       setTimer]      = useState(EMAIL_VERIFY_LIMIT_SEC);
  const [autoRedirect,setAutoRedirect]= useState(AUTO_REDIRECT_SEC);
  const [sending,     setSending]    = useState(false);
  const [resendMessage,setResendMessage]= useState("");
  const hasAnimated   = useRef(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // client‐side sanity checks
    if (username.trim().length < 3) {
      return setTerminalLines(lines => [...lines, "❌ Handle must be at least 3 chars"]);
    }
    if (synapticKey.length < 8) {
      return setTerminalLines(lines => [...lines, "❌ Passkey must be at least 8 chars"]);
    }
    if (!/^\d{4}$/.test(neuralPin)) {
      return setTerminalLines(lines => [...lines, "❌ PIN must be exactly 4 digits"]);
    }

    // build the payload, only including email if non‐empty
    const trimmedEmail = email.trim();
    const payload = {
      username: username.trim(),
      password: synapticKey,
      pin:      neuralPin,
      ...(trimmedEmail ? { email: trimmedEmail } : {}),
    };

    try {
      // cast to any so TS won’t complain that “email” might be missing
      await register(payload as any);


      setTerminalLines(lines => [
        ...lines,
        `✅ Registration complete. Welcome, ${username.trim()}.`,
        `📧 Verification email sent to ${trimmedEmail}.`,
        "🔐 Check your inbox to activate your account.",
        "🚦 Redirecting to verification…",
      ]);
      setShowCheckEmail(true);

    } catch (err: any) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : err.message || "Unknown error";
      setTerminalLines(lines => [...lines, `❌ Registration Failed: ${msg}`]);
    }
  };

  const handleResend = async () => {
    setSending(true);
    setResendMessage("");
    try {
      const res = await axios.post("/api/auth/resend-verification");
      setResendMessage(res.data?.message || "Verification link resent.");
      setTimer(EMAIL_VERIFY_LIMIT_SEC);
    } catch {
      setResendMessage("Failed to resend. Try again later.");
    } finally {
      setSending(false);
    }
  };

  // countdown for resend
  useEffect(() => {
    if (!showCheckEmail || timer <= 0) return;
    const iv = setInterval(() => setTimer(t => t - 1), 1_000);
    return () => clearInterval(iv);
  }, [showCheckEmail, timer]);

  // auto‐redirect countdown
  useEffect(() => {
    if (!showCheckEmail || autoRedirect <= 0) return;
    const iv = setInterval(() => setAutoRedirect(s => s - 1), 1_000);
    if (autoRedirect === 1) {
      setTimeout(() => navigate("/login", { replace: true }), 1_000);
    }
    return () => clearInterval(iv);
  }, [showCheckEmail, autoRedirect, navigate]);

  // terminal intro
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const intro = [
      "🌱 Seeding Mycelial Genesis...",
      "🧬 Encoding user blueprint...",
      "📡 Awaiting connection parameters..."
    ];
    let li = 0, ci = 0;
    const typeChar = () => {
      if (li >= intro.length) return;
      const line = intro[li];
      if (ci < line.length) {
        setCurrentLine(c => c + line[ci++]);
        setTimeout(typeChar, 25 + Math.random()*25);
      } else {
        setTerminalLines(l => [...l, line]);
        setCurrentLine("");
        li++; ci = 0;
        setTimeout(typeChar, 500);
      }
    };
    typeChar();
  }, []);

  // CHECK‐EMAIL UI
  if (showCheckEmail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-mono px-4">
        <div className="w-full max-w-md border border-cyan-800 rounded-md bg-black px-6 py-8 text-center space-y-6">
          <h1 className="text-4xl font-bold text-cyan-400">Email Verification</h1>
          <p>
            We’ve sent a link to <b className="text-emerald-300">{email.trim()}</b>
          </p>
          <p className="text-cyan-400">Check your inbox (or spam) to activate.</p>
          <p className="text-yellow-400">
            Link expires in{" "}
            <b>{Math.floor(timer/60)}:{String(timer%60).padStart(2,"0")}</b>
          </p>
          <button
            onClick={handleResend}
            disabled={sending || timer <= 0}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-2 rounded"
          >
            {sending ? "Resending…" : "Resend Verification"}
          </button>
          {resendMessage && <p className="text-cyan-400">{resendMessage}</p>}
          <p className="mt-4 text-xs text-gray-500">
            Redirecting in {autoRedirect}s…{" "}
            <button onClick={() => navigate("/login")} className="underline">
              Go to Login
            </button>
          </p>
        </div>
        <footer className="mt-8 text-xs text-gray-600">
          HyphaeOS © 2025 • Mycelial Seed Node
        </footer>
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-mono px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md border border-emerald-800 rounded-md bg-black px-6 py-8 space-y-6"
      >
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            HyphaeOS
          </h1>
          <p className="mt-1 text-sm tracking-wide text-cyan-400">
            IDENTITY REGISTRATION PROTOCOL
          </p>
        </div>

        {/* Handle */}
        <div className="space-y-1">
          <label className="text-emerald-400 text-xs uppercase flex items-center gap-2">
            <Sprout size={12} /> Mycelial Handle
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. Dustin"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded text-white"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-emerald-400 text-xs uppercase flex items-center gap-2">
            <Sprout size={12} /> Neural Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded text-white"
          />
        </div>

        {/* Passkey */}
        <div className="space-y-1">
          <label className="text-emerald-400 text-xs uppercase flex items-center gap-2">
            <Sprout size={12} /> Synaptic Key
          </label>
          <input
            type="password"
            value={synapticKey}
            onChange={e => setSynapticKey(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded text-white"
          />
        </div>

        {/* PIN */}
        <div className="space-y-1">
          <label className="text-emerald-400 text-xs uppercase flex items-center gap-2">
            <Sprout size={12} /> 4-Digit Access PIN
          </label>
          <input
            type="password"
            value={neuralPin}
            onChange={e => setNeuralPin(e.target.value.replace(/\D/g,"").slice(0,4))}
            maxLength={4}
            placeholder="1234"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded font-bold"
        >
          {sending ? "Seeding…" : "Seed Identity"}
        </button>

        <p className="text-center text-xs text-gray-500">
          Already synced?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-emerald-400 underline"
          >
            Awaken Core
          </button>
        </p>
      </form>

      {/* Terminal log */}
      <div className="w-full max-w-md mt-6 p-4 bg-black border border-emerald-800 text-green-300 text-xs rounded font-mono overflow-y-auto min-h-[120px]">
        {terminalLines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        {currentLine && (
          <p>
            {currentLine}
            <span className="animate-pulse">█</span>
          </p>
        )}
      </div>

      <footer className="mt-8 text-xs text-gray-600">
        HyphaeOS © 2025 • Mycelial Seed Node
      </footer>
    </div>
  );
};

export default MycelialRegisterPanel;
