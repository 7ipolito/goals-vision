"use client";

import { useTranslation } from "../../../hooks/useTranslation";

interface PlayerCardProps {
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
  avatar?: string;
  onClick?: () => void;
}

export function PlayerCard({
  name,
  compatibility,
  position,
  age,
  nationality,
  stats,
  avatar,
  onClick,
}: PlayerCardProps) {
  const { t } = useTranslation();

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 80) return "text-green-400";
    if (compatibility >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getCompatibilityBg = (compatibility: number) => {
    if (compatibility >= 80) return "bg-green-500/20 border-green-500/30";
    if (compatibility >= 60) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <div
      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-2xl"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>

          {/* Name and Position */}
          <div>
            <h3 className="text-white font-bold text-lg">{name}</h3>
            <p className="text-gray-300 text-sm">
              {position} • {age} anos • {nationality}
            </p>
          </div>
        </div>
      </div>

      {/* Compatibility */}
      <div
        className={`mb-4 p-3 rounded-lg border ${getCompatibilityBg(
          compatibility
        )}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">
            {t("dashboard.playersInEvaluation.compatibility")}
          </span>
          <span
            className={`font-bold text-lg ${getCompatibilityColor(
              compatibility
            )}`}
          >
            {compatibility}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              compatibility >= 80
                ? "bg-green-500"
                : compatibility >= 60
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${compatibility}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {stats.goals !== undefined && (
          <div className="text-center bg-white/5 rounded-lg p-2">
            <div className="text-white font-bold">{stats.goals}</div>
            <div className="text-gray-400 text-xs">
              {t("dashboard.playerStats.goals")}
            </div>
          </div>
        )}
        {stats.assists !== undefined && (
          <div className="text-center bg-white/5 rounded-lg p-2">
            <div className="text-white font-bold">{stats.assists}</div>
            <div className="text-gray-400 text-xs">
              {t("dashboard.playerStats.assists")}
            </div>
          </div>
        )}
        {stats.speed !== undefined && (
          <div className="text-center bg-white/5 rounded-lg p-2">
            <div className="text-white font-bold">{stats.speed}</div>
            <div className="text-gray-400 text-xs">
              {t("dashboard.playerStats.speed")}
            </div>
          </div>
        )}
        {stats.dribbles !== undefined && (
          <div className="text-center bg-white/5 rounded-lg p-2">
            <div className="text-white font-bold">{stats.dribbles}</div>
            <div className="text-gray-400 text-xs">
              {t("dashboard.playerStats.dribbles")}
            </div>
          </div>
        )}
        {stats.interceptions !== undefined && (
          <div className="text-center bg-white/5 rounded-lg p-2">
            <div className="text-white font-bold">{stats.interceptions}</div>
            <div className="text-gray-400 text-xs">
              {t("dashboard.playerStats.interceptions")}
            </div>
          </div>
        )}
        {stats.passes !== undefined && (
          <div className="text-center bg-white/5 rounded-lg p-2">
            <div className="text-white font-bold">{stats.passes}%</div>
            <div className="text-gray-400 text-xs">
              {t("dashboard.playerStats.passes")}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200">
          {t("dashboard.playersInEvaluation.viewProfile")}
        </button>
        <button className="flex-1 border border-white/20 text-white hover:bg-white/10 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200">
          {t("dashboard.playersInEvaluation.sendMessage")}
        </button>
      </div>
    </div>
  );
}
