"use client";

import { useTranslation } from "../../../hooks/useTranslation";
import Image from "next/image";

interface PlayerModalProps {
  player: {
    id: number;
    name: string;
    compatibility: number;
    position: string;
    age: number;
    nationality: string;
    stats: {
      goals?: number;
      assists?: number;
      speed?: number;
      dribbles?: number;
      interceptions?: number;
      passes?: number;
    };
    attributes: Record<string, number>;
    details?: {
      height?: string;
      weight?: string;
      preferredFoot?: string;
      photo?: string;
    };
  };
  onClose: () => void;
}

export function PlayerModal({ player, onClose }: PlayerModalProps) {
  const { t } = useTranslation();

  const getAttributeColor = (value: number) => {
    if (value >= 90) return "text-green-400";
    if (value >= 80) return "text-blue-400";
    if (value >= 70) return "text-yellow-400";
    if (value >= 60) return "text-orange-400";
    return "text-red-400";
  };

  const getAttributeBg = (value: number) => {
    if (value >= 90) return "bg-green-500/20 border-green-500/30";
    if (value >= 80) return "bg-blue-500/20 border-blue-500/30";
    if (value >= 70) return "bg-yellow-500/20 border-yellow-500/30";
    if (value >= 60) return "bg-orange-500/20 border-orange-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const attributeCategories = {
    physical: ["speed", "strength", "stamina", "agility", "jumping"],
    technical: ["passing", "shooting", "dribbling", "crossing", "firstTouch"],
    tactical: [
      "positioning",
      "marking",
      "interceptions",
      "leadership",
      "vision",
    ],
    mental: [
      "concentration",
      "composure",
      "determination",
      "workRate",
      "teamwork",
    ],
  };

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 80) return "text-green-400";
    if (compatibility >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const renderAttributeBar = (attribute: string, value: number) => (
    <div key={attribute} className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white text-sm font-medium">
          {t(`dashboard.playerModal.attributes.${attribute}`)}
        </span>
        <span
          className={`font-bold ${
            attribute === "speed" ? getAttributeColor(value) : "text-gray-500"
          }`}
        >
          {attribute === "speed" ? value : "?"}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        {attribute === "speed" ? (
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              value >= 90
                ? "bg-green-500"
                : value >= 80
                ? "bg-blue-500"
                : value >= 70
                ? "bg-yellow-500"
                : value >= 60
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
            style={{ width: `${value}%` }}
          ></div>
        ) : (
          <div className="h-2 rounded-full bg-gray-600 w-[30%]"></div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-lg border border-white/20 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              {t("dashboard.playerModal.title")}
            </h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Player Info & Photo */}
            <div className="space-y-6">
              {/* Player Photo */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  {player.details?.photo ? (
                    <Image
                      src={player.details.photo}
                      alt={player.name}
                      width={192}
                      height={192}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-4xl">
                      {player.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {player.name}
                </h2>

                {/* Compatibility Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-4 ${getAttributeBg(
                    player.compatibility
                  )}`}
                >
                  <span className="text-white font-medium">
                    {t("dashboard.playerModal.compatibility")}
                  </span>
                  <span
                    className={`font-bold text-lg ${getCompatibilityColor(
                      player.compatibility
                    )}`}
                  >
                    {player.compatibility}%
                  </span>
                </div>

                {/* AI Analysis Badge */}
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-2 text-purple-300">
                    <span className="text-lg">🤖</span>
                    <span className="text-sm font-medium">
                      {t("dashboard.playerModal.aiAnalysis")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Details */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Informações Básicas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {t("dashboard.playerModal.playerInfo.age")}:
                    </span>
                    <span className="text-white font-medium">
                      {player.age} anos
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {t("dashboard.playerModal.playerInfo.position")}:
                    </span>
                    <span className="text-white font-medium">
                      {player.position}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {t("dashboard.playerModal.playerInfo.nationality")}:
                    </span>
                    <span className="text-white font-medium">
                      {player.nationality}
                    </span>
                  </div>
                  {player.details?.height && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        {t("dashboard.playerModal.playerInfo.height")}:
                      </span>
                      <span className="text-white font-medium">
                        {player.details.height}
                      </span>
                    </div>
                  )}
                  {player.details?.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        {t("dashboard.playerModal.playerInfo.weight")}:
                      </span>
                      <span className="text-white font-medium">
                        {player.details.weight}
                      </span>
                    </div>
                  )}
                  {player.details?.preferredFoot && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        {t("dashboard.playerModal.playerInfo.preferredFoot")}:
                      </span>
                      <span className="text-white font-medium">
                        {player.details.preferredFoot}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column - Attributes */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📊</span>
                  <h3 className="text-lg font-bold text-white">
                    {t("dashboard.playerModal.dataGeneratedBy")}
                  </h3>
                </div>

                {Object.entries(attributeCategories).map(
                  ([category, attributes]) => (
                    <div key={category} className="mb-6">
                      <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                        <span className="text-lg">
                          {category === "physical"
                            ? "💪"
                            : category === "technical"
                            ? "⚽"
                            : category === "tactical"
                            ? "🧠"
                            : "💭"}
                        </span>
                        {t(`dashboard.playerModal.${category}Attributes`)}
                      </h4>

                      {attributes.map((attribute) => {
                        const value = player.attributes[attribute];
                        if (value !== undefined) {
                          return renderAttributeBar(attribute, value);
                        }
                        return null;
                      })}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right Column - Videos & Contact */}
            <div className="space-y-6">
              {/* Videos Section */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-lg">🎥</span>
                  {t("dashboard.playerModal.videos")}
                </h3>

                <div className="space-y-4">
                  <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center">
                    <div className="w-full h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">
                        📹 Vídeo de Highlights
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {t("dashboard.playerModal.highlights")} #1
                    </p>
                  </div>

                  <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center">
                    <div className="w-full h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">
                        📹 Vídeo de Highlights
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {t("dashboard.playerModal.highlights")} #2
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-4">
                  Interessado no jogador?
                </h3>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 mb-3">
                  {t("dashboard.playerModal.contact")} 📱
                </button>
                <p className="text-gray-300 text-sm">
                  Entre em contato para negociar a contratação
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all duration-200"
          >
            {t("dashboard.playerModal.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
