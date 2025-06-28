import { Schema, models, model, Document } from "mongoose";

/**
 * why extend Document?
 * This means that it's going to get some properties as well,
 * such as the _id, version and everything else that
 * each Document in the MongoDB database has
 *
 */
export interface IUser extends Document {
  name: string; // Nome completo
  age: number; // Idade
  dominantFoot: string; // Pé dominante: 'right', 'left', 'both'
  position: string; // Posição: 'goalkeeper', 'defender', 'midfielder', 'forward'
  picture: string; // Foto do perfil
  joinedAt: Date;
}

const UserSchema = new Schema({
  name: { type: String, required: true }, // Nome completo
  age: { type: Number, required: true }, // Idade
  dominantFoot: {
    type: String,
    required: true,
    enum: ["right", "left", "both"], // Pé dominante
  },
  position: {
    type: String,
    required: true,
    enum: ["goalkeeper", "defender", "midfielder", "forward"], // Posição
  },
  picture: { type: String, required: true }, // Foto do perfil
  joinedAt: { type: Date, default: Date.now },
});

// Check if the model alredy exists, if not create it
const User = models.User || model("User", UserSchema);

export default User;
