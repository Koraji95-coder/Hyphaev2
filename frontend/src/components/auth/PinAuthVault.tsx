import React, { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Shield, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ParticleBackground from "../ui/ParticleBackground";

interface PinAuthVaultProps {
  onSuccess: () => void;
  onBack: () => void;
}

const PIN_LENGTH = 4;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] },
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

  // ESC to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onBack]);

  // Focus input on mount or when pin is cleared
  useEffect(() => {
    inputRef.current?.focus();
  }, [pin]);

  // Auto scroll terminal to bottom on new line
  const terminalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight });
  }, [terminalLines]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, PIN_LENGTH);
    setPin(value);
    setError("");
    if (value.length === PIN_LENGTH) {
      setTimeout(() => {
        handleVerify(value);
      }, 80);
    }
  };

  const handleVerify = async (checkPin?: string) => {
    const _pin = checkPin ?? pin;
    if (_pin.length !== PIN_LENGTH) {
      setError(`PIN must be ${PIN_LENGTH} digits`);
      setTerminalLines((prev) => [
        ...prev,
        `❌ Invalid attempt: PIN must be ${PIN_LENGTH} digits.`,
      ]);
      return;
    }
    setIsVerifying(true);
    setTerminalLines((prev) => [
      ...prev,
      "⏳ Verifying PIN..."
    ]);
    const success = await verifyPin(_pin);
    if (success) {
      setIsVerified(true);
      setTerminalLines((prev) => [
        ...prev,
        "✅ Access granted! Welcome."
      ]);
      setTimeout(() => {
        onSuccess();
      }, 900);
    } else {
      setError("Invalid PIN");
      setTerminalLines((prev) => [
        ...prev,
        "❌ Invalid PIN. Please try again."
      ]);
      setPin("");
      inputRef.current?.focus();
    }
    setIsVerifying(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <ParticleBackground />
      {/* Click-out to close */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onBack}
      />
      <motion.div
        className="relative w-full max-w-md p-8 rounded-2xl bg-dark-300/80 backdrop-blur-xl border border-dark-100/40 shadow-xl z-10 flex flex-col items-center"
        variants={itemVariants}
      >
        {/* Back/Close Buttons */}
        <motion.button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-dark-100/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </motion.button>
        <motion.button
          onClick={onBack}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-dark-100/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-400" />
        </motion.button>
        <motion.div className="text-center mb-6" variants={itemVariants}>
          <div
            className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full ${
              isVerified ? "bg-success-500/20" : "bg-secondary-500/20"
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="w-8 h-8 text-success-400" />
            ) : (
              <Shield className="w-8 h-8 text-secondary-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            PinAuth Vault
          </h1>
          <p className="text-gray-400 text-sm">
            Welcome back,{" "}
            <span className="text-secondary-300">
              {user?.username || "User"}
            </span>
          </p>
        </motion.div>
        <motion.div className="mb-6 space-y-4 w-full" variants={itemVariants}>
          <p className="text-center text-gray-300">Enter your 4-digit security PIN</p>
          <motion.div
            animate={
              error
                ? {
                    x: [0, -10, 10, -10, 10, 0],
                    transition: { duration: 0.4 },
                  }
                : {}
            }
            className="space-y-4"
          >
            <div className="relative flex flex-col items-center">
              <input
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={pin}
                onChange={handleChange}
                className="w-1 h-1 opacity-0 absolute pointer-events-none"
                maxLength={PIN_LENGTH}
                data-testid="pin-input"
                aria-label="PIN Input"
              />
              <div
                className="flex justify-center gap-4 cursor-pointer"
                onClick={() => inputRef.current?.focus()}
              >
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-6 h-6 rounded-full text-3xl border-2 flex items-center justify-center ${
                      pin[i]
                        ? "bg-hyphae-500 border-hyphae-500 text-white"
                        : "bg-dark-400 border-dark-400"
                    } transition-all`}
                  >
                    {pin[i] ? "•" : ""}
                  </span>
                ))}
              </div>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                role="alert"
                className="text-fungal-300 text-center text-sm"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
        <motion.div className="mt-2 w-full" variants={itemVariants}>
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={isVerifying || pin.length !== PIN_LENGTH || isVerified}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isVerified
                ? "bg-success-500/50"
                : isVerifying
                ? "bg-hyphae-500/50"
                : "bg-hyphae-500 hover:bg-hyphae-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isVerifying ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : isVerified ? (
              "Authenticated"
            ) : (
              "Verify PIN"
            )}
          </button>
        </motion.div>
        {/* Terminal Log Panel */}
        <div
          ref={terminalRef}
          className="mt-6 w-full bg-black/60 border border-hyphae-800 text-green-300 rounded-lg px-4 py-3 text-xs font-mono max-h-32 min-h-[80px] overflow-y-auto"
        >
          {terminalLines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PinAuthVault;
