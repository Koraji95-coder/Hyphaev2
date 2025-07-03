import React, { useState, useRef, useEffect } from "react";
import { Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

const MycelialRegisterPanel: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [synapticKey, setSynapticKey] = useState("");
  const [neuralPin, setNeuralPin] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const hasAnimated = useRef(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await register({
        username,
        email,
        password: synapticKey,
        pin: neuralPin,
      });
      setTerminalLines((prev) => [
        ...prev,
        `✅ Registration complete. Welcome ${response.username}`,
        `📧 Verification email sent to ${email}.`,
        "🔐 Please check your inbox and verify your identity to activate your account.",
        "🚦 Redirecting to verification node…"
      ]);
      setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(email)}`), 3000);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.detail || "Unknown failure."
        : "Unexpected neural error.";
      setTerminalLines((prev) => [...prev, `❌ Registration Failed: ${msg}`]);
    }
  };


  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const intro = [
      "🌱 Seeding Mycelial Genesis...",
      "🧬 Encoding user blueprint...",
      "📡 Awaiting connection parameters..."
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
        onSubmit={handleRegister}
        className="w-full max-w-md border border-emerald-800 rounded-md bg-black px-6 py-8 space-y-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            HyphaeOS
          </h1>
          <p className="mt-1 text-sm tracking-widest text-cyan-400">
            IDENTITY REGISTRATION PROTOCOL
          </p>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="text-emerald-400 uppercase text-xs flex items-center gap-2">
            <Sprout size={12} /> Mycelial Handle
          </label>
          <input
            type="text"
            placeholder="Create a handle..."
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-emerald-400 uppercase text-xs flex items-center gap-2">
            <Sprout size={12} /> Neural Email
          </label>
          <input
            type="email"
            placeholder="Enter your neural contact"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-emerald-400 uppercase text-xs flex items-center gap-2">
            <Sprout size={12} /> Synaptic Key
          </label>
          <input
            type="password"
            placeholder="Create your synaptic key"
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            value={synapticKey}
            onChange={(e) => setSynapticKey(e.target.value)}
          />
        </div>

        {/* PIN */}
        <div className="space-y-1">
          <label className="text-emerald-400 uppercase text-xs flex items-center gap-2">
            <Sprout size={12} /> 4-Digit Access Pin
          </label>
          <input
            type="password"
            placeholder="****"
            maxLength={4}
            className="w-full px-4 py-2 bg-black border border-emerald-900 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            value={neuralPin}
            onChange={(e) => setNeuralPin(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-sm font-bold"
        >
          Seed Identity
        </button>

        <p className="text-center text-xs text-gray-500 select-none">
          Already synced?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-emerald-400 hover:underline bg-transparent"
          >
            Awaken Core
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

      <div className="mt-8 text-xs text-gray-600">
        HyphaeOS © 2025 • Mycelial Seed Node
      </div>
    </div>
  );
};

export default MycelialRegisterPanel;
