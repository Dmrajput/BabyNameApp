import Constants from 'expo-constants';
import { Platform } from 'react-native';

const fallbackApiUrl = 'http://localhost:5000';

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function shouldReplaceLocalhost(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

export function getApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];

  const explicitUrl = process.env.EXPO_PUBLIC_API_URL;
  if (explicitUrl) {
    const normalized = normalizeBaseUrl(explicitUrl);

    // On mobile devices, localhost points to the device itself.
    if (Platform.OS !== 'web' && host && shouldReplaceLocalhost(normalized)) {
      return normalizeBaseUrl(normalized.replace(/localhost|127\.0\.0\.1/i, host));
    }

    return normalized;
  }

  if (!hostUri) {
    return fallbackApiUrl;
  }

  if (!host) {
    return fallbackApiUrl;
  }

  return normalizeBaseUrl(`http://${host}:5000`);
}
