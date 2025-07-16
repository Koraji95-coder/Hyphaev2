// src/components/dashboard/panels/settings/ProfileSettings.tsx

import React, { useState, useEffect } from "react";
import { useAuth, AxiosErrorLike } from "@/hooks/useAuth";
import MycoCoreEventBus from "@/agents/mycocore/eventBus";
import InlineEditField from "@/components/InlineEditField";
import Button from "@/components/ui/Button";

type EditingField = "username" | "email" | "password" | "pin" | null;

// Strongly type log event keys for MycoCoreEventType
const emit = (type: "auth_success" | "auth_error" | "username" | "email" | "password" | "pin", message: string) => {
  MycoCoreEventBus.emit({
    type,
    message,
    timestamp: new Date().toISOString(),
  });
};

export default function ProfileSettings() {
  const {
    user,
    refreshUser,
    changeUsername,
    changeEmail,
    changePassword,
    changePin,
    cancelPendingEmail,
  } = useAuth();
  const [editing, setEditing] = useState<EditingField>(null);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");

  // Listen for email verification from other tabs
  useEffect(() => {
    const channel = new BroadcastChannel("emailVerified");
    const handler = (ev: MessageEvent) => {
      if (ev.data === "verified") {
        emit("email", "Email updated successfully.");
        emit("auth_success", "✅ Email updated.");
        refreshUser(true).catch(() => {});
      }
    };
    channel.addEventListener("message", handler);
    return () => {
      channel.removeEventListener("message", handler);
      channel.close();
    };
  }, [refreshUser]);

  // --- Username ---
    const handleUsernameSave = async (newUsername: string) => {
        const clean = newUsername.trim();
        if (!clean || clean === user?.username) {
            emit("auth_error", "That is already your current username.");
            setEditing(null);
            return;
        }
        try {
            await changeUsername(clean);
            const msg = `✅ Username changed to ${clean}`;
            emit("username", msg);
            await refreshUser(true);
        } catch (err) {
            let msg = "Username update failed";
            const axiosErr = err as AxiosErrorLike;
            if (axiosErr.response?.status === 400) {
                if (axiosErr.response.data?.detail === "That is already your current username")
                    msg = "That is already your current username.";
                else if (axiosErr.response.data?.detail === "Username already taken")
                    msg = "Username already taken.";
                else if (axiosErr.response.data?.detail)
                    msg = axiosErr.response.data.detail;
            }
            emit("auth_error", msg);
        }
        setEditing(null);
    };



  // --- Email ---
  const handleEmailSave = async (newEmail: string) => {
    try {
      await changeEmail(newEmail);
      emit("email", `Verification email sent to ${newEmail}. Please check your inbox.`);
      emit("auth_success", "✅ Verification email sent to your new address. Please click the link to confirm.");
        await refreshUser(true);
    } catch (err) {
      let msg = "Email update failed";
      const axiosErr = err as AxiosErrorLike;
      if (axiosErr.response?.data?.detail) msg = axiosErr.response.data.detail;
      emit("auth_error", msg);
    }
    setEditing(null);
  };

  // --- Pending email ---
  const handleCancelPending = async () => {
    try {
      await cancelPendingEmail();
      emit("email", "Pending email change cancelled.");
        await refreshUser(true);
    } catch {
      emit("auth_error", "Could not cancel pending email.");
    }
  };

  // --- Password ---
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword(oldPass, newPass);
      emit("password", "Password updated successfully.");
      emit("auth_success", "✅ Password changed.");
        await refreshUser(true);
    } catch {
      emit("auth_error", "Password change failed.");
    }
    setEditing(null);
    setOldPass("");
    setNewPass("");
  };

  // --- PIN ---
  const handlePinSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePin(oldPin, newPin);
      emit("pin", "PIN updated successfully.");
      emit("auth_success", "✅ PIN changed.");
        await refreshUser(true);
    } catch {
      emit("auth_error", "PIN change failed.");
    }
    setEditing(null);
    setOldPin("");
    setNewPin("");
  };

  return (
    <div className="w-full divide-y divide-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
      {/* Username */}
      <div className="grid grid-cols-[1fr,auto] items-center border-b border-gray-700 py-4">
        <div>
          <span className="text-sm font-medium text-gray-400">Username: </span>
          <span className="font-mono text-white">{user?.username}</span>
        </div>
        <div>
          {editing === "username" ? (
            <InlineEditField
              initialValue={user?.username || ""}
              onSave={handleUsernameSave}
              onCancel={() => setEditing(null)}
              placeholder="New username"
            />
          ) : (
            <button
              onClick={() => setEditing("username")}
              className="text-cyan-400 hover:text-cyan-300 focus:outline-none"
            >
              ✎ Edit
            </button>
          )}
        </div>
      </div>
      {/* Email */}
      <div className="grid grid-cols-[1fr,auto] items-center border-b border-gray-700 py-4">
        <div>
          <span className="text-sm font-medium text-gray-400">Email: </span>
          <span className="font-mono text-white">{user?.email}</span>
        </div>
        <div>
          {editing === "email" ? (
            <InlineEditField
              type="email"
              initialValue={user?.pending_email || user?.email || ""}
              onSave={handleEmailSave}
              onCancel={() => setEditing(null)}
              placeholder="New email"
              className="w-[500px] px-4 py-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          ) : (
            <button
              onClick={() => setEditing("email")}
              className="text-cyan-400 hover:text-cyan-300 focus:outline-none"
            >
              ✎ Edit
            </button>
          )}
        </div>
      </div>
      {/* Pending Email */}
      {user?.pending_email && (
        <div className="grid grid-cols-1 items-center py-2 space-y-2">
          <span className="text-sm font-medium text-amber-400">
            Pending email: <span className="font-mono text-amber-400">{user.pending_email}</span>
            <em className="text-xs text-gray-500 ml-2">(check your inbox or edit if incorrect)</em>
          </span>
          <button
            onClick={handleCancelPending}
            className="text-xs text-red-400 hover:text-red-300 underline w-fit"
          >
            ✖ Cancel pending email
          </button>
        </div>
      )}
      {/* Password */}
      <div className="grid grid-cols-[auto,1fr] items-center border-b border-gray-700 py-4">
        <div>
          <span className="text-sm font-medium text-gray-400">Password: </span>
          <span className="font-mono text-white">••••••••</span>
        </div>
        <div>
          {editing === "password" ? (
            <form onSubmit={handlePasswordSave} className="flex space-x-2">
              <input
                type="password"
                placeholder="Current"
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
                required
                className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="password"
                placeholder="New"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                required
                className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <Button type="submit" variant="primary">Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            </form>
          ) : (
            <button
              onClick={() => setEditing("password")}
              className="text-cyan-400 hover:text-cyan-300 focus:outline-none"
            >
              ✎ Change
            </button>
          )}
        </div>
      </div>
      {/* PIN */}
      <div className="grid grid-cols-[1fr,auto] items-center border-b border-gray-700 py-4">
        <div>
          <span className="text-sm font-medium text-gray-400">PIN: </span>
          <span className="font-mono text-white">••••</span>
        </div>
        <div>
          {editing === "pin" ? (
            <form onSubmit={handlePinSave} className="flex space-x-2">
              <input
                type="password"
                placeholder="Current"
                value={oldPin}
                onChange={e => setOldPin(e.target.value)}
                required
                className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="password"
                placeholder="New"
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                required
                className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <Button type="submit" variant="primary">Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            </form>
          ) : (
            <button
              onClick={() => setEditing("pin")}
              className="text-cyan-400 hover:text-cyan-300 focus:outline-none"
            >
              ✎ Change
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
