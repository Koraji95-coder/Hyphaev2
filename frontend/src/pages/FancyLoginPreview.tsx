// src/pages/FancyLoginPreview.tsx
import React from "react";
import FancyNeuralLogin from "@/components/auth/FancyNeuralLogin";

// For demo: we'll just show a toast/alert on "success"
export default function FancyLoginPreview() {
  return (
    <div className="min-h-screen w-full bg-[#0b0f1a] flex flex-col items-center justify-center">
      <FancyNeuralLogin onSuccess={() => alert("✅ Demo: Login succeeded!")} />
    </div>
  );
}
