// components/auth/PinAuthVault.tsx
import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Shield, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ParticleBackground from "../ui/ParticleBackground";


interface PinAuthVaultProps {
  onSuccess: () => void;
  onBack: () => void;
}

const PinAuthVault: React.FC<PinAuthVaultProps> = ({ onSuccess, onBack }) => {
  const { verifyPin, user } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const PIN_LENGTH = 4;

  // 🔐 ESC to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onBack]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, PIN_LENGTH);
    setPin(value);
    setError("");
  };

  const handleVerify = async () => {
    if (pin.length !== PIN_LENGTH) {
      setError(`PIN must be ${PIN_LENGTH} digits`);
      return;
    }

    setIsVerifying(true);
    const success = await verifyPin(pin);
    if (success) {
      setIsVerified(true);
      setTimeout(() => {
        onSuccess(); // 🚀 route to dashboard
      }, 1000);
    } else {
      setError("Invalid PIN");
      setPin("");
    }
    setIsVerifying(false);
  };

  // Tell TS “this object is a Variants”
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

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <ParticleBackground />

      {/* ✖ Backdrop click closes modal */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onBack} />

      <motion.div
        className="relative w-full max-w-md p-8 rounded-2xl bg-dark-200/80 backdrop-blur-md border border-dark-100/30 shadow-xl z-10"
        variants={itemVariants}
      >
        {/* 🔙 Back button */}
        <motion.button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-dark-100/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </motion.button>

        {/* ❌ Close button (top-right) */}
        <motion.button
          onClick={onBack}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-dark-100/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-5 h-5 text-gray-400" />
        </motion.button>

        <motion.div className="text-center mb-8" variants={itemVariants}>
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

        <motion.div className="mb-6 space-y-4" variants={itemVariants}>
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
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={handleChange}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-dark-300 border-2 border-hyphae-500/20 rounded-lg focus:border-hyphae-500 focus:outline-none transition-colors"
                placeholder="• • • •"
                disabled={isVerifying || isVerified}
                data-testid="pin-input"
                aria-label="PIN Input"
              />

              {/* Dot indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{
                      scale: pin[i] ? 1 : 0.5,
                      backgroundColor: pin[i]
                        ? "rgb(var(--color-hyphae-500))"
                        : "rgb(var(--color-dark-400))",
                    }}
                  />
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

        <motion.div className="mt-6" variants={itemVariants}>
          <button
            type="button"
            onClick={handleVerify}
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
      </motion.div>
    </motion.div>
  );
};

export default PinAuthVault;
