import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function FancyNeuralLogin({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();

  const [neuralId, setNeuralId] = useState("");
  const [synapticKey, setSynapticKey] = useState("");
  const [error, setError] = useState("");
  // Statically set terminal lines without typing effect
  const terminalLines = [
    "🔌 Initiating Neural Core handshake...",
    "🌱 Growing synaptic mesh...",
    "💡 Bioluminescent nodes detected.",
    "🟢 Network ready. Authenticate to awaken core.",
  ];

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(neuralId, synapticKey);
      onSuccess();
    } catch (err) {
      setError("❌ Neural link failed. Check your credentials.");
      setTerminalLines((prev) => [
        ...prev,
        "❌ Neural link failed. Authentication error.",
      ]);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#10151f]">
      {/* --- Neural Mycelial SVG Net (No Animations) --- */}
      <NeuralSVGBackground />

      {/* --- Glass login panel --- */}
      <div
        className="relative z-10 backdrop-blur-xl bg-black/60 border border-cyan-700 shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center"
        style={{
          boxShadow: "0 4px 60px 0 #00ffd020, 0 2px 4px 0 #1de9b640",
        }}
      >
        {/* --- Neural Core SVG (No Animations) --- */}
        <div className="mb-6">
          <NeuralCoreSVG />
        </div>

        {/* --- Fancy heading --- */}
        <h1
          className="font-extrabold text-4xl DECL 0,1
          bg-gradient-to-r from-[#8aff80] to-[#00f5d4] bg-clip-text text-transparent drop-shadow-[0_0_15px_#00ffd0]"
        >
          Hyphae<span className="text-white/80">OS</span>
        </h1>
        <div className="uppercase text-xs text-cyan-400/70 tracking-wider text-center mb-8 mt-2">
          Mycelial Neural Link v2.0
        </div>

        {/* --- Login Form --- */}
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-6 w-full relative"
        >
          <GlassInput
            label="Neural ID"
            placeholder="Enter your neural ID"
            type="text"
            value={neuralId}
            onChange={(e) => setNeuralId(e.target.value)}
            icon={
              <svg width="18" height="18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="#00f5d4" strokeWidth="2" />
                <circle cx="9" cy="9" r="4" fill="#00f5d4" fillOpacity={0.15} />
              </svg>
            }
          />
          <GlassInput
            label="Synaptic Key"
            placeholder="Your synaptic passkey"
            type="password"
            value={synapticKey}
            onChange={(e) => setSynapticKey(e.target.value)}
            icon={
              <svg width="18" height="18" fill="none">
                <rect x="3" y="7" width="12" height="7" rx="2" stroke="#00f5d4" strokeWidth="2" />
                <circle cx="9" cy="10.5" r="1.2" fill="#00ffd0" />
              </svg>
            }
          />
          <button
            className="mt-2 py-3 rounded-xl font-bold bg-gradient-to-r from-[#38bdf8] to-[#00f5d4] text-black text-lg shadow-lg transition-colors"
            type="submit"
          >
            Connect to Core
          </button>
        </form>
        {error && (
          <div className="w-full text-center text-error-400 mt-3 text-sm">{error}</div>
        )}

        {/* --- Terminal Glass Log --- */}
        <div
          className="mt-8 w-full rounded-xl border border-cyan-900/40 bg-black/70 px-4 py-4 min-h-[100px] max-h-[300px] overflow-y-auto shadow-inner font-mono text-[14px] text-[#a1ffce] backdrop-blur-sm"
          style={{
            boxShadow: "0 1px 16px 0 rgba(168, 53, 111, 0.13)",
          }}
        >
          {terminalLines.map((line, i) => (
            <div key={i} className="whitespace-pre">{line}</div>
          ))}
        </div>
        <div className="w-full text-xs text-center text-cyan-900/70 mt-6 tracking-wide">
          HyphaeOS © 2025 • Neural Core Prototype
        </div>
      </div>
    </div>
  );
}

// --- Neural Mycelial SVG Background (No Animations) ---
function NeuralSVGBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none"
      viewBox="0 0 900 600"
      fill="none"
      style={{
        opacity: 0.5,
        transition: "opacity 0.4s",
      }}
      preserveAspectRatio="none"
      >
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="80%" fx="50%" fy="50%" gradientTransform="rotate(0)">
          <stop offset="0%" stopColor="#00ffd0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0b0f1a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mycelium" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#00f5d4" />
        </linearGradient>
      </defs>
      {/* Static Circles (No Pulsing) */}
      <circle cx="160" cy="160" r="70" fill="url(#glow)" />
      <circle cx="740" cy="140" r="46" fill="url(#glow)" />
      <circle cx="440" cy="490" r="55" fill="url(#glow)" />
      {/* Mycelial network lines */}
      <path
        d="M180 210 Q250 80 420 110 Q640 170 780 80"
        stroke="url(#mycelium)"
        strokeWidth="3.2"
        fill="none"
        opacity="0.28"
      />
      <path
        d="M240 490 Q330 330 650 420 Q700 440 740 390"
        stroke="url(#mycelium)"
        strokeWidth="2.8"
        fill="none"
        opacity="0.23"
      />
      {/* Scattered nodes */}
      <circle cx="250" cy="450" r="7.5" fill="#00ffd0" fillOpacity="0.5" />
      <circle cx="660" cy="430" r="8.5" fill="#38bdf8" fillOpacity="0.5" />
      <circle cx="700" cy="90" r="6.5" fill="#38bdf8" fillOpacity="0.4" />
      <circle cx="430" cy="510" r="4.5" fill="#00ffd0" fillOpacity="0.27" />
    </svg>
  );
}

// --- Neural Core SVG in Panel Header (No Animations) ---
function NeuralCoreSVG() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      className="drop-shadow-[0_0_16px_#00ffd0]"
      aria-hidden
    >
      <circle
        cx="36"
        cy="36"
        r="32"
        stroke="#00f5d4"
        strokeWidth="2.4"
        strokeDasharray="12 6"
      />
      <circle cx="36" cy="36" r="20" stroke="url(#g2)" strokeWidth="1.4" opacity="0.4" />
      <circle cx="36" cy="36" r="7" fill="url(#g3)" filter="url(#blur1)" />
      <defs>
        <radialGradient id="g3" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#8aff80" />
          <stop offset="100%" stopColor="#00ffd0" stopOpacity="0.7" />
        </radialGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#00ffd0" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="blur1">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
      </defs>
    </svg>
  );
}

// --- Glassy Input with icon ---
function GlassInput({
  label,
  icon,
  type = "text",
  ...props
}: {
  label: string;
  icon?: React.ReactNode;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-cyan-200 text-xs font-bold mb-1">{label}</label>
      <div className="flex items-center rounded-xl bg-black/50 border border-cyan-700/30 px-3 py-2 shadow-inner focus-within:border-cyan-400 transition-all group">
        {icon && <span className="mr-2 opacity-80">{icon}</span>}
        <input
          type={type}
          {...props}
          className="flex-1 bg-transparent outline-none text-cyan-50 text-base font-mono placeholder:text-cyan-200/40 focus:placeholder:text-cyan-100/70 transition-all"
          autoComplete={type === "password" ? "current-password" : undefined}
        />
      </div>
    </div>
  );
}