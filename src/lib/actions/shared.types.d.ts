import { Schema } from "mongoose";
import { IUser } from "@/mongodb";

export interface CreateAnswerParams {
  content: string;
  author: string; // User ID
  question: string; // Question ID
  path: string;
}

export interface GetAnswersParams {
  questionId: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface AnswerVoteParams {
  answerId: string;
  userId: string;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  path: string;
}

export interface GetQuestionsParams {
  questionId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  filter?: string;
}

export interface RecommendedParams {
  userId: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}

export interface EditQuestionParams {
  questionId: string;
  title: string;
  content: string;
  path: string;
}

export interface DeleteQuestionParams {
  questionId: string;
  path: string;
}

export interface DeleteAnswerParams {
  answerId: string;
  path: string;
}

export interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
  author: Schema.Types.ObjectId | IUser;
  path: string;
}

export interface GetQuestionByIdParams {
  questionId: string;
}

export interface QuestionVoteParams {
  questionId: string;
  userId: string;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  path: string;
}

export interface ToggleSaveQuestionParams {
  userId: string;
  questionId: string;
  path: string;
}

export interface CreateUserParams {
  name: string;
  age: number;
  dominantFoot: string;
  position: string;
  picture: string;
}

export interface UpdateUserParams {
  userId: string;
  updateData: Partial<IUser>;
  path: string;
}

export interface DeleteUserParams {
  userId: string;
}

export interface GetAllUsersParams {
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string; // Add searchQuery parameter
}

export interface GetUserByIdParams {
  userId: string;
}

export interface GetUsersByPositionParams {
  position: string;
  page?: number;
  pageSize?: number;
}

export interface GetUsersByAgeRangeParams {
  minAge: number;
  maxAge: number;
  page?: number;
  pageSize?: number;
}

export interface GetTopInteractedTagsParams {
  userId: string;
  limit?: number;
}

export interface GetAllTagsParams {
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}

export interface GetQuestionsByTagIdParams {
  tagId: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}

export interface ViewQuestionParams {
  questionId: string;
  userId: string | undefined;
}

export interface GetUserStatsParams {
  userId: string;
  page?: number;
  pageSize?: number;
}

export interface SearchParams {
  query?: string | null;
  type?: string | null;
}

export interface JobFilterParams {
  query: string;
  page: string;
}
