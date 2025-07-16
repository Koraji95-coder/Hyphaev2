// src/components/auth/ForgotPasswordPanel.tsx
import React, { useState, useEffect, useRef } from "react";
import { Sprout } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const INTRO_LINES = [
  "🧠 Initializing Neural Pattern Recovery…",
  "📡 Dialing into the Neuro-Relay…",
  "⏳ Standing by for Reset Signature…"
];
const POST_LINE =
  "⏱️ If that email exists within the Neural Network, the Restoration Signature will arrive shortly...";
const CLOSE_LINE = "You may now close this tab.";

export default function ForgotPasswordPanel() {
  const { requestPasswordReset } = useAuth();
  const [doneLines, setDoneLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [phase, setPhase] = useState<
    "typingIntro" | "form" | "typingPost" | "showCheck" | "showClose"
  >("typingIntro");
  const [email, setEmail] = useState("");
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

  // 1) Intro typing
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
      setPhase("form");
    })();
  }, []);

  // 2) On submit: post line → check → close
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhase("typingPost");

    requestPasswordReset(email).catch(() => {});

    await typeString(POST_LINE, setCurrentLine, 30);
    setDoneLines((d) => [...d, POST_LINE]);
    setCurrentLine("");
    setShowCheckmark(true);
    setPhase("showCheck");
  };

  // 3) After check, show close message
  useEffect(() => {
    if (phase !== "showCheck") return;
    const t = setTimeout(() => setPhase("showClose"), 800);
    return () => clearTimeout(t);
  }, [phase]);

  const CheckSVG = () => (
    <svg viewBox="0 0 52 52" width={64} height={64} className="checkmark">
      <circle cx="26" cy="26" r="25" fill="none" stroke="#06b6d4" strokeWidth="2" />
      <path d="M14 27 l8 8 l16 -16" fill="none" stroke="#06b6d4" strokeWidth="4" />
      <style>{`
        .checkmark {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation:
            drawCircle 0.8s ease-out forwards,
            drawCheck 0.8s ease-out forwards 0.8s,
            pulse 0.6s ease-out 1.8s 1;
        }
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck  { to { stroke-dashoffset: 0; } }
        @keyframes pulse {
          0%   { transform: scale(1); filter: drop-shadow(0 0 0px #06b6d4); }
          50%  { transform: scale(1.2); filter: drop-shadow(0 0 8px #06b6d4); }
          100% { transform: scale(1); filter: drop-shadow(0 0 0px #06b6d4); }
        }
      `}</style>
    </svg>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start px-4 pt-12 pb-8">
      {/* HEADER */}
      <h1 className="
        header text-6xl font-extrabold mb-12
        text-transparent bg-clip-text
        bg-gradient-to-r from-emerald-400 to-cyan-400
      ">
        Neural Restoration
      </h1>

      {/* CONSOLE */}
      <div
        className="console-container w-full max-w-3xl text-green-400 font-mono text-xl mb-8"
        style={{ height: `${4 * 1.4}em` }}
      >
        {doneLines.map((line, i) => (
          <div key={i} className="whitespace-nowrap">
            {line}
          </div>
        ))}
        {(phase === "typingIntro" || phase === "typingPost") && currentLine && (
          <div className="whitespace-nowrap">
            {currentLine}
            <span className="typing-cursor" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* FORM */}
      {phase === "form" && (
        <form onSubmit={handleSubmit} className="space-y-6 opacity-0 animate-fade-in">
          <label className="flex items-center gap-2 text-emerald-300 uppercase text-xs" style={{ marginBottom: "0.1rem" }}>
            <Sprout size={24} /> Neural Contact
          </label>
          <input
            type="email" required
            className="w-full px-4 py-3 bg-black border border-emerald-700 rounded text-white text-xl placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Enter your neural email"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="submit-btn w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-xl font-bold">
            Dispatch Reset Signal
          </button>
        </form>
      )}

      {/* CHECKMARK */}
      {phase === "showCheck" && showCheckmark && <CheckSVG />}

      {/* CLOSE MESSAGE UNDER CHECKMARK */}
      {phase === "showClose" && (
        <p className="mt-6 text-center text-emerald-200 font-mono text-xl animate-fade-in">
          {CLOSE_LINE}
        </p>
      )}

      {/* FOOTER */}
      <div className="mt-auto pt-8 text-cyan-400 text-sm">© 2025 HyphaeOS</div>

      {/* GLOBAL ANIMATIONS */}
      <style>{`
        /* slim blinking cursor */
        .typing-cursor { display:inline-block; width:2px; height:1.2em; margin-left:2px; background-color:currentColor; vertical-align:bottom; animation:blink-bar 1s steps(2,start) infinite; }
        @keyframes blink-bar { 0%,50%{opacity:1;} 50.1%,100%{opacity:0;} }

        /* header shimmer */
        @keyframes gradient-shift { 0%{background-position:0% 50%;} 100%{background-position:100% 50%;} }
        .header { background-size:200% 200%; animation:gradient-shift 4s ease-in-out infinite alternate; }

        /* console flicker */
        @keyframes flicker { 0%,100%{opacity:1;} 50%{opacity:0.94;} }
        .console-container { animation:flicker 3s ease-in-out infinite; }

        /* fade-in */
        @keyframes fade-in { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation:fade-in 0.8s ease-out forwards; }

        /* button pop */
        .submit-btn { transition:transform 0.2s ease,box-shadow 0.2s ease; }
        .submit-btn:hover { transform:scale(1.03); box-shadow:0 0 8px rgba(16,185,129,0.7); }

        @media (prefers-reduced-motion:reduce) {
          .header, .console-container, .animate-fade-in, .submit-btn, .checkmark { animation:none!important; transition:none!important; }
        }
      `}</style>
    </div>
  );
}
