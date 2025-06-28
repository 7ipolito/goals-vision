"use client";

import { useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { UserFormData, DominantFoot, Position } from "../../../types/user";
import { createUser } from "../../../lib/actions/user.action";
import { UploadButton } from "../../../utils/uploadthing";
import Image from "next/image";

interface PlayerInfoProps {
  onComplete: (data: UserFormData) => void;
  onBack: () => void;
}

interface PlayerData {
  name: string;
  age: string;
  dominantFoot: DominantFoot | "";
  position: Position | "";
  photo: string | null;
}

export function PlayerInfo({ onComplete, onBack }: PlayerInfoProps) {
  const { t } = useTranslation();
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: "",
    age: "",
    dominantFoot: "",
    position: "",
    photo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof PlayerData, value: string) => {
    setPlayerData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (url: string) => {
    setPlayerData((prev) => ({ ...prev, photo: url }));
  };

  const handleSave = async () => {
    if (!isFormValid || !playerData.dominantFoot || !playerData.position)
      return;

    setIsLoading(true);
    setError(null);

    try {
      const userData = {
        name: playerData.name,
        age: parseInt(playerData.age),
        dominantFoot: playerData.dominantFoot,
        position: playerData.position,
        picture: playerData.photo || "",
      };

      const newUser = await createUser(userData);

      if (newUser) {
        onComplete(userData);
      } else {
        setError("Erro ao criar usuário. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      setError("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    playerData.name &&
    playerData.age &&
    playerData.dominantFoot &&
    playerData.position;

  const dominantFootOptions = [
    { value: "right", label: t("playerInfo.form.dominantFootOptions.right") },
    { value: "left", label: t("playerInfo.form.dominantFootOptions.left") },
    { value: "both", label: t("playerInfo.form.dominantFootOptions.both") },
  ];

  const positionOptions = [
    {
      value: "goalkeeper",
      label: t("playerInfo.form.positionOptions.goalkeeper"),
    },
    { value: "defender", label: t("playerInfo.form.positionOptions.defender") },
    {
      value: "midfielder",
      label: t("playerInfo.form.positionOptions.midfielder"),
    },
    { value: "forward", label: t("playerInfo.form.positionOptions.forward") },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("playerInfo.title")}
          </h1>
          <p className="text-xl text-gray-300">{t("playerInfo.subtitle")}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Photo Upload Section */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">
                {t("playerInfo.photo")}
              </h3>

              <div className="relative">
                <div className="w-48 h-48 mx-auto bg-white/5 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center mb-4">
                  {playerData.photo ? (
                    <div className="text-center">
                      <Image
                        src={playerData.photo}
                        alt="Foto do perfil"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2 text-gray-400">📸</div>
                      <p className="text-gray-400 text-sm">Nenhuma foto</p>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <UploadButton
                    endpoint="profilePictureUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        handlePhotoUpload(res[0].url);
                      }
                    }}
                    onUploadError={(error: Error) => {
                      console.error("Erro no upload:", error);
                      setError(
                        "Erro ao fazer upload da foto. Tente novamente."
                      );
                    }}
                    appearance={{
                      button:
                        "w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg transition-all duration-200",
                      allowedContent: "text-gray-300 text-sm mt-2",
                    }}
                    content={{
                      button: playerData.photo
                        ? t("playerInfo.changePhoto")
                        : t("playerInfo.uploadPhoto"),
                      allowedContent: "Imagem até 4MB",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-white font-medium mb-2">
                  {t("playerInfo.form.name")}
                </label>
                <input
                  type="text"
                  value={playerData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("playerInfo.form.namePlaceholder")}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Idade */}
              <div>
                <label className="block text-white font-medium mb-2">
                  {t("playerInfo.form.age")}
                </label>
                <input
                  type="number"
                  value={playerData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder={t("playerInfo.form.agePlaceholder")}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Pé Dominante */}
              <div>
                <label className="block text-white font-medium mb-2">
                  {t("playerInfo.form.dominantFoot")}
                </label>
                <select
                  value={playerData.dominantFoot}
                  onChange={(e) =>
                    handleInputChange("dominantFoot", e.target.value)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" className="bg-gray-800">
                    Selecione...
                  </option>
                  {dominantFootOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-gray-800"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Posição */}
              <div>
                <label className="block text-white font-medium mb-2">
                  {t("playerInfo.form.position")}
                </label>
                <select
                  value={playerData.position}
                  onChange={(e) =>
                    handleInputChange("position", e.target.value)
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" className="bg-gray-800">
                    Selecione...
                  </option>
                  {positionOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-gray-800"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 py-3 px-6 border border-white/20 rounded-lg text-white font-medium hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← {t("playerInfo.back")}
          </button>

          <button
            onClick={handleSave}
            disabled={!isFormValid || isLoading}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-300 ${
              isFormValid && !isLoading
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 text-white"
                : "bg-gray-600 cursor-not-allowed text-gray-400"
            }`}
          >
            {isLoading ? "Salvando..." : `${t("playerInfo.save")} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
