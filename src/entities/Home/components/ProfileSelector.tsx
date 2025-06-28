"use client";

import { useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { useTranslation } from "../../../hooks/useTranslation";

interface Profile {
  id: string;
  gradient: string;
}

interface ProfileSelectorProps {
  onContinue: (profileId: string) => void;
}

const profiles: Profile[] = [
  {
    id: "player",
    gradient: "bg-gradient-to-br from-green-500/80 to-emerald-600/80",
  },
  {
    id: "coach",
    gradient: "bg-gradient-to-br from-blue-500/80 to-indigo-600/80",
  },
];

export function ProfileSelector({ onContinue }: ProfileSelectorProps) {
  const [selectedProfile, setSelectedProfile] = useState<string>("player");
  const { t } = useTranslation();

  const handleContinue = () => {
    onContinue(selectedProfile);
  };

  const getProfileData = (profileId: string) => {
    return {
      title: t(`profileSelector.profiles.${profileId}.title`),
      description: t(`profileSelector.profiles.${profileId}.description`),
      features: [
        t(`profileSelector.profiles.${profileId}.features.0`),
        t(`profileSelector.profiles.${profileId}.features.1`),
        t(`profileSelector.profiles.${profileId}.features.2`),
        t(`profileSelector.profiles.${profileId}.features.3`),
      ],
      icon: profileId === "player" ? "⚽" : "📋",
    };
  };

  return (
    <section className="px-4 py-8 md:py-16">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
          {t("profileSelector.title")}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-sm md:max-w-2xl mx-auto">
          {t("profileSelector.subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-8 max-w-xs md:max-w-6xl mx-auto mb-8 md:mb-12">
        {profiles.map((profile) => {
          const profileData = getProfileData(profile.id);
          return (
            <ProfileCard
              key={profile.id}
              title={profileData.title}
              description={profileData.description}
              icon={profileData.icon}
              features={profileData.features}
              gradient={profile.gradient}
              isSelected={selectedProfile === profile.id}
              onClick={() => setSelectedProfile(profile.id)}
              selectedText={t("profileSelector.selectedProfile")}
            />
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={handleContinue}
          className="bg-[#1B5E43] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 text-base md:text-lg w-full md:w-auto"
        >
          {t("profileSelector.continueButton")}{" "}
          {getProfileData(selectedProfile).title}
        </button>
      </div>
    </section>
  );
}
