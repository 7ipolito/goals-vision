"use client";

import { useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { LanguageSelector } from "../../Home/components/LanguageSelector";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const userName = "Coach"; // This should come from authentication context

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-xl">⚽</span>
              </div>
              <span className="text-white font-bold text-lg">GOALS VISION</span>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {t("dashboard.navigation.dashboard")}
              </button>
              <Link
                href="/chat"
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                {t("chat.title")}
              </Link>
            </nav>

            {/* User Info and Language */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-300">
                  {t("dashboard.userGreeting")}
                </span>
                <span className="text-white font-bold">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === "dashboard" ? (
          children
        ) : (
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              {t("dashboard.navigation.yourVideos")}
            </h2>
            <p className="text-gray-300">
              Seção de vídeos em desenvolvimento...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
