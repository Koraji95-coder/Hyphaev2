import React, { useState, useEffect, useRef } from "react";
import { Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

const MycelialForgotPanel: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const hasAnimated = useRef(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestPasswordReset(email);
      setTerminalLines((prev) => [
        ...prev,
        `📨 Reset signal transmitted to ${email}.`,
        "🧠 Reintegration pending operator action.",
      ]);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.detail || "Signal interference detected."
        : "Unknown signal corruption.";
      setTerminalLines((prev) => [...prev, `❌ Reset failed: ${msg}`]);
    }
  };

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const intro = [
      "🧠 Neural Pattern Recovery Initialized...",
      "📡 Establishing relay link...",
      "Awaiting signature for reset dispatch..."
    ];

    let lineIndex = 0;
    let charIndex = 0;

    const typeChar = () => {
      if (lineIndex >= intro.length) return;

      const fullLine = intro[lineIndex];
      if (charIndex < fullLine.length) {
        setCurrentLine((prev) => (prev || "") + fullLine[charIndex]);
        charIndex++;
        setTimeout(typeChar, 30 + Math.random() * 20);
      } else {
        setTerminalLines((prev) => [...prev, fullLine]);
        setCurrentLine("");
        lineIndex++;
        charIndex = 0;
        setTimeout(typeChar, 600);
      }
    };

    typeChar();
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center px-4">
      <form
        onSubmit={handleRequestReset}
        className="w-full max-w-md border border-emerald-800 rounded-md bg-black px-6 py-8 space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            HyphaeOS
          </h1>
          <p className="mt-1 text-sm tracking-widest text-cyan-400">
            RECOVERY NODE INTERFACE
          </p>
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-emerald-400 uppercase text-xs flex items-center gap-2">
            <Sprout size={12} /> Neural Contact
          </label>
          <input
            type="email"
            placeholder="Enter your neural email"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-sm font-bold"
        >
          Dispatch Reset Signal
        </button>

        <p className="text-center text-xs text-gray-500 select-none">
          Remembered pattern?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-emerald-400 hover:underline bg-transparent"
          >
            Return to Core
          </button>
        </p>
      </form>

      {/* Terminal log */}
      <div className="w-full max-w-md mt-6 p-4 bg-black border border-emerald-800 text-green-400 text-xs rounded-sm font-mono overflow-y-auto min-h-[160px] leading-relaxed">
        {terminalLines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
        {currentLine && (
          <p>
            {currentLine}
            <span className="animate-pulse">█</span>
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-gray-600">
        HyphaeOS © 2025 • Recovery Node Sector-3
      </div>
    </div>
  );
};

export default MycelialForgotPanel;
