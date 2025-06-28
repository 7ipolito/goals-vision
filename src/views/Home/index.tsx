"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  Header,
  ProfileSelector,
  PlayerInfo,
  VideoUpload,
  LanguageSelector,
  PlayerCard,
} from "../../entities/Home/components";
import { useTranslation } from "../../hooks/useTranslation";

type Step =
  | "home"
  | "profile-selection"
  | "player-info"
  | "video-upload"
  | "completed";

export function HomeView() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("home");

  const handleProfileContinue = (profileId: string) => {
    if (profileId === "coach") {
      router.push("/dashboard");
    } else {
      setCurrentStep("player-info");
    }
  };

  const handlePlayerInfoComplete = () => {
    setCurrentStep("video-upload");
  };

  const handleBack = () => {
    switch (currentStep) {
      case "player-info":
        setCurrentStep("profile-selection");
        break;
      case "video-upload":
        setCurrentStep("player-info");
        break;
      default:
        setCurrentStep("home");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "home":
        return (
          <>
            <Header />
            <ProfileSelector onContinue={handleProfileContinue} />
          </>
        );

      case "profile-selection":
        return (
          <div className="relative">
            <ProfileSelector onContinue={handleProfileContinue} />
          </div>
        );

      case "player-info":
        return (
          <PlayerInfo
            onComplete={handlePlayerInfoComplete}
            onBack={handleBack}
          />
        );

      case "video-upload":
        return <VideoUpload onBack={handleBack} />;

      case "completed":
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {t("completed.title")}
              </h1>
              <p className="text-xl text-gray-300">{t("completed.subtitle")}</p>
            </div>

            <PlayerCard />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Background>
      <div className="min-h-screen bg-[#1B5E43]">{renderStep()}</div>
    </Background>
  );
}
