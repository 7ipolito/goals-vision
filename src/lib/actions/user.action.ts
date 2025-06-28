"use server";

import User from "@/database/user.model";
import { FilterQuery } from "mongoose";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetUsersByPositionParams,
  GetUsersByAgeRangeParams,
  GetUserByIdParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";

export async function getUserByID(params: GetUserByIdParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findById(userId);

    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (error) {
    console.error(`❌ ${error} ❌`);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    // Convert MongoDB document to plain object
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error(`❌ ${error} ❌`);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { userId, updateData, path } = params;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    revalidatePath(path);
    return updatedUser ? JSON.parse(JSON.stringify(updatedUser)) : null;
  } catch (error) {
    console.error(`❌ ${error} ❌`);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { userId } = params;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new Error("❌🔍 User not found 🔍❌");
    }

    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    console.error(`❌ ${error} ❌`);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof User> = {};
    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }

    let sortOption = {};
    switch (filter) {
      case "newest":
        sortOption = { joinedAt: -1 };
        break;
      case "oldest":
        sortOption = { joinedAt: 1 };
        break;
      case "youngest":
        sortOption = { age: 1 };
        break;
      case "oldest_age":
        sortOption = { age: -1 };
        break;
      default:
        sortOption = { joinedAt: -1 };
        break;
    }

    const users = await User.find(query)
      .sort(sortOption)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsers = await User.countDocuments(query);
    const isNext = totalUsers > skipAmount + users.length;

    return {
      users: JSON.parse(JSON.stringify(users)),
      isNext,
    };
  } catch (error) {
    console.error(`❌ ${error} ❌`);
    throw error;
  }
}

export async function getUsersByPosition(params: GetUsersByPositionParams) {
  try {
    connectToDatabase();

    const { position, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    const users = await User.find({ position })
      .sort({ joinedAt: -1 })
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsers = await User.countDocuments({ position });
    const isNext = totalUsers > skipAmount + users.length;

    return {
      users: JSON.parse(JSON.stringify(users)),
      isNext,
    };
  } catch (error) {
    console.error(`❌ ${error} ❌`);
    throw error;
  }
}

export async function getUsersByAgeRange(params: GetUsersByAgeRangeParams) {
  try {
    connectToDatabase();

    const { minAge, maxAge, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    const users = await User.find({
      age: { $gte: minAge, $lte: maxAge },
    })
      .sort({ joinedAt: -1 })
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsers = await User.countDocuments({
      age: { $gte: minAge, $lte: maxAge },
    });
    const isNext = totalUsers > skipAmount + users.length;

    return {
      users: JSON.parse(JSON.stringify(users)),
      isNext,
    };
  } catch (error) {
    console.error(`❌ ${error} ❌`);
    throw error;
  }
}

export async function getUserStats() {
  try {
    connectToDatabase();

    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          averageAge: { $avg: "$age" },
          positionCounts: { $push: "$position" },
          dominantFootCounts: { $push: "$dominantFoot" },
        },
      },
    ]);

    const result = stats[0] || {
      totalUsers: 0,
      averageAge: 0,
      positionCounts: [],
      dominantFootCounts: [],
    };

    // Count occurrences
    const positionStats = result.positionCounts.reduce(
      (acc: Record<string, number>, position: string) => {
        acc[position] = (acc[position] || 0) + 1;
        return acc;
      },
      {}
    );

    const footStats = result.dominantFootCounts.reduce(
      (acc: Record<string, number>, foot: string) => {
        acc[foot] = (acc[foot] || 0) + 1;
        return acc;
      },
      {}
    );

    return {
      totalUsers: result.totalUsers,
      averageAge: Math.round(result.averageAge || 0),
      positionStats,
      footStats,
    };
  } catch (error) {
    console.error(`❌ ${error} ❌`);
    throw error;
  }
}
