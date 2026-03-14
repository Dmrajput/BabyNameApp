import Constants from "expo-constants";
import { Platform } from "react-native";

const envUrl = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const envIsLocalhost = /localhost|127\.0\.0\.1/.test(envUrl);

const hostUri =
  Constants.expoConfig?.hostUri ||
  Constants.expoGoConfig?.debuggerHost ||
  "";

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

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  return response.json();
}

export const getNames = async () => request("/api/names");

export const getNamesByCategory = async (category) =>
  request(`/api/names/category/${encodeURIComponent(category)}`);

export const searchNames = async (query) =>
  request(`/api/names/search?q=${encodeURIComponent(query)}`);

export const getNameById = async (id) => request(`/api/names/${id}`);
