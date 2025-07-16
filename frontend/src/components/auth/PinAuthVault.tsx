// src/components/auth/PinAuthVault.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Shield, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PinAuthVaultProps {
  onSuccess: () => void;
  onBack: () => void;
}

const PIN_LENGTH = 4;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, staggerChildren: 0.1 },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const PinAuthVault: React.FC<PinAuthVaultProps> = ({ onSuccess, onBack }) => {
  const { verifyPin, user } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "🔒 Vault access protocol initiated...",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Initialize greeting when user loads
  useEffect(() => {
    if (user?.username) {
      setTerminalLines([
        "🔒 Vault access protocol initiated...",
        `Hello, ${user.username}! Please enter your PIN:`,
      ]);
    }
  }, [user]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onBack();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  // Focus input when PIN cleared or mounted
  useEffect(() => inputRef.current?.focus(), [pin]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight });
  }, [terminalLines]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(val);
    setError("");
    if (val.length === PIN_LENGTH) {
      // slight delay before auto-verify
      setTimeout(() => handleVerify(val), 80);
    }
  };

  const handleVerify = async (enteredPin?: string) => {
    const code = enteredPin ?? pin;
    if (code.length !== PIN_LENGTH) {
      setError(`PIN must be ${PIN_LENGTH} digits`);
      setTerminalLines(prev => [...prev, `❌ PIN must be ${PIN_LENGTH} digits.`]);
      return;
    }

    setIsVerifying(true);
    setTerminalLines(prev => [...prev, "⏳ Verifying PIN..."]);

    try {
      const success = await verifyPin(code);
      if (success) {
        setIsVerified(true);
        setTerminalLines(prev => [...prev, "✅ Access granted! Welcome."]);
        setTimeout(onSuccess, 900);
      } else {
        // Fallback if verifyPin returns false
        throw new Error("Invalid PIN");
      }
    } catch {
      // On error or invalid pin, allow retry
      setError("Invalid PIN");
      setTerminalLines(prev => [...prev, "❌ Invalid PIN. Please try again."]);
      setPin("");
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <div className="absolute inset-0 bg-black backdrop-blur-md" onClick={onBack} />

      <motion.div
        className="relative w-full max-w-md p-8 rounded-2xl bg-black/90 border border-dark-100/40 shadow-xl z-10 flex flex-col items-center"
        variants={itemVariants}
      >
        {/* Back & Close */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-dark-100/50 text-gray-400"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={onBack}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-dark-100/50 text-gray-400"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Icon & Title */}
        <motion.div className="text-center mb-6" variants={itemVariants}>
          <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-full ${isVerified ? 'bg-success-500/20' : 'bg-secondary-500/20'}`}>   
            {isVerified
              ? <ShieldCheck size={32} className="text-success-400" />
              : <Shield size={32} className="text-secondary-400" />
            }
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">PinAuth Vault</h1>
          <p className="text-gray-400 text-sm">
            Welcome back, <span className="text-secondary-300">{user?.username}</span>
          </p>
        </motion.div>

        {/* PIN Entry */}
        <motion.div className="w-full space-y-4 mb-4" variants={itemVariants}>
          <p className="text-center text-gray-300">Enter your 4-digit security PIN</p>
          {/* Hidden actual input */}
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
            value={pin}
            onChange={handleChange}
          />
          {/* Visual circles */}
          <div className="flex justify-center gap-3 cursor-pointer" onClick={() => inputRef.current?.focus()}>
            {Array.from({ length: PIN_LENGTH }).map((_, idx) => {
              const filled = !!pin[idx];
              return (
                <div
                  key={idx}
                  className={
                    `w-10 h-10 border-2 rounded-md flex items-center justify-center transition-colors
                    ${filled ? 'bg-hyphae-500 border-hyphae-500 text-white' : 'bg-transparent border-gray-600'}`
                  }
                >
                  {filled && '•'}
                </div>
              );
            })}
          </div>
          {error && <p role="alert" className="text-fungal-300 text-center text-sm">{error}</p>}
        </motion.div>

        {/* Verify Button */}
        <motion.div className="w-full mt-2" variants={itemVariants}>
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || pin.length !== PIN_LENGTH || isVerified}
            className={
              `w-full py-3 rounded-lg font-medium transition-colors
              ${isVerified ? 'bg-success-500/50' : isVerifying ? 'bg-hyphae-500/50' : 'bg-hyphae-500 hover:bg-hyphae-600'}
              disabled:opacity-50 disabled:cursor-not-allowed`
            }
          >
            {isVerifying ? 'Verifying…' : isVerified ? 'Authenticated' : 'Verify PIN'}
          </button>
        </motion.div>

        {/* Terminal Output */}
        <div
          ref={terminalRef}
          className="mt-6 w-full bg-black/90 border border-hyphae-800 text-green-300 rounded-lg px-4 py-3 text-xs font-mono max-h-32 overflow-y-auto"
        >
          {terminalLines.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PinAuthVault;
