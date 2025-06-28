import { useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import Image from "next/image";

interface PlayerIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerId: string) => void;
}

export function PlayerIdModal({
  isOpen,
  onClose,
  onSubmit,
}: PlayerIdModalProps) {
  const { t } = useTranslation();
  const [playerId, setPlayerId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerId.trim()) {
      onSubmit(playerId.trim());
      setPlayerId("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-4xl w-full mx-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Preview Image Section */}
          <div className="hidden md:block relative rounded-lg overflow-hidden">
            <Image
              src="/players_preview_3.jpg"
              alt="Players Preview"
              width={500}
              height={300}
              className="object-cover w-full h-full"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
              <p className="text-white text-sm">
                {t("playerIdModal.previewText") ||
                  "Visualize a análise detalhada do desempenho do jogador"}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("playerIdModal.title") || "Identificação do Jogador"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="playerId"
                  className="block text-white font-medium mb-2"
                >
                  {t("playerIdModal.inputLabel") || "ID do Jogador"}
                </label>
                <input
                  type="text"
                  id="playerId"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={
                    t("playerIdModal.inputPlaceholder") ||
                    "Digite o ID do jogador"
                  }
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-6 border border-white/20 rounded-lg text-white font-medium hover:bg-white/10 transition-all duration-200"
                >
                  {t("playerIdModal.cancel") || "Cancelar"}
                </button>
                <button
                  type="submit"
                  disabled={!playerId.trim()}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-200 ${
                    playerId.trim()
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                      : "bg-gray-600 cursor-not-allowed text-gray-400"
                  }`}
                >
                  {t("playerIdModal.analyze") || "Analisar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
