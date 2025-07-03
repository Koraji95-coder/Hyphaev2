// src/components/auth/PinSettings.tsx

import React, { useState } from "react";
import Button from "@/components/ui/Button";

interface PinSettingsProps {
  onSuccess?: () => void;
}

const PinSettings: React.FC<PinSettingsProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 4 || confirmPin.length !== 4) {
      setStatus("PIN must be 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setStatus("PINs do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/set_pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("hyphae_token")}`,
        },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.detail || "Failed to set PIN.");
      } else {
        setStatus("✅ PIN successfully set.");
        setPin("");
        setConfirmPin("");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Set PIN error:", error);
      setStatus("❌ Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-dark-400 rounded-lg border border-dark-200">
      <h2 className="text-xl font-semibold text-white mb-4">Set Your PIN</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          maxLength={4}
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-4 py-2 bg-dark-300 text-white rounded border border-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="password"
          maxLength={4}
          placeholder="Confirm PIN"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          className="w-full px-4 py-2 bg-dark-300 text-white rounded border border-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Setting PIN..." : "Set PIN"}
        </Button>

        {status && (
          <p className="text-sm text-gray-400 mt-2 text-center">{status}</p>
        )}
      </form>
    </div>
  );
};

export default PinSettings;
