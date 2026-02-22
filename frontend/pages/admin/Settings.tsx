import React, { useState } from "react";

const themes = ["Light", "Dark", "Orange"] as const;

type ThemeMode = (typeof themes)[number];

const AdminSettings = () => {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem("admin-theme-mode") as ThemeMode) || "Light");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-admin-theme", mode.toLowerCase());
  }, [mode]);

  const applyTheme = (value: ThemeMode) => {
    setMode(value);
    localStorage.setItem("admin-theme-mode", value);
    document.documentElement.setAttribute("data-admin-theme", value.toLowerCase());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Theme mode preferences for admin panel.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Theme Mode</h2>
        <div className="flex flex-wrap gap-3">
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => applyTheme(theme)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                mode === theme
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
