"use client";

import { useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { UploadButton } from "../../../utils/uploadthing";
import { PlayerIdModal } from "./PlayerIdModal";
import { useRouter } from "next/navigation";

interface VideoData {
  highlights: {
    video1: { uploaded: boolean; url?: string };
    video2: { uploaded: boolean; url?: string };
  };
  gingado: {
    video1: { uploaded: boolean; url?: string };
    video2: { uploaded: boolean; url?: string };
  };
}

export function VideoUpload() {
  const { t } = useTranslation();
  const router = useRouter();
  const [videoData, setVideoData] = useState<VideoData>({
    highlights: {
      video1: { uploaded: false },
      video2: { uploaded: false },
    },
    gingado: {
      video1: { uploaded: false },
      video2: { uploaded: false },
    },
  });
  const [isUploading, setIsUploading] = useState<{
    video1: boolean;
  }>({
    video1: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVideoUpload = (
    category: "highlights" | "gingado",
    videoNumber: "video1" | "video2",
    url: string
  ) => {
    setVideoData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [videoNumber]: { uploaded: true, url },
      },
    }));
  };

  const handleNextStepClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handlePlayerIdSubmit = (playerId: string) => {
    const videoUrl = videoData.highlights.video1.url;
    if (videoUrl) {
      const demoUrl = `/gingado-demo.html?video=${encodeURIComponent(
        videoUrl
      )}&playerId=${encodeURIComponent(
        playerId
      )}&maxDistance=31.2&avgSpeed=130.6`;
      window.open(demoUrl, "_blank");

      setIsModalOpen(false);

      setTimeout(() => {
        router.push("/player/1");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("videoUpload.title")}
          </h1>
          <p className="text-xl text-gray-300">{t("videoUpload.subtitle")}</p>
        </div>

        <div className="space-y-12">
          {/* Melhores Momentos Section */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <span className="text-4xl">⚽</span>
                {t("videoUpload.categories.highlights.title")}
              </h2>
              <p className="text-gray-300 mb-2">
                {t("videoUpload.categories.highlights.subtitle")}
              </p>
              <p className="text-sm text-gray-400">
                {t("videoUpload.requirements.highlights")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Highlight Video 1 */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t("videoUpload.categories.highlights.video1")}
                </h3>

                <div className="relative">
                  <div className="w-full h-48 bg-green-500/5 border-2 border-dashed border-green-500/30 rounded-lg flex items-center justify-center mb-4">
                    {videoData.highlights.video1.uploaded ? (
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎥</div>
                        <p className="text-white text-sm">
                          {t("videoUpload.videoUploaded")}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl mb-2 text-gray-400">📹</div>
                        <p className="text-gray-400 text-sm">
                          {t("videoUpload.noVideo")}
                        </p>
                      </div>
                    )}
                  </div>

                  <UploadButton
                    endpoint="highlightVideoUploader"
                    onUploadBegin={() => {
                      setIsUploading((prev) => ({ ...prev, video1: true }));
                    }}
                    onClientUploadComplete={(res) => {
                      console.log("Files: ", res);
                      setIsUploading((prev) => ({ ...prev, video1: false }));
                      if (res?.[0]?.url) {
                        handleVideoUpload("highlights", "video1", res[0].url);
                      }
                    }}
                    onUploadError={(error: Error) => {
                      setIsUploading((prev) => ({ ...prev, video1: false }));
                      alert(`ERROR! ${error.message}`);
                    }}
                    appearance={{
                      button:
                        "w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50",
                      allowedContent: "sr-only",
                      container: "w-full [&>div:last-child]:hidden",
                    }}
                    content={{
                      button: isUploading.video1
                        ? "Loading..."
                        : videoData.highlights.video1.uploaded
                        ? "Change Video"
                        : "Upload Video",
                    }}
                  />
                </div>
              </div>

              {/* Highlight Video 2 - Permanently Disabled */}
              <div className="text-center opacity-50 pointer-events-none">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t("videoUpload.categories.highlights.video2")}
                </h3>

                <div className="relative">
                  <div className="w-full h-48 bg-green-500/5 border-2 border-dashed border-green-500/30 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2 text-gray-500">🔒</div>
                      <p className="text-gray-500 text-sm">
                        {t("videoUpload.comingSoon") || "Coming Soon"}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full bg-gray-600 text-gray-400 py-3 px-4 rounded-lg cursor-not-allowed"
                  >
                    {t("videoUpload.unavailable") || "Unavailable"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Next Step Button */}
          <div className="flex justify-center">
            <button
              onClick={handleNextStepClick}
              disabled={!videoData.highlights.video1.uploaded}
              className={`group py-4 px-8 rounded-lg font-bold text-xl transition-all duration-200 shadow-lg ${
                videoData.highlights.video1.uploaded
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {videoData.highlights.video1.uploaded ? "🤖" : "🔒"}
                </span>
                {videoData.highlights.video1.uploaded
                  ? t("videoUpload.analyzeVideo") || "Analyze Video with A.I"
                  : t("videoUpload.uploadFirst") || "Upload a video first"}
              </div>
            </button>
          </div>
        </div>
      </div>

      <PlayerIdModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handlePlayerIdSubmit}
      />
    </div>
  );
}
