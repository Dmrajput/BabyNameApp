import {
  BabyName,
  CategoryItem,
  CountryItem,
  CountryOption,
  GeneratedName,
  NameGender,
  StateOption,
} from "../types";

export type AdminNamePayload = {
  name: string;
  meaning: string;
  origin: string;
  gender: NameGender;
  category: string;
  country: string;
  state: string;
  rating: number;
};

export type AdminNamesResponse = {
  items: BabyName[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type NamesPageResponse = {
  data: BabyName[];
  currentPage: number;
  totalPages: number;
  total: number;
};

export function getCategories(country?: CountryOption): Promise<CategoryItem[]>;
export function getCountries(): Promise<CountryItem[]>;
export function getStatesByCountry(
  country?: CountryOption,
): Promise<StateOption[]>;
export function getNames(country?: CountryOption): Promise<BabyName[]>;
export function getNamesPage(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  country?: CountryOption;
  state?: StateOption;
  gender?: NameGender | "All";
  letter?: string;
}): Promise<NamesPageResponse>;
export function getNamesByCountry(country: CountryOption): Promise<BabyName[]>;
export function getNamesByCategory(
  category: string,
  country?: CountryOption,
  state?: StateOption,
): Promise<BabyName[]>;
export function searchNames(
  query: string,
  country?: CountryOption,
): Promise<BabyName[]>;
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
export function uploadNamesJson(params: {
  token: string;
  names: {
    name: string;
    meaning: string;
    origin: string;
    gender: NameGender;
    category: string;
    rating: number;
    country?: CountryOption;
    state?: StateOption;
  }[];
}): Promise<{
  successCount: number;
  failedCount: number;
  errors: { index: number; reason: string; record: unknown }[];
}>;
export function generateBabyNames(
  fatherName: string,
  motherName: string,
  gender: NameGender,
): Promise<GeneratedName[]>;
