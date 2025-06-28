"use client";

import { useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";

interface WizardConfig {
  selectedPositions: string[];
  positionAttributes: Record<string, string[]>;
  attributeWeights: Record<string, number>;
}

interface ConfigurationWizardProps {
  onComplete: (config: WizardConfig) => void;
  onClose: () => void;
}

export function ConfigurationWizard({
  onComplete,
  onClose,
}: ConfigurationWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<WizardConfig>({
    selectedPositions: [],
    positionAttributes: {},
    attributeWeights: {},
  });

  const positions = [
    { id: "goalkeeper", icon: "🥅", key: "goalkeeper", disabled: true },
    { id: "centerBack", icon: "🛡️", key: "centerBack", disabled: true },
    { id: "leftBack", icon: "⬅️", key: "leftBack", disabled: true },
    { id: "rightBack", icon: "➡️", key: "rightBack", disabled: true },
    {
      id: "defensiveMidfielder",
      icon: "🔒",
      key: "defensiveMidfielder",
      disabled: true,
    },
    {
      id: "centralMidfielder",
      icon: "⚽",
      key: "centralMidfielder",
      disabled: true,
    },
    {
      id: "attackingMidfielder",
      icon: "🎯",
      key: "attackingMidfielder",
      disabled: true,
    },
    { id: "leftWinger", icon: "⬅️", key: "leftWinger", disabled: true },
    { id: "rightWinger", icon: "➡️", key: "rightWinger", disabled: true },
    { id: "striker", icon: "⚡", key: "striker", disabled: false },
    { id: "centerForward", icon: "🥅", key: "centerForward", disabled: true },
  ];

  const enabledAttributes = ["speed"];
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

  const handlePositionToggle = (positionId: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedPositions: prev.selectedPositions.includes(positionId)
        ? prev.selectedPositions.filter((p) => p !== positionId)
        : [...prev.selectedPositions, positionId],
    }));
  };

  const handleAttributeToggle = (position: string, attribute: string) => {
    if (!enabledAttributes.includes(attribute)) return;

    setConfig((prev) => {
      const currentAttributes = prev.positionAttributes[position] || [];
      const newAttributes = currentAttributes.includes(attribute)
        ? currentAttributes.filter((a) => a !== attribute)
        : [...currentAttributes, attribute];

      return {
        ...prev,
        positionAttributes: {
          ...prev.positionAttributes,
          [position]: newAttributes,
        },
      };
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return config.selectedPositions.includes("striker");
      case 2:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getAllSelectedAttributes = () => {
    const allAttributes = new Set<string>();
    Object.values(config.positionAttributes).forEach((attributes) => {
      attributes.forEach((attr) => allAttributes.add(attr));
    });
    return Array.from(allAttributes);
  };

  const getWeightColor = (weight: number) => {
    if (weight < 25) return "text-gray-400";
    if (weight < 50) return "text-yellow-400";
    if (weight < 75) return "text-orange-400";
    return "text-red-400";
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {t("dashboard.wizard.step1.title")}
        </h2>
        <p className="text-gray-300">{t("dashboard.wizard.step1.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {positions.map((position) => (
          <div
            key={position.id}
            onClick={() =>
              !position.disabled && handlePositionToggle(position.id)
            }
            className={`p-6 rounded-xl border-2 transition-all duration-200 ${
              position.disabled
                ? "border-gray-700 bg-gray-800/50 text-gray-600 cursor-not-allowed opacity-50"
                : config.selectedPositions.includes(position.id)
                ? "border-green-500 bg-green-500/20 text-white cursor-pointer"
                : "border-white/20 bg-white/10 text-gray-300 hover:border-white/40 hover:bg-white/20 cursor-pointer"
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{position.icon}</div>
              <div className="font-medium text-sm">
                {t(`dashboard.wizard.step1.positions.${position.key}`)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          {t("dashboard.wizard.step1.tooltip")}
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {t("dashboard.wizard.step2.title")}
        </h2>
        <p className="text-gray-300">{t("dashboard.wizard.step2.subtitle")}</p>
      </div>

      <div className="space-y-8">
        {config.selectedPositions.map((positionId) => (
          <div key={positionId} className="bg-white/5 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {t(`dashboard.wizard.step1.positions.${positionId}`)}
            </h3>

            {Object.entries(attributeCategories).map(
              ([category, attributes]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    {t(`dashboard.wizard.step2.attributes.${category}.title`)}
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {attributes.map((attribute) => (
                      <div
                        key={attribute}
                        onClick={() =>
                          handleAttributeToggle(positionId, attribute)
                        }
                        className={`p-3 rounded-lg border transition-all duration-200 group ${
                          !enabledAttributes.includes(attribute)
                            ? "border-gray-700 bg-gray-800/50 text-gray-600 cursor-not-allowed opacity-50"
                            : config.positionAttributes[positionId]?.includes(
                                attribute
                              )
                            ? "border-green-500 bg-green-500/20 text-white cursor-pointer"
                            : "border-white/20 bg-white/10 text-gray-300 hover:border-white/40 cursor-pointer"
                        }`}
                        title={t(
                          `dashboard.wizard.step2.tooltips.${attribute}`
                        )}
                      >
                        <div className="text-sm font-medium">
                          {t(
                            `dashboard.wizard.step2.attributes.${category}.${attribute}`
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {t("dashboard.wizard.step4.title")}
        </h2>
        <p className="text-gray-300">{t("dashboard.wizard.step4.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Selected Positions */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {t("dashboard.wizard.step4.selectedPositions")}
          </h3>
          <div className="space-y-2">
            {config.selectedPositions.map((positionId) => (
              <div key={positionId} className="text-gray-300">
                • {t(`dashboard.wizard.step1.positions.${positionId}`)}
              </div>
            ))}
          </div>
        </div>

        {/* Attribute Summary */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {t("dashboard.wizard.step4.attributeWeights")}
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getAllSelectedAttributes().map((attribute) => {
              const weight = config.attributeWeights[attribute] || 50;
              const category = Object.keys(attributeCategories).find((cat) =>
                attributeCategories[
                  cat as keyof typeof attributeCategories
                ].includes(attribute)
              ) as keyof typeof attributeCategories;

              return (
                <div key={attribute} className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {t(
                      `dashboard.wizard.step2.attributes.${category}.${attribute}`
                    )}
                  </span>
                  <span className={`${getWeightColor(weight)}`}>{weight}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
        <div className="text-center">
          <div className="text-green-300 font-bold text-2xl mb-1">
            {Math.floor(Math.random() * 15) + 5}
          </div>
          <div className="text-green-300 text-sm">
            {t("dashboard.wizard.step4.estimatedMatches")}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-lg border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t("dashboard.wizard.title")}
              </h1>
              <p className="text-gray-300">{t("dashboard.wizard.subtitle")}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            {[1, 2, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step <= currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {step === 4 ? 3 : step}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    step <= currentStep ? "text-white" : "text-gray-400"
                  }`}
                >
                  {t(
                    `dashboard.wizard.steps.${
                      ["positions", "attributes", "review"][
                        step === 4 ? 2 : step - 1
                      ]
                    }`
                  )}
                </span>
                {step < 4 && <div className="w-8 h-px bg-gray-600 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 flex justify-between">
          <button
            onClick={() =>
              setCurrentStep(
                Math.max(1, currentStep === 4 ? 2 : currentStep - 1)
              )
            }
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {t("dashboard.wizard.buttons.previous")}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setConfig({
                  selectedPositions: [],
                  positionAttributes: {},
                  attributeWeights: {},
                });
                setCurrentStep(1);
              }}
              className="px-6 py-3 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
            >
              {t("dashboard.wizard.buttons.startOver")}
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() =>
                  setCurrentStep(currentStep === 2 ? 4 : currentStep + 1)
                }
                disabled={!canProceed()}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {t("dashboard.wizard.buttons.next")}
              </button>
            ) : (
              <button
                onClick={() => onComplete(config)}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-200"
              >
                {t("dashboard.wizard.buttons.finish")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
