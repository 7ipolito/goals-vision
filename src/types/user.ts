// Tipos para o modelo de usuário

export type DominantFoot = "right" | "left" | "both";

export type Position = "goalkeeper" | "defender" | "midfielder" | "forward";

export interface UserFormData {
  name: string;
  age: number;
  dominantFoot: DominantFoot;
  position: Position;
  picture?: string;
}

export interface CreateUserData extends UserFormData {
  picture: string; // Required when creating user
}

// Mapeamento para exibição em português
export const DominantFootLabels: Record<DominantFoot, string> = {
  right: "Direito",
  left: "Esquerdo",
  both: "Ambos",
};

export const PositionLabels: Record<Position, string> = {
  goalkeeper: "Goleiro",
  defender: "Defensor",
  midfielder: "Meio-campista",
  forward: "Atacante",
};
