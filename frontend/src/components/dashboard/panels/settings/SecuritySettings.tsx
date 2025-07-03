// src/components/dashboard/panels/settings/SecuritySettings.tsx

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";



const SecuritySettings: React.FC = () => {
  const { changePin } = useAuth();

  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await changePin(oldPin, newPin);
    setStatus(success ? "✅ PIN updated" : "❌ Failed to update PIN");
    if (success) {
      setOldPin("");
      setNewPin("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Change PIN</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          <input
            type="password"
            placeholder="Current PIN"
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            className="w-full px-4 py-2 rounded bg-dark-400 text-white border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="password"
            placeholder="New PIN"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            className="w-full px-4 py-2 rounded bg-dark-400 text-white border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button type="submit" variant="primary">
            Update PIN
          </Button>
          {status && <p className="text-sm text-gray-400 mt-2">{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;
