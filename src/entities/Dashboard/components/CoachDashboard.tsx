"use client";

import { useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { DashboardLayout } from "./DashboardLayout";
import { PlayerCard } from "./PlayerCard";
import { ConfigurationWizard } from "./ConfigurationWizard";
import { PlayerModal } from "./PlayerModal";

interface WizardConfig {
  selectedPositions: string[];
  positionAttributes: Record<string, string[]>;
  attributeWeights: Record<string, number>;
}

// Mock data for famous players with more detailed stats
const mockPlayers = [
  {
    id: 1,
    name: "Mohamed Salah",
    compatibility: 89,
    position: "Ponta Direita",
    age: 31,
    nationality: "Egito",
    stats: { goals: 23, assists: 12, speed: 94, dribbles: 87 },
    attributes: {
      speed: 94,
      shooting: 91,
      dribbling: 87,
      positioning: 88,
      crossing: 84,
      workRate: 92,
      determination: 95,
      stamina: 89,
      agility: 90,
      strength: 78,
      passing: 83,
      vision: 85,
      composure: 88,
      concentration: 86,
      teamwork: 87,
    },
    details: {
      height: "1.75m",
      weight: "71kg",
      preferredFoot: "Esquerdo",
    },
  },
  {
    id: 2,
    name: "Kylian Mbappé",
    compatibility: 76,
    position: "Atacante",
    age: 25,
    nationality: "França",
    stats: { goals: 29, assists: 8, speed: 98, dribbles: 85 },
    attributes: {
      speed: 98,
      shooting: 89,
      dribbling: 85,
      agility: 95,
      positioning: 86,
      composure: 88,
      determination: 90,
      stamina: 87,
      strength: 82,
      passing: 79,
      vision: 81,
      concentration: 84,
      workRate: 88,
      teamwork: 82,
    },
    details: {
      height: "1.78m",
      weight: "73kg",
      preferredFoot: "Direito",
    },
  },
  {
    id: 3,
    name: "Neymar Jr",
    compatibility: 64,
    position: "Ponta Esquerda",
    age: 32,
    stats: { goals: 15, assists: 18, speed: 89, dribbles: 96 },
    attributes: {
      dribbling: 96,
      passing: 88,
      speed: 89,
      agility: 93,
      vision: 91,
      firstTouch: 94,
      teamwork: 85,
      shooting: 86,
      crossing: 87,
      positioning: 84,
      composure: 89,
      concentration: 82,
      determination: 88,
      workRate: 79,
      strength: 72,
    },
    details: {
      height: "1.75m",
      weight: "68kg",
      preferredFoot: "Direito",
    },
  },
  {
    id: 4,
    name: "Kevin De Bruyne",
    compatibility: 82,
    position: "Meio-campo Central",
    age: 33,
    nationality: "Bélgica",
    stats: { assists: 24, passes: 91, speed: 78, goals: 8 },
    attributes: {
      passing: 96,
      vision: 95,
      shooting: 87,
      crossing: 93,
      stamina: 89,
      leadership: 88,
      concentration: 91,
      firstTouch: 92,
      positioning: 90,
      composure: 89,
      determination: 87,
      workRate: 90,
      teamwork: 92,
      strength: 78,
      agility: 76,
    },
    details: {
      height: "1.81m",
      weight: "76kg",
      preferredFoot: "Direito",
    },
  },
  {
    id: 5,
    name: "Virgil van Dijk",
    compatibility: 78,
    position: "Zagueiro Central",
    age: 32,
    nationality: "Holanda",
    stats: { interceptions: 67, passes: 88, goals: 4, speed: 82 },
    attributes: {
      marking: 94,
      interceptions: 92,
      positioning: 95,
      strength: 91,
      leadership: 93,
      composure: 89,
      jumping: 88,
      passing: 88,
      concentration: 92,
      determination: 90,
      workRate: 88,
      teamwork: 91,
      agility: 76,
      speed: 82,
      vision: 84,
    },
    details: {
      height: "1.95m",
      weight: "92kg",
      preferredFoot: "Direito",
    },
  },
  {
    id: 6,
    name: "Luka Modrić",
    compatibility: 71,
    position: "Meio-campo Central",
    age: 38,
    nationality: "Croácia",
    stats: { passes: 94, assists: 11, interceptions: 45, goals: 3 },
    attributes: {
      passing: 94,
      vision: 93,
      stamina: 88,
      positioning: 90,
      firstTouch: 92,
      teamwork: 94,
      concentration: 91,
      composure: 90,
      determination: 89,
      workRate: 92,
      agility: 85,
      strength: 72,
      interceptions: 78,
      leadership: 86,
      dribbling: 84,
    },
    details: {
      height: "1.72m",
      weight: "66kg",
      preferredFoot: "Direito",
    },
  },
];

export function CoachDashboard() {
  const { t } = useTranslation();
  const [filteredPlayers, setFilteredPlayers] = useState(mockPlayers);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardConfig, setWizardConfig] = useState<WizardConfig | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<
    (typeof mockPlayers)[0] | null
  >(null);

  const calculateCompatibility = (player: any, config: WizardConfig) => {
    if (!config.selectedPositions.length) return player.compatibility;

    let totalScore = 0;
    let totalWeight = 0;

    // Check if player position matches any selected positions
    const positionMatch = config.selectedPositions.some((pos) => {
      const positionMap: Record<string, string[]> = {
        striker: ["Atacante", "Centro-avante"],
        rightWinger: ["Ponta Direita"],
        leftWinger: ["Ponta Esquerda"],
        centralMidfielder: ["Meio-campo Central"],
        centerBack: ["Zagueiro Central"],
        // Add more position mappings as needed
      };

      return positionMap[pos]?.includes(player.position) || false;
    });

    if (!positionMatch) return 0;

    // Calculate score based on attributes and weights
    Object.entries(config.attributeWeights).forEach(([attribute, weight]) => {
      const playerAttributeValue = player.attributes[attribute] || 50;
      totalScore += (playerAttributeValue / 100) * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
  };

  const handleWizardComplete = (config: WizardConfig) => {
    setWizardConfig(config);

    // Calculate new compatibility scores for all players
    const updatedPlayers = mockPlayers.map((player) => ({
      ...player,
      compatibility: calculateCompatibility(player, config),
    }));

    // Filter out players with 0% compatibility and sort by compatibility
    const validPlayers = updatedPlayers
      .filter((player) => player.compatibility > 0)
      .sort((a, b) => b.compatibility - a.compatibility);

    setFilteredPlayers(validPlayers);
    setShowWizard(false);
  };

  const handlePlayerClick = (playerId: number) => {
    const player = filteredPlayers.find((p) => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Configuration Section */}
        <div className="text-center">
          {!wizardConfig ? (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t("dashboard.wizard.title")}
              </h2>
              <p className="text-gray-300 mb-6">
                {t("dashboard.wizard.subtitle")}
              </p>
              <button
                onClick={() => setShowWizard(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105"
              >
                Configurar Posições 🎯
              </button>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Configuração Ativa
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {wizardConfig.selectedPositions.length} posições •{" "}
                    {Object.keys(wizardConfig.attributeWeights).length}{" "}
                    atributos
                  </p>
                </div>
                <button
                  onClick={() => setShowWizard(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Reconfigurar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Players Results */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {t("dashboard.playersInEvaluation.title")}
          </h2>

          {filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => (
                <PlayerCard
                  avatar="https://cdn.futbin.com/content/fifa21/img/players/p117631383.png?v=23"
                  key={player.id}
                  name={player.name}
                  compatibility={player.compatibility}
                  position={player.position}
                  age={player.age}
                  nationality={player.nationality}
                  stats={player.stats}
                  onClick={() => handlePlayerClick(player.id)}
                />
              ))}
            </div>
          ) : wizardConfig ? (
            <div className="text-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t("dashboard.playersInEvaluation.noPlayersFound")}
              </h3>
              <p className="text-gray-300 mb-4">
                {t("dashboard.playersInEvaluation.adjustFilters")}
              </p>
              <button
                onClick={() => setShowWizard(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
              >
                Ajustar Filtros
              </button>
            </div>
          ) : null}
        </div>

        {/* Stats Summary */}
        {filteredPlayers.length > 0 && (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Resumo da Avaliação
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {filteredPlayers.filter((p) => p.compatibility >= 80).length}
                </div>
                <div className="text-gray-400 text-sm">
                  Alta Compatibilidade
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {
                    filteredPlayers.filter(
                      (p) => p.compatibility >= 60 && p.compatibility < 80
                    ).length
                  }
                </div>
                <div className="text-gray-400 text-sm">
                  Média Compatibilidade
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {filteredPlayers.filter((p) => p.compatibility < 60).length}
                </div>
                <div className="text-gray-400 text-sm">
                  Baixa Compatibilidade
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {filteredPlayers.length}
                </div>
                <div className="text-gray-400 text-sm">Total de Jogadores</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Wizard */}
      {showWizard && (
        <ConfigurationWizard
          onComplete={handleWizardComplete}
          onClose={() => setShowWizard(false)}
        />
      )}

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </DashboardLayout>
  );
}
