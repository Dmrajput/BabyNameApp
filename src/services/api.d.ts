import { BabyName, GeneratedName, NameGender } from "../types";

export type AdminNamePayload = {
  name: string;
  meaning: string;
  origin: string;
  gender: NameGender;
  category: string;
  rating: number;
};

export type AdminNamesResponse = {
  items: BabyName[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function getNames(): Promise<BabyName[]>;
export function getNamesByCategory(category: string): Promise<BabyName[]>;
export function searchNames(query: string): Promise<BabyName[]>;
export function getNameById(id: string): Promise<BabyName>;
export function getAdminNames(params: {
  token: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<AdminNamesResponse>;
export function addAdminName(params: {
  token: string;
  payload: AdminNamePayload;
}): Promise<BabyName>;
export function updateAdminName(params: {
  token: string;
  id: string;
  payload: AdminNamePayload;
}): Promise<BabyName>;
export function deleteAdminName(params: {
  token: string;
  id: string;
}): Promise<{ message: string; id: string }>;
export function getFavorites(params: { token: string }): Promise<BabyName[]>;
export function addFavorite(params: {
  token: string;
  nameId: string;
}): Promise<{
  message: string;
  favoriteId: string;
  nameId: string;
  createdAt: string;
}>;
export function removeFavorite(params: {
  token: string;
  nameId: string;
}): Promise<{ message: string; nameId: string }>;
export function generateBabyNames(
  fatherName: string,
  motherName: string,
  gender: NameGender,
): Promise<GeneratedName[]>;
