// src/App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import PrivateRoute from "@/routes/PrivateRoute";

// public
import MycelialLoginPanel      from "@/components/auth/MycelialLoginPanel";
import MycelialRegisterPanel   from "@/components/auth/MycelialRegisterPanel";
import ForgotPasswordPanel     from "@/components/auth/ForgotPasswordPanel";
import EmailVerificationPanel  from "@/components/auth/EmailVerificationPanel";
import ResetPasswordPanel      from "@/components/auth/ResetPasswordPanel";

// private
import PinAuthVault            from "@/components/auth/PinAuthVault";
import DashboardLayout         from "@/layouts/DashboardLayout";
import DashboardHome           from "@/components/dashboard/DashboardHome";
import MycoCore                from "@/agents/Mycocore";
import Neuroweave              from "@/agents/Neuroweave";
import Rootbloom               from "@/agents/Rootbloom";
import Sporelink               from "@/agents/Sporelink";
import MemoryVault             from "@/components/dashboard/panels/MemoryVault";
import Settings                from "@/components/dashboard/panels/settings/SettingsIndex";

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <MycelialLoginPanel onSuccess={() => navigate("/dashboard", { replace: true })} />
  );
}

function ProtectedApp() {
  const { user, logout } = useAuth();
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    if (user && !user.pin_verified) {
      setShowPinModal(true);
    }
  }, [user]);

  const handlePinSuccess = () => setShowPinModal(false);
  const handlePinBack    = () => { setShowPinModal(false); logout(); };

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard Home */}
        <Route path="/dashboard" element={
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        } />

        {/* Panels */}
        <Route path="/mycocore" element={
          <DashboardLayout>
            <MycoCore />
          </DashboardLayout>
        } />
        <Route path="/neuroweave" element={
          <DashboardLayout>
            <Neuroweave />
          </DashboardLayout>
        } />
        <Route path="/rootbloom" element={
          <DashboardLayout>
            <Rootbloom />
          </DashboardLayout>
        } />
        <Route path="/sporelink" element={
          <DashboardLayout>
            <Sporelink />
          </DashboardLayout>
        } />
        <Route path="/memory" element={
          <DashboardLayout>
            <MemoryVault />
          </DashboardLayout>
        } />
        <Route path="/settings" element={
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        } />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {showPinModal && (
        <PinAuthVault onSuccess={handlePinSuccess} onBack={handlePinBack} />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* public */}
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<MycelialRegisterPanel />} />
          <Route path="/forgot-password" element={<ForgotPasswordPanel />} />
          <Route path="/reset-password" element={<ResetPasswordPanel />} />
          <Route path="/verify-email" element={<EmailVerificationPanel />} />

          {/* private */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <ProtectedApp />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
