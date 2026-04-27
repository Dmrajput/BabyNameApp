import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  BabyName,
  CategoryItem,
  CountryItem,
  CountryOption,
  GeneratedName,
  GenderFilter,
  NameGender,
  StateOption,
} from "../types";
import { getApiBaseUrl } from "../utils/api";

// Configuration - use getApiBaseUrl to handle Android emulator localhost issue
const resolvedBaseUrl = getApiBaseUrl().replace(/\/api$/i, "");
const API_HOST = resolvedBaseUrl || "http://10.0.2.2:5000";
const API_BASE_URL = resolvedBaseUrl
  ? `${resolvedBaseUrl}/api`
  : "http://10.0.2.2:5000/api";
console.log("🔌 API Base URL:", API_BASE_URL);
const TOKEN_KEY = "baby_app_token";
const REFRESH_TOKEN_KEY = "baby_app_refresh_token";

type AdminNamePayload = {
  name: string;
  meaning: string;
  origin: string;
  gender: NameGender;
  category: string;
  country: string;
  state: string;
  rating: number;
};

type AdminNamesResponse = {
  items: BabyName[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type NamesPageResponse = {
  data: BabyName[];
  currentPage: number;
  totalPages: number;
  total: number;
};

type AuthorizedRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
};

async function buildError(response: Response): Promise<Error> {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text) as { message?: string };
    if (parsed?.message) {
      return new Error(parsed.message);
    }
  } catch (_error) {
    // Ignore JSON parse failures and fall back to raw text.
  }

  return new Error(text || "Request failed");
}

async function request(path: string) {
  const response = await fetch(`${API_HOST}${path}`);

  if (!response.ok) {
    throw await buildError(response);
  }

  return response.json();
}

async function authorizedRequest(
  path: string,
  { method = "GET", token, body }: AuthorizedRequestOptions = {},
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token ?? ""}`,
  };

  const response = await fetch(`${API_HOST}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await buildError(response);
  }

  return response.json();
}

async function post(path: string, body: unknown) {
  const response = await fetch(`${API_HOST}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await buildError(response);
  }

  return response.json();
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  if (value && typeof value === "object") {
    const record = value as { $numberDecimal?: string };
    if (typeof record.$numberDecimal === "string") {
      const parsed = Number(record.$numberDecimal);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    }
  }

  return Number.NaN;
}

type RawNameRecord = Partial<BabyName> & {
  ratings?: unknown;
  Rating?: unknown;
  favoriteCount?: unknown;
};

function normalizeName(item: RawNameRecord): BabyName {
  const numericRating = toNumber(item?.rating ?? item?.ratings ?? item?.Rating);
  const numericFavoriteCount = toNumber(item?.favoriteCount);

  return {
    ...(item as BabyName),
    rating: Number.isFinite(numericRating) ? numericRating : 0,
    favoriteCount: Number.isFinite(numericFavoriteCount)
      ? Math.max(0, Math.floor(numericFavoriteCount))
      : 0,
  };
}

function normalizeNames(items: unknown): BabyName[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => normalizeName(item as RawNameRecord));
}

function normalizeCategories(items: unknown): CategoryItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => {
      const record = item as { id?: unknown; title?: unknown };
      return record && record.id && record.title;
    })
    .map((item) => {
      const record = item as {
        id: string;
        title: string;
        icon?: string;
        color?: string;
      };

      return {
        id: String(record.id),
        title: String(record.title),
        icon: record.icon ? String(record.icon) : "shape",
        color: record.color ? String(record.color) : "#F1F5F9",
      };
    });
}

function normalizeCountries(items: unknown): CountryItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => {
      const record = item as { code?: unknown; label?: unknown };
      return record && record.code && record.label;
    })
    .map((item) => {
      const record = item as {
        code: string;
        label: string;
        flag?: string;
      };

      return {
        code: String(record.code),
        label: String(record.label),
        flag: record.flag ? String(record.flag) : "",
      };
    });
}

export const getCategories = async (country?: CountryOption) => {
  const params = new URLSearchParams();

  if (country) {
    params.append("country", country);
  }

  const query = params.toString();
  const path = query ? `/api/categories?${query}` : "/api/categories";

  return normalizeCategories(await request(path));
};

export const getCountries = async () =>
  normalizeCountries(await request("/api/countries"));

export const getStatesByCountry = async (country: CountryOption = "India") => {
  const states = await request(
    `/api/countries/${encodeURIComponent(country)}/states`,
  );

  if (!Array.isArray(states)) {
    return [];
  }

  return states
    .map((item) => item?.toString().trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .sort((a, b) => a.localeCompare(b));
};

export const getNames = async (country: CountryOption = "India") =>
  normalizeNames(
    await request(`/api/names?country=${encodeURIComponent(country)}`),
  );

export const getNamesByCountry = async (country: CountryOption) =>
  normalizeNames(
    await request(`/api/names?country=${encodeURIComponent(country)}`),
  );

export const getNamesByCategory = async (
  category: string,
  country: CountryOption = "India",
  state: StateOption = "All",
) => {
  const params = new URLSearchParams();
  params.append("country", country);

  if (state && state !== "All") {
    params.append("state", state);
  }

  return normalizeNames(
    await request(
      `/api/names/category/${encodeURIComponent(category)}?${params.toString()}`,
    ),
  );
};

export const getNamesPage = async ({
  page = 1,
  limit = 100,
  search = "",
  category = "All",
  country = "India",
  state = "All",
  gender = "All",
  letter = "All",
}: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  country?: CountryOption;
  state?: StateOption;
  gender?: GenderFilter;
  letter?: string;
} = {}): Promise<NamesPageResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.append("search", search.trim());
  }

  if (category && category !== "All") {
    params.append("category", category);
  }

  if (country) {
    params.append("country", country);
  }

  if (state && state !== "All") {
    params.append("state", state);
  }

  if (gender && gender !== "All") {
    params.append("gender", gender);
  }

  if (letter && letter !== "All") {
    params.append("letter", letter);
  }

  const response = await request(`/api/names?${params.toString()}`);
  const rawItems = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.items)
      ? response.items
      : [];

  const totalPages = Number.isFinite(response?.totalPages)
    ? Math.max(1, Number(response.totalPages))
    : 1;
  const currentPage = Number.isFinite(response?.currentPage)
    ? Math.max(1, Number(response.currentPage))
    : Number.isFinite(response?.page)
      ? Math.max(1, Number(response.page))
      : page;

  return {
    data: normalizeNames(rawItems),
    currentPage,
    totalPages,
    total: Number.isFinite(response?.total) ? Number(response.total) : 0,
  };
};

export const searchNames = async (query: string, country: CountryOption = "India") =>
  normalizeNames(
    await request(
      `/api/names/search?q=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`,
    ),
  );

export const getNameById = async (id: string) =>
  normalizeName(await request(`/api/names/${id}`));

export const getAdminNames = async ({
  token,
  page = 1,
  limit = 10,
  search = "",
  category = "All",
}: {
  token: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<AdminNamesResponse> => {
  const params = new URLSearchParams({
    paginate: "true",
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.append("search", search.trim());
  }

  if (category && category !== "All") {
    params.append("category", category);
  }

  const data = await authorizedRequest(`/api/names?${params.toString()}`, {
    token,
  });

  return {
    ...data,
    items: normalizeNames(data?.items),
  };
};

export const addAdminName = async ({
  token,
  payload,
}: {
  token: string;
  payload: AdminNamePayload;
}) =>
  normalizeName(
    await authorizedRequest("/api/names", {
      method: "POST",
      token,
      body: payload,
    }),
  );

export const updateAdminName = async ({
  token,
  id,
  payload,
}: {
  token: string;
  id: string;
  payload: AdminNamePayload;
}) =>
  normalizeName(
    await authorizedRequest(`/api/names/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }),
  );

export const deleteAdminName = async ({ token, id }: { token: string; id: string }) =>
  authorizedRequest(`/api/names/${id}`, {
    method: "DELETE",
    token,
  });

export const getFavorites = async ({ token }: { token: string }) =>
  normalizeNames(
    await authorizedRequest("/api/favorites", {
      token,
    }),
  );

export const addFavorite = async ({
  token,
  nameId,
}: {
  token: string;
  nameId: string;
}) =>
  authorizedRequest("/api/favorites", {
    method: "POST",
    token,
    body: { nameId },
  });

export const removeFavorite = async ({
  token,
  nameId,
}: {
  token: string;
  nameId: string;
}) =>
  authorizedRequest(`/api/favorites/${nameId}`, {
    method: "DELETE",
    token,
  });

export const uploadNamesJson = async ({
  token,
  names,
}: {
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
}) =>
  authorizedRequest("/api/upload-names", {
    method: "POST",
    token,
    body: { names },
  });

export const generateBabyNames = async (
  fatherName: string,
  motherName: string,
  gender: NameGender,
): Promise<GeneratedName[]> =>
  post("/api/generate-name", {
    fatherName,
    motherName,
    gender,
  });

class ApiService {
  private axiosInstance: any;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Log all errors with details (except 404 which is normal for optional data)
        if (error.response?.status !== 404) {
          console.error("❌ API Error:", {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data,
          });
        }

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, clear tokens and return original error
            await this.clearTokens();
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Initialize - load token from storage
  async initialize() {
    try {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
      this.refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      if (this.token) {
        this.setAuthHeader(this.token);
      }
    } catch (error) {
      console.error("Failed to initialize API service:", error);
    }
  }

  // Set authorization header
  private setAuthHeader(token: string) {
    this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  // Store tokens in AsyncStorage and set header
  async setTokens(token: string, refreshToken?: string) {
    try {
      this.token = token;
      this.setAuthHeader(token);
      await AsyncStorage.setItem(TOKEN_KEY, token);

      if (refreshToken) {
        this.refreshToken = refreshToken;
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error("Failed to store tokens:", error);
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<string | null> {
    try {
      if (!this.refreshToken) {
        return null;
      }

      const response = await this.axiosInstance.post("/auth/refresh", {
        refreshToken: this.refreshToken,
      });

      const newToken = response.data.token;
      const newRefreshToken = response.data.refreshToken;

      await this.setTokens(newToken, newRefreshToken);
      return newToken;
    } catch (error: any) {
      console.error("Failed to refresh token:", error.message);
      console.error("Error response:", error.response?.data);
      await this.clearTokens();
      return null;
    }
  }

  // Clear tokens
  async clearTokens() {
    try {
      this.token = null;
      this.refreshToken = null;
      delete this.axiosInstance.defaults.headers.common.Authorization;
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // ===== FEEDING ENDPOINTS =====
  async createFeedingLog(data: any) {
    return this.axiosInstance.post("/feeding", data);
  }

  async getFeedingLogs(params?: any) {
    return this.axiosInstance.get("/feeding", { params });
  }

  async getFeedingStats(date: string) {
    return this.axiosInstance.get("/feeding/stats", { params: { date } });
  }

  async getFeedingLog(id: string) {
    return this.axiosInstance.get(`/feeding/${id}`);
  }

  async updateFeedingLog(id: string, data: any) {
    return this.axiosInstance.put(`/feeding/${id}`, data);
  }

  async deleteFeedingLog(id: string) {
    return this.axiosInstance.delete(`/feeding/${id}`);
  }

  // ===== SLEEP ENDPOINTS =====
  async createSleepLog(data: any) {
    return this.axiosInstance.post("/sleep", data);
  }

  async getSleepLogs(params?: any) {
    return this.axiosInstance.get("/sleep", { params });
  }

  async getSleepStats(date: string) {
    return this.axiosInstance.get("/sleep/stats", { params: { date } });
  }

  async getSleepLog(id: string) {
    return this.axiosInstance.get(`/sleep/${id}`);
  }

  async updateSleepLog(id: string, data: any) {
    return this.axiosInstance.put(`/sleep/${id}`, data);
  }

  async deleteSleepLog(id: string) {
    return this.axiosInstance.delete(`/sleep/${id}`);
  }

  // ===== DIAPER ENDPOINTS =====
  async createDiaperLog(data: any) {
    return this.axiosInstance.post("/diaper", data);
  }

  async getDiaperLogs(params?: any) {
    return this.axiosInstance.get("/diaper", { params });
  }

  async getDiaperStats(date: string) {
    return this.axiosInstance.get("/diaper/stats", { params: { date } });
  }

  async getDiaperLog(id: string) {
    return this.axiosInstance.get(`/diaper/${id}`);
  }

  async updateDiaperLog(id: string, data: any) {
    return this.axiosInstance.put(`/diaper/${id}`, data);
  }

  async deleteDiaperLog(id: string) {
    return this.axiosInstance.delete(`/diaper/${id}`);
  }

  // ===== VACCINATION ENDPOINTS =====
  async createVaccinationLog(data: any) {
    return this.axiosInstance.post("/vaccination", data);
  }

  async getVaccinationLogs(params?: any) {
    return this.axiosInstance.get("/vaccination", { params });
  }

  async getVaccinationLog(id: string) {
    return this.axiosInstance.get(`/vaccination/${id}`);
  }

  async updateVaccinationLog(id: string, data: any) {
    return this.axiosInstance.put(`/vaccination/${id}`, data);
  }

  async deleteVaccinationLog(id: string) {
    return this.axiosInstance.delete(`/vaccination/${id}`);
  }

  // ===== PREGNANCY ENDPOINTS =====
  async createPregnancyData(data: any) {
    return this.axiosInstance.post("/pregnancy", data);
  }

  async getPregnancyData() {
    return this.axiosInstance.get("/pregnancy");
  }

  async updatePregnancyData(data: any) {
    return this.axiosInstance.put("/pregnancy", data);
  }

  async deletePregnancyData() {
    return this.axiosInstance.delete("/pregnancy");
  }

  // ===== MILESTONE ENDPOINTS =====
  async createMilestone(data: any) {
    return this.axiosInstance.post("/milestone", data);
  }

  async getMilestones(params?: any) {
    return this.axiosInstance.get("/milestone", { params });
  }

  async getMilestoneStats(params?: any) {
    return this.axiosInstance.get("/milestone/stats", { params });
  }

  async getMilestone(id: string) {
    return this.axiosInstance.get(`/milestone/${id}`);
  }

  async updateMilestone(id: string, data: any) {
    return this.axiosInstance.put(`/milestone/${id}`, data);
  }

  async deleteMilestone(id: string) {
    return this.axiosInstance.delete(`/milestone/${id}`);
  }

  // ===== JOURNAL ENDPOINTS =====
  async createJournalEntry(data: any) {
    return this.axiosInstance.post("/journal", data);
  }

  async getJournalEntries(params?: any) {
    return this.axiosInstance.get("/journal", { params });
  }

  async getJournalEntry(id: string) {
    return this.axiosInstance.get(`/journal/${id}`);
  }

  async updateJournalEntry(id: string, data: any) {
    return this.axiosInstance.put(`/journal/${id}`, data);
  }

  async deleteJournalEntry(id: string) {
    return this.axiosInstance.delete(`/journal/${id}`);
  }
}

// Export singleton instance
export const apiService = new ApiService();
