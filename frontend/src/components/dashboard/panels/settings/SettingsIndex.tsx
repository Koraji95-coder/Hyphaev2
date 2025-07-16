// src/components/dashboard/panels/settings/SettingsIndex.tsx

import React, { useState } from "react";
import ProfileSettings from "./ProfileSettings";
// import NotificationSettings from "./NotificationSettings"; // if you have more settings panels

const SETTINGS = [
  { key: "profile", label: "Profile" },
  // { key: "notifications", label: "Notifications" },
  // Add more panels here as you build them
];

export default function SettingsIndex() {
  const [active, setActive] = useState("profile");

  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-black/90 border-r border-gray-800 py-8 px-2 flex flex-col">
        <h2 className="text-white text-xl font-bold px-2 mb-6">Settings</h2>
        <nav className="space-y-2">
          {SETTINGS.map((tab) => (
            <button
              key={tab.key}
              className={`w-full text-left px-4 py-2 rounded ${
                active === tab.key
                  ? "bg-cyan-800 text-white font-semibold"
                  : "text-cyan-400 hover:bg-gray-800"
              }`}
              onClick={() => setActive(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 bg-[#10131a] px-8 py-10 overflow-auto min-h-screen">
        {active === "profile" && <ProfileSettings />}
        {/* {active === "notifications" && <NotificationSettings />} */}
        {/* Add more panels as your settings expand */}
      </main>
    </div>
  );
}
