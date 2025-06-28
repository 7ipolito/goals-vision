"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "../../../hooks/useTranslation";
import playerData from "../../../data/players.json";
import Image from "next/image";

export default function PlayerPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const player = playerData[playerId as keyof typeof playerData];

  if (!player) {
    return (
      <div className="min-h-screen bg-[#1B5E43] flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("playerCard.notFound.title")}
          </h1>
          <p className="text-xl text-gray-300">
            {t("playerCard.notFound.description").replace("{id}", playerId)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B5E43] flex flex-col items-center justify-center p-4 animate-fadeIn">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 animate-slideDown">
        <button
          onClick={() => router.push("/")}
          className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 hover:shadow-lg active:scale-95 group backdrop-blur-sm border border-white/20"
        >
          <span className="text-lg transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          <span className="transition-all duration-200 group-hover:tracking-wider">
            {t("playerCard.backToHome")}
          </span>
        </button>
      </div>

      {/* Player Card */}
      <div className="w-full max-w-[300px] aspect-[240/340] bg-gradient-to-br from-[#EFE47C] to-[#B6A853] rounded-2xl p-4 relative overflow-hidden transform transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:shadow-yellow-500/25 cursor-pointer group animate-slideUp">
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

        {/* Rating and Position */}
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="text-4xl font-bold transform transition-all duration-300 group-hover:scale-110 group-hover:text-white drop-shadow-lg">
            {player.rating}
          </div>
          <div className="text-xl font-bold transform transition-all duration-300 group-hover:scale-110 group-hover:text-white drop-shadow-lg">
            {player.position}
          </div>
        </div>

        {/* Player Image */}
        <div className="w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden relative z-10 transform transition-all duration-300 group-hover:scale-105">
          <Image
            src={player.image}
            alt={player.name}
            width={192}
            height={192}
            className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110 group-hover:contrast-110"
          />
          {/* Image glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Player Name */}
        <div className="text-center text-xl font-bold mb-4 relative z-10 transform transition-all duration-300 group-hover:scale-105 group-hover:text-white drop-shadow-lg">
          {player.name}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm relative z-10">
          <div className="flex justify-between transform transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:rounded px-1 py-0.5">
            <span className="font-medium">VEL</span>
            <span className="font-bold transition-colors duration-200 hover:text-white">
              {player.stats.vel}
            </span>
          </div>
          <div className="flex justify-between transform transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:rounded px-1 py-0.5">
            <span className="font-medium">DRI</span>
            <span className="font-bold transition-colors duration-200 hover:text-white">
              {player.stats.dri}
            </span>
          </div>
          <div className="flex justify-between transform transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:rounded px-1 py-0.5">
            <span className="font-medium">TIR</span>
            <span className="font-bold transition-colors duration-200 hover:text-white">
              {player.stats.tir}
            </span>
          </div>
          <div className="flex justify-between transform transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:rounded px-1 py-0.5">
            <span className="font-medium">DIF</span>
            <span className="font-bold transition-colors duration-200 hover:text-white">
              {player.stats.dif}
            </span>
          </div>
          <div className="flex justify-between transform transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:rounded px-1 py-0.5">
            <span className="font-medium">PAS</span>
            <span className="font-bold transition-colors duration-200 hover:text-white">
              {player.stats.pas}
            </span>
          </div>
          <div className="flex justify-between transform transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:rounded px-1 py-0.5">
            <span className="font-medium">FIS</span>
            <span className="font-bold transition-colors duration-200 hover:text-white">
              {player.stats.fis}
            </span>
          </div>
        </div>

        {/* Card Bottom - GOALS VISION logo */}
        <div className="absolute bottom-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
          <span className="text-xs font-bold tracking-wider">GOALS VISION</span>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-4 left-4 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200"></div>
          <div className="absolute bottom-12 left-6 w-1 h-1 bg-white rounded-full animate-ping animation-delay-400"></div>
        </div>
      </div>

      {/* Share Button */}
      <div className="mt-8 w-full max-w-[300px] animate-slideUp animation-delay-300">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert(t("playerCard.copied"));
          }}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg active:scale-95 group"
        >
          <span className="text-lg transition-transform duration-200 group-hover:rotate-12">
            🔗
          </span>
          <span className="transition-all duration-200 group-hover:tracking-wider">
            {t("playerCard.share")}
          </span>
        </button>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}
