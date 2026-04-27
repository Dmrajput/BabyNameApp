import Constants from "expo-constants";
import { Platform } from "react-native";

const PROD_FALLBACK_URL = "https://babynameapp.onrender.com";

const normalizeBaseUrl = (value) =>
  value.trim().replace(/\/+$/, "").replace(/\/api$/i, "");

const envUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL || "");
const envIsLocalhost = /localhost|127\.0\.0\.1/.test(envUrl);

const hostUri =
  Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || "";

const detectedHost = hostUri ? hostUri.split(":")[0] : "";
const platformFallback =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
const runtimeFallback = __DEV__ ? platformFallback : PROD_FALLBACK_URL;

const API_BASE_URL = (
  envUrl && !envIsLocalhost
    ? envUrl
    : envUrl && envIsLocalhost && !detectedHost && !__DEV__
      ? PROD_FALLBACK_URL
      : detectedHost
        ? `http://${detectedHost}:5000`
        : runtimeFallback
).replace(/\/$/, "");

async function buildError(response) {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text);
    if (parsed?.message) {
      return new Error(parsed.message);
    }
  } catch (_error) {
    // Ignore JSON parse failures and fall back to raw text.
  }

  return new Error(text || "Request failed");
}

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw await buildError(response);
  }

  return response.json();
}

async function authorizedRequest(path, { method = "GET", token, body } = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await buildError(response);
  }

  return response.json();
}

async function post(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  if (value && typeof value === "object") {
    const decimalValue = value.$numberDecimal;
    if (typeof decimalValue === "string") {
      const parsed = Number(decimalValue);
      return Number.isFinite(parsed) ? parsed : NaN;
    }
  }

  return NaN;
}

function normalizeName(item) {
  const numericRating = toNumber(item?.rating ?? item?.ratings ?? item?.Rating);
  const numericFavoriteCount = toNumber(item?.favoriteCount);

  return {
    ...item,
    rating: Number.isFinite(numericRating) ? numericRating : 0,
    favoriteCount: Number.isFinite(numericFavoriteCount)
      ? Math.max(0, Math.floor(numericFavoriteCount))
      : 0,
  };
}

function normalizeNames(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(normalizeName);
}

function normalizeCategories(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && item.id && item.title)
    .map((item) => ({
      id: String(item.id),
      title: String(item.title),
      icon: item.icon ? String(item.icon) : "shape",
      color: item.color ? String(item.color) : "#F1F5F9",
    }));
}

function normalizeCountries(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && item.code && item.label)
    .map((item) => ({
      code: String(item.code),
      label: String(item.label),
      flag: item.flag ? String(item.flag) : "",
    }));
}

export const getCategories = async (country) => {
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

export const getStatesByCountry = async (country = "India") => {
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

export const getNames = async (country = "India") =>
  normalizeNames(
    await request(`/api/names?country=${encodeURIComponent(country)}`),
  );

export const getNamesByCountry = async (country) =>
  normalizeNames(
    await request(`/api/names?country=${encodeURIComponent(country)}`),
  );

export const getNamesByCategory = async (
  category,
  country = "India",
  state = "All",
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
} = {}) => {
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

export const searchNames = async (query, country = "India") =>
  normalizeNames(
    await request(
      `/api/names/search?q=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`,
    ),
  );

export const getNameById = async (id) =>
  normalizeName(await request(`/api/names/${id}`));

export const getAdminNames = async ({
  token,
  page = 1,
  limit = 10,
  search = "",
  category = "All",
}) => {
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

export const addAdminName = async ({ token, payload }) =>
  normalizeName(
    await authorizedRequest("/api/names", {
      method: "POST",
      token,
      body: payload,
    }),
  );

export const updateAdminName = async ({ token, id, payload }) =>
  normalizeName(
    await authorizedRequest(`/api/names/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }),
  );

export const deleteAdminName = async ({ token, id }) =>
  authorizedRequest(`/api/names/${id}`, {
    method: "DELETE",
    token,
  });

export const getFavorites = async ({ token }) =>
  normalizeNames(
    await authorizedRequest("/api/favorites", {
      token,
    }),
  );

export const addFavorite = async ({ token, nameId }) =>
  authorizedRequest("/api/favorites", {
    method: "POST",
    token,
    body: { nameId },
  });

export const removeFavorite = async ({ token, nameId }) =>
  authorizedRequest(`/api/favorites/${nameId}`, {
    method: "DELETE",
    token,
  });

export const uploadNamesJson = async ({ token, names }) =>
  authorizedRequest("/api/upload-names", {
    method: "POST",
    token,
    body: { names },
  });

export const generateBabyNames = async (fatherName, motherName, gender) =>
  post("/api/generate-name", {
    fatherName,
    motherName,
    gender,
  });
