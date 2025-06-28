"use client";

import { useTranslation } from "../../../hooks/useTranslation";
import Image from "next/image";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className={`text-center px-4 py-8 md:py-16 ${className}`}>
      <div className="flex justify-center mb-6">
        <Image
          src="/logo.png"
          alt="GoalVision"
          width={64}
          height={64}
          className="h-12 md:h-16 w-auto"
          priority
        />
      </div>
      <p className="text-base md:text-xl text-gray-200 mb-6 md:mb-8 max-w-sm md:max-w-2xl mx-auto whitespace-pre-line">
        {t("header.subtitle")}
      </p>
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-gray-300">
        <div className="flex items-center gap-2 w-full md:w-auto justify-center bg-white/5 p-3 md:p-0 md:bg-transparent rounded-lg">
          <span className="text-xl md:text-2xl">📊</span>
          <span className="text-sm">{t("header.features.analytics")}</span>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-center bg-white/5 p-3 md:p-0 md:bg-transparent rounded-lg">
          <span className="text-xl md:text-2xl">⚽</span>
          <span className="text-sm">{t("header.features.performance")}</span>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-center bg-white/5 p-3 md:p-0 md:bg-transparent rounded-lg">
          <span className="text-xl md:text-2xl">🏆</span>
          <span className="text-sm">{t("header.features.strategies")}</span>
        </div>
      </div>
    </header>
  );
}
