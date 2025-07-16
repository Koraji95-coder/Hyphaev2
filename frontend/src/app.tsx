// src/app.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Public panels
import MycelialLoginPanel from "@/components/auth/MycelialLoginPanel";
import MycelialRegisterPanel from "@/components/auth/MycelialRegisterPanel";
import ForgotPasswordPanel from "@/components/auth/ForgotPasswordPanel";
import EmailVerificationPanel from "@/components/auth/EmailVerificationPanel";
import EmailChangeVerificationPanel from "@/components/auth/EmailChangeVerificationPanel";
import ResetPasswordPanel from "@/components/auth/ResetPasswordPanel";


// Private panels & layouts
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";
import MycoCore from "@/agents/mycocore/Mycocore";
import Neuroweave from "@/agents/Neuroweave";
import Rootbloom from "@/agents/Rootbloom";
import Sporelink from "@/agents/Sporelink";
import MemoryVault from "@/components/dashboard/panels/MemoryVault";
import Settings from "@/components/dashboard/panels/settings/SettingsIndex";
import FancyLoginPreview from "@/pages/FancyLoginPreview";
import { PinAuthGate } from "@/components/auth/PinAuthGate";

// Browser reload debug
window.addEventListener("beforeunload", () => {
  console.log("[DEBUG] BROWSER RELOAD: beforeunload fired");
});

// Login handler for redirect after login
function LoginRoute() {
  const navigate = useNavigate();
  return (
    <MycelialLoginPanel onSuccess={() => navigate("/dashboard", { replace: true })} />
  );
}

export default function App() {
  React.useEffect(() => {
    console.log("[DEBUG] App mounted");
    return () => {
      console.log("[DEBUG] App unmounted");
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Navigate to="/login" replace />} />
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/login-preview" element={<FancyLoginPreview />} />
          <Route path="/register" element={<MycelialRegisterPanel />} />
          <Route path="/forgot-password" element={<ForgotPasswordPanel />} />
          <Route path="/reset-password" element={<ResetPasswordPanel />} />
          <Route path="/verify-email" element={<EmailVerificationPanel />} />
          <Route path="/verify-email-change" element={<EmailChangeVerificationPanel />} />

          {/* PRIVATE ROUTES: always under DashboardLayout */}
          <Route
            path="/"
            element={
              <DashboardLayout __debug="static">
                <Outlet />
              </DashboardLayout>
            }
          >
            <Route
              element={
                <PinAuthGate>
                  <Outlet />
                </PinAuthGate>
              }
            >
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="mycocore" element={<MycoCore />} />
              <Route path="neuroweave" element={<Neuroweave />} />
              <Route path="rootbloom" element={<Rootbloom />} />
              <Route path="sporelink" element={<Sporelink />} />
              <Route path="memory" element={<MemoryVault />} />
              <Route path="settings" element={<Settings />} />
              {/* Default to dashboard for unknown paths */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
