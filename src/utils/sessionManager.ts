import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "userToken";
const USER_KEY = "userData";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  country?: string;
};

export type SessionData = {
  token: string;
  user: SessionUser;
};

export async function saveSession(
  token: string,
  user: SessionUser,
): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getSession(): Promise<SessionData | null> {
  const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
  const savedUser = await AsyncStorage.getItem(USER_KEY);

  if (!savedToken || !savedUser) {
    return null;
  }

  return {
    token: savedToken,
    user: JSON.parse(savedUser) as SessionUser,
  };
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}
