// src/components/auth/PinAuthGate.tsx
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import PinAuthVault from "./PinAuthVault";

export const PinAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, pinVerified, loading, logout } = useAuth();

  // Show loading state
  if (loading) return <div className="text-white">Loading...</div>;

  // If not authenticated, bounce to /login (never show dashboard)
  if (!user) return <Navigate to="/login" replace />;

  // If authenticated, but PIN not verified, require PIN gate
  if (!pinVerified) {
    return (
      <PinAuthVault
        onSuccess={() => {
          // no-op; the context will update pinVerified,
          // so PinAuthGate will re-render and allow children.
        }}
        onBack={logout}
      />
    );
  }

  // Auth & PIN verified: unlock child route
  return <>{children}</>;
};
