import User, { IUser } from "../database/user.model";
import { CreateUserData, UserFormData } from "../types/user";

export class UserService {
  /**
   * Criar um novo usuário
   */
  static async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      const user = new User({
        name: userData.name,
        age: userData.age,
        dominantFoot: userData.dominantFoot,
        position: userData.position,
        picture: userData.picture,
        joinedAt: new Date(),
      });

      const savedUser = await user.save();
      return savedUser;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw new Error("Falha ao criar usuário");
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async getUserById(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw new Error("Falha ao buscar usuário");
    }
  }

  /**
   * Atualizar dados do usuário
   */
  static async updateUser(
    id: string,
    updateData: Partial<UserFormData>
  ): Promise<IUser | null> {
    try {
      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      return updatedUser;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw new Error("Falha ao atualizar usuário");
    }
  }

  /**
   * Deletar usuário
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw new Error("Falha ao deletar usuário");
    }
  }

  /**
   * Buscar usuários por posição
   */
  static async getUsersByPosition(position: string): Promise<IUser[]> {
    try {
      const users = await User.find({ position });
      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários por posição:", error);
      throw new Error("Falha ao buscar usuários");
    }
  }

  /**
   * Buscar usuários por faixa etária
   */
  static async getUsersByAgeRange(
    minAge: number,
    maxAge: number
  ): Promise<IUser[]> {
    try {
      const users = await User.find({
        age: { $gte: minAge, $lte: maxAge },
      });
      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários por idade:", error);
      throw new Error("Falha ao buscar usuários");
    }
  }

  /**
   * Obter estatísticas dos usuários
   */
  static async getUserStats() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            averageAge: { $avg: "$age" },
            positionCounts: {
              $push: "$position",
            },
            dominantFootCounts: {
              $push: "$dominantFoot",
            },
          },
        },
      ]);

      return (
        stats[0] || {
          totalUsers: 0,
          averageAge: 0,
          positionCounts: [],
          dominantFootCounts: [],
        }
      );
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error("Falha ao obter estatísticas");
    }
  }
}
