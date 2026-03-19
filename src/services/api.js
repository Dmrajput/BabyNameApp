import Constants from "expo-constants";
import { Platform } from "react-native";

const envUrl = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const envIsLocalhost = /localhost|127\.0\.0\.1/.test(envUrl);

const hostUri =
  Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || "";

const detectedHost = hostUri ? hostUri.split(":")[0] : "";
const platformFallback =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const API_BASE_URL = (
  envUrl && !envIsLocalhost
    ? envUrl
    : detectedHost
      ? `http://${detectedHost}:5000`
      : platformFallback
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

  return {
    ...item,
    rating: Number.isFinite(numericRating) ? numericRating : 0,
  };
}

function normalizeNames(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(normalizeName);
}

export const getNames = async () => normalizeNames(await request("/api/names"));

export const getNamesByCategory = async (category) =>
  normalizeNames(
    await request(`/api/names/category/${encodeURIComponent(category)}`),
  );

export const searchNames = async (query) =>
  normalizeNames(
    await request(`/api/names/search?q=${encodeURIComponent(query)}`),
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

export const generateBabyNames = async (fatherName, motherName, gender) =>
  post("/api/generate-name", {
    fatherName,
    motherName,
    gender,
  });
