import Constants from "expo-constants";
import { Platform } from "react-native";

const LOCAL_FALLBACK_API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
const PRODUCTION_FALLBACK_API_URL = "https://babynameapp.onrender.com";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").replace(/\/api$/i, "");
}

function shouldReplaceLocalhost(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

export function getApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];

  const explicitUrl = process.env.EXPO_PUBLIC_API_URL;
  if (explicitUrl) {
    const normalized = normalizeBaseUrl(explicitUrl);

    // On mobile devices, localhost points to the device itself.
    if (Platform.OS !== "web" && host && shouldReplaceLocalhost(normalized)) {
      return normalizeBaseUrl(
        normalized.replace(/localhost|127\.0\.0\.1/i, host),
      );
    }

    if (!host && shouldReplaceLocalhost(normalized) && !__DEV__) {
      return PRODUCTION_FALLBACK_API_URL;
    }

    return normalized;
  }

  if (!hostUri) {
    return __DEV__ ? LOCAL_FALLBACK_API_URL : PRODUCTION_FALLBACK_API_URL;
  }

  if (!host) {
    return __DEV__ ? LOCAL_FALLBACK_API_URL : PRODUCTION_FALLBACK_API_URL;
  }

  return normalizeBaseUrl(`http://${host}:5000`);
}
