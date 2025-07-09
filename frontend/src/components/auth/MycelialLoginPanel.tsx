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
     // login() will throw on failure, and set the auth header on success
        await login(neuralId, synapticKey);
        onSuccess(); // ✅ successful login
      } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.detail || "Unknown error during link initiation.";
        setTerminalLines(prev => [...prev, `❌ Link Failed: ${msg}`]);
      } else {
        setTerminalLines(prev => [...prev, "❌ Link Failed: Unexpected system error."]);
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
    <div className="min-h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md border border-emerald-800 rounded-md bg-black px-6 py-8 space-y-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            HyphaeOS
          </h1>
          <p className="mt-1 text-sm tracking-widest text-cyan-400">
            MYCELIAL NEURAL INTERFACE V.1.00
          </p>
        </div>

        {/* Neural ID */}
        <div className="space-y-1">
          <label htmlFor="neuralId" className="text-emerald-400 flex items-center gap-2 uppercase text-xs">
            <Sprout size={12} /> Neural ID
          </label>
          <input
            id="neuralId"
            type="text"
            placeholder="Enter your neural identifier"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            value={neuralId}
            onChange={(e) => setNeuralId(e.target.value)}
          />
        </div>

        {/* Synaptic Key */}
        <div className="space-y-1">
          <label htmlFor="synapticKey" className="text-emerald-400 flex items-center gap-2 uppercase text-xs">
            <Sprout size={12} /> Synaptic Key
          </label>
          <input
            id="synapticKey"
            type="password"
            placeholder="Enter your synaptic passkey"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            value={synapticKey}
            onChange={(e) => setSynapticKey(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <Toggle
            checked={preserveEcho}
            onChange={handleToggle}
            label="Persist Thoughtform"
          />
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-emerald-400 hover:underline cursor-pointer select-none bg-transparent"
          >
            Restore Neural Signature
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-sm font-bold"
        >
          Awaken Link
        </button>

        <p className="text-center text-xs text-gray-500 select-none">
          First connection?{' '}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-emerald-400 hover:underline cursor-pointer bg-transparent"
          >
            Seed Mycelial Identity
          </button>
        </p>
      </form>

      <div
        className="w-full max-w-md mt-6 p-4 bg-black border border-emerald-800 text-green-400 text-xs rounded-sm font-mono overflow-y-auto min-h-[160px] leading-relaxed"
        ref={typingRef}
      >
        {terminalLines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
        {typeof currentLine === 'string' && currentLine.length > 0 && (
          <p>
            {`> ${currentLine}`}
            <span className="animate-pulse">█</span>
          </p>
        )}
      </div>

      <div className="mt-8 text-xs text-gray-600">
        HyphaeOS © 2025 • Mycelial Core Instance 897.A.12
      </div>
    </div>
  );
};

export default MycelialLoginPanel;
