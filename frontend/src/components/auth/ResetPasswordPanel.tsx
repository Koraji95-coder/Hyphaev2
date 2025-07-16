// src/components/auth/ResetPasswordPanel.tsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { checkResetToken, confirmResetPassword } from "@/services/auth";

const INTRO_LINES = [
  "🧠 Neural Pattern Recovery Initialized…",
  "📡 Establishing relay link…",
  "⏳ Verifying reset token…"
];
const TOKEN_OK_PROMPT = "✔ Token verified. Enter your new Synaptic Key →";
// Combined success + redirect message
const SUCCESS_UNDER = "Synaptic key reset successfully. Redirecting you back to login…";

export default function ResetPasswordPanel() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(search).get("token") || "";

  const [doneLines, setDoneLines]     = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [phase, setPhase] = useState<
    "typingIntro" | "typingSuccess" | "form" | "showCheck" | "showUnder" | "redirecting"
  >("typingIntro");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [underText, setUnderText] = useState("");
  const [showCheckmark, setShowCheckmark] = useState(false);

  const introRan = useRef(false);

  async function typeString(
    text: string,
    setter: (v: string) => void,
    speed = 30
  ) {
    let buf = "";
    for (const ch of text) {
      buf += ch;
      setter(buf);
      await new Promise((r) => setTimeout(r, speed + Math.random() * (speed / 2)));
    }
  }

  // 1) Type intro lines, then verify token
  useEffect(() => {
    if (introRan.current) return;
    introRan.current = true;

    (async () => {
      for (const line of INTRO_LINES) {
        setPhase("typingIntro");
        await typeString(line, setCurrentLine, 25);
        setDoneLines((d) => [...d, line]);
        setCurrentLine("");
        await new Promise((r) => setTimeout(r, 300));
      }

      if (!token) {
        setError("Invalid reset link.");
        setPhase("redirecting");
        return;
      }

      try {
        await checkResetToken(token);
        setPhase("typingSuccess");
      } catch {
        // either show a UI message or immediately navigate back:
        navigate("/forgot-password", { replace: true });
        return;
      }
    })();
  }, [token]);

  // 2) Type the “token ok” prompt, then show form
  useEffect(() => {
    if (phase !== "typingSuccess") return;
    let cancelled = false;

    (async () => {
      await typeString(TOKEN_OK_PROMPT, setCurrentLine, 25);
      if (cancelled) return;
      setDoneLines((d) => [...d, TOKEN_OK_PROMPT]);
      setCurrentLine("");
      await new Promise((r) => setTimeout(r, 500));
      if (!cancelled) setPhase("form");
    })();

    return () => { cancelled = true; };
  }, [phase]);

  // 3) On form submit, draw checkmark
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Keys do not match");
      return;
    }

    try {
      await confirmResetPassword(token, password);
      setShowCheckmark(true);
      setPhase("showCheck");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.detail ?? "Reset failed"
        : "Reset failed";
      setError(msg);
      setPhase("form");
    }
  };

  // 4) After checkmark, fade in under-text then redirect
  useEffect(() => {
    if (phase !== "showCheck") return;
    (async () => {
      await new Promise((r) => setTimeout(r, 800));
      setPhase("showUnder");
      setUnderText(SUCCESS_UNDER);
      await new Promise((r) => setTimeout(r, 3000));
      navigate("/login", { replace: true });
    })();
  }, [phase, navigate]);

  const CheckSVG = () => (
    <svg viewBox="0 0 52 52" width={64} height={64} className="checkmark">
      <circle cx="26" cy="26" r="25" fill="none" stroke="#06b6d4" strokeWidth="2" />
      <path d="M14 27 l8 8 l16 -16" fill="none" stroke="#06b6d4" strokeWidth="4" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-12 px-4">
      {/* HEADER */}
      <h1 className="text-6xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 shimmer-bg">
        Neural Restoration
      </h1>

      {/* CONSOLE */}
      <div
        className="console-container w-full max-w-3xl text-green-400 font-mono text-xl mb-8"
        style={{ height: `${(INTRO_LINES.length + 2) * 1.4}em` }}
      >
        {doneLines.map((line, i) => (
          <div key={i} className="whitespace-nowrap pulse-line">
            {line}
          </div>
        ))}

        {(phase === "typingIntro" || phase === "typingSuccess") && currentLine && (
          <div className="whitespace-nowrap">
            {currentLine}
            <span className="typing-cursor" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* FORM */}
      {phase === "form" && (
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md border border-emerald-800 rounded-md bg-black px-6 py-8 space-y-6"
        >
          {error && <div className="text-yellow-400">{error}</div>}
          <div className="space-y-1">
            <label className="text-emerald-400 uppercase text-xs">New Synaptic Key</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-emerald-400 uppercase text-xs">Confirm Key</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          <button
            type="submit"
            className="btn-pop w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-sm font-bold transition-transform transition-shadow"
          >
            Reset Key
          </button>
        </motion.form>
      )}

      {/* CHECKMARK & UNDER-TEXT */}
      {phase === "showCheck" && showCheckmark && <CheckSVG />}
      {phase === "showUnder" && (
        <p className="mt-6 text-emerald-200 font-mono text-xl animate-fade-in">{underText}</p>
      )}

      {/* FOOTER */}
      <div className="mt-auto pt-8 text-cyan-400 text-sm">© 2025 HyphaeOS</div>

      {/* GLOBAL STYLES */}
      <style>{`
        /* slim blinking cursor */
        .typing-cursor {
          display: inline-block;
          width: 2px;
          height: 1.2em;
          margin-left: 2px;
          background-color: currentColor;
          vertical-align: bottom;
          animation: blink-bar 1s steps(2, start) infinite;
        }
        @keyframes blink-bar { 0%,50% { opacity:1; } 50.1%,100% { opacity:0; } }

        /* line pulse microanimation */
        .pulse-line { animation: glow 0.5s ease-out forwards; }
        @keyframes glow {
          0% { text-shadow: 0 0 8px rgba(16,185,129,0.8); }
          100% { text-shadow: none; }
        }

        /* header shimmer */
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        .shimmer-bg { background-size: 200% 200%; animation: gradient-shift 4s ease-in-out infinite alternate; }

        /* console flicker */
        @keyframes flicker { 0%,100% { opacity:1; } 50% { opacity:0.94; } }
        .console-container { animation: flicker 3s ease-in-out infinite; }

        /* fade-in */
        @keyframes fade-in { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }

        /* button pop */
        .btn-pop:hover { transform: scale(1.03); box-shadow: 0 0 8px rgba(16,185,129,0.7); }

        /* reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .shimmer-bg, .console-container, .animate-fade-in, .btn-pop:hover, .checkmark {
            animation: none !important; transition: none !important;
          }
        }

        /* checkmark draw */
        .checkmark {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation:
            drawCircle 0.6s ease-out forwards,
            drawCheck 0.6s ease-out forwards 0.6s,
            pulse 0.5s ease-out 1.2s 1;
        }
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck  { to { stroke-dashoffset: 0; } }
        @keyframes pulse {
          0%   { transform: scale(1); filter: drop-shadow(0 0 0px #06b6d4); }
          50%  { transform: scale(1.2); filter: drop-shadow(0 0 8px #06b6d4); }
          100% { transform: scale(1); filter: drop-shadow(0 0 0px #06b6d4); }
        }
      `}</style>
    </div>
  );
}
