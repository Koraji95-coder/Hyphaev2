//components/auth/MycelialLoginPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Sprout } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from "@/hooks/useAuth";

interface MycelialLoginPanelProps {
  onSuccess: () => void;
}

const MycelialLoginPanel: React.FC<MycelialLoginPanelProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [neuralId, setNeuralId] = useState('');
  const [synapticKey, setSynapticKey] = useState('');
  const [preserveEcho, setPreserveEcho] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const hasAnimated = useRef(false);
  const typingRef = useRef<HTMLDivElement>(null);

  // Load any previously stored username and toggle state
  useEffect(() => {
    const savedId = typeof localStorage !== 'undefined'
      ? localStorage.getItem('hyphae_username')
      : null;
    if (savedId) {
      setNeuralId(savedId);
      setPreserveEcho(true);
    }
  }, []);

  // Persist neural ID when toggled on
  useEffect(() => {
    if (!preserveEcho) return;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hyphae_username', neuralId);
    }
  }, [neuralId, preserveEcho]);

  const handleToggle = () => {
    const next = !preserveEcho;
    setPreserveEcho(next);
    if (!next) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('hyphae_username');
      }
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hyphae_username', neuralId);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Login attempt with:", { neuralId, synapticKey });
      await login(neuralId, synapticKey);
      setTerminalLines((prev) => [...prev, "✅ Link Established"]);
      onSuccess();
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.status === 401
            ? "Invalid Neural ID or Synaptic Key. Please try again."
            : err.response?.data?.detail || "Unknown error during link initiation.";
        setTerminalLines((prev) => [...prev, `❌ Link Failed: ${msg}`]);
      } else {
        setTerminalLines((prev) => [
          ...prev,
          "❌ Link Failed: Unexpected system error. Please try again.",
        ]);
      }
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "Good early cycle, Operator.";
    if (hour < 12) return "Good morning, Operator.";
    if (hour < 18) return "Good afternoon, Operator.";
    return "Good evening, Operator.";
  };

  const lineIndex = useRef(0);
  const charIndex = useRef(0);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const hasBooted = sessionStorage.getItem('mycocoreBooted');
    const intro = hasBooted
      ? [
          ' Welcome back, Operator.',
          ' MycoCore standing by.',
          ' Awaiting authentication input...'
        ]
      : [
          ' Initializing MycoCore v1.00...',
          ' Mycelial neural threads online.',
          ' Synaptic integrity check... PASSED.',
          ` ${getGreeting()}`,
          ' Awaiting authentication input...'
        ];

    const typeChar = () => {
      if (lineIndex.current >= intro.length) {
        if (!hasBooted) sessionStorage.setItem('mycocoreBooted', 'true');
        return;
      }

      const currentFullLine = intro[lineIndex.current];
      if (charIndex.current < currentFullLine.length) {
        const nextChar = currentFullLine[charIndex.current];
        setCurrentLine(prev => (prev || '') + nextChar);
        charIndex.current++;
        setTimeout(typeChar, 25 + Math.random() * 30);
      } else {
        setTerminalLines(prev => [...prev, currentFullLine]);
        setCurrentLine('');
        charIndex.current = 0;
        lineIndex.current++;
        setTimeout(typeChar, 500);
      }
    };

    typeChar();
  }, []);

  return (
      <div className="min-h-screen w-full bg-[#0b0f1a] flex flex-col items-center justify-center px-4">
        {/* Glassy Panel */}
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md p-8 rounded-2xl bg-dark-300/70 backdrop-blur-xl shadow-2xl border border-cyan-400/10 flex flex-col gap-7"
        >
          {/* Branding */}
          <div className="text-center mb-3">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-green-400 to-emerald-500 drop-shadow-[0_2px_8px_rgba(52,255,186,0.8)]">
              HyphaeOS
            </h1>
            <p className="mt-1 text-base tracking-widest text-cyan-200 font-mono">MYCELIAL NEURAL INTERFACE</p>
          </div>

          {/* Neural ID Input */}
          <div>
            <label className="block text-cyan-300 uppercase text-xs mb-1 font-bold tracking-wide">
              <Sprout size={13} className="inline-block mr-1 mb-1" />
              Neural ID
            </label>
            <input
              type="text"
              autoFocus
              className="w-full px-4 py-2 rounded-lg bg-dark-200/70 border border-cyan-800 text-cyan-100 placeholder-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="Enter your neural identifier"
              value={neuralId}
              onChange={e => setNeuralId(e.target.value)}
            />
          </div>

          {/* Synaptic Key */}
          <div>
            <label className="block text-cyan-300 uppercase text-xs mb-1 font-bold tracking-wide">
              <Sprout size={13} className="inline-block mr-1 mb-1" />
              Synaptic Key
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-dark-200/70 border border-cyan-800 text-cyan-100 placeholder-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="Enter your synaptic passkey"
              value={synapticKey}
              onChange={e => setSynapticKey(e.target.value)}
            />
          </div>

          {/* Toggle + Forgot */}
          <div className="flex items-center justify-between text-xs text-cyan-400">
            <Toggle
              checked={preserveEcho}
              onChange={handleToggle}
              label="Persist Thoughtform"
            />
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-cyan-300 hover:underline"
            >
              Restore Neural Signature
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 via-green-400 to-emerald-400 text-black font-bold text-lg shadow-lg transition hover:brightness-110 focus:outline-none"
          >
            Awaken Link
          </button>

          {/* Register Link */}
          <p className="text-center text-xs text-cyan-500 mt-1 select-none">
            First connection?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-cyan-200 hover:underline"
            >
              Seed Mycelial Identity
            </button>
          </p>
        </form>

        {/* Terminal Log */}
        <div className="w-full max-w-md mt-7 px-5 py-4 rounded-lg bg-[#101525]/90 border border-cyan-400/20 shadow-inner text-[15px] font-mono text-green-300 overflow-y-auto min-h-[100px] max-h-48 leading-relaxed"
          ref={typingRef}
        >
          {terminalLines.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap">{line}</div>
          ))}
          {currentLine && (
            <div>
              {`> ${currentLine}`}
              <span className="animate-pulse text-cyan-300">█</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-7 text-xs text-cyan-800 tracking-wide">
          HyphaeOS © 2025 • Mycelial Core Instance 897.A.12
        </div>
      </div>
    );
};

export default MycelialLoginPanel;