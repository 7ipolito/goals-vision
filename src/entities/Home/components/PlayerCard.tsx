"use client";

import { useTranslation } from "../../../hooks/useTranslation";

interface PlayerCardProps {
  className?: string;
}

export function PlayerCard({ className = "" }: PlayerCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`w-full max-w-[300px] aspect-[240/340] bg-gradient-to-br from-[#EFE47C] to-[#B6A853] rounded-2xl p-4 relative overflow-hidden ${className}`}
    >
      {/* Rating and Position */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-4xl font-bold">??</div>
        <div className="text-xl font-bold">
          {t("completed.playerCard.position")}
        </div>
      </div>

      {/* Nation Flag and Club Logo */}
      <div className="flex gap-2 mb-2">
        <div className="w-8 h-6 bg-white/20 rounded"></div>
        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
      </div>

      {/* Player Image */}
      <div className="w-48 h-48 mx-auto mb-4 bg-white/20 rounded-lg"></div>

      {/* Player Name */}
      <div className="text-center text-xl font-bold mb-4">
        {t("completed.playerCard.defaultName")}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className="flex justify-between">
          <span>{t("completed.playerCard.stats.vel")}</span>
          <span className="font-bold">??</span>
        </div>
        <div className="flex justify-between">
          <span>{t("completed.playerCard.stats.dri")}</span>
          <span className="font-bold">??</span>
        </div>
        <div className="flex justify-between">
          <span>{t("completed.playerCard.stats.tir")}</span>
          <span className="font-bold">??</span>
        </div>
        <div className="flex justify-between">
          <span>{t("completed.playerCard.stats.dif")}</span>
          <span className="font-bold">??</span>
        </div>
        <div className="flex justify-between">
          <span>{t("completed.playerCard.stats.pas")}</span>
          <span className="font-bold">??</span>
        </div>
        <div className="flex justify-between">
          <span>{t("completed.playerCard.stats.fis")}</span>
          <span className="font-bold">??</span>
        </div>
      </div>

      {/* Card Bottom */}
      <div className="absolute bottom-2 right-2 opacity-50">
        <span className="text-xs">GOALS VISION</span>
      </div>
    </div>
  );
}
