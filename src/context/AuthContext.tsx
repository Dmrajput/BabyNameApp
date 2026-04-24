import React, { createContext, useContext, useEffect, useState } from "react";

import { getApiBaseUrl } from "@/src/utils/api";
import {
  logout as clearStoredSession,
  getSession,
  saveSession,
  SessionUser,
} from "@/src/utils/sessionManager";

type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthContextType = {
  userToken: string | null;
  userData: SessionUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
};

type AuthApiResponse = {
  token: string;
  user: SessionUser;
  message?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const session = await getSession();
        if (session) {
          setUserToken(session.token);
          setUserData(session.user);
        }
      } catch (error) {
        console.warn("Unable to restore session from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void restore();
  }, []);

  const applySession = async (response: AuthApiResponse) => {
    await saveSession(response.token, response.user);
    setUserToken(response.token);
    setUserData(response.user);
  };

  const requestAuth = async (
    endpoint: "/auth/login" | "/auth/signup",
    payload: object,
  ) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AuthApiResponse;

      if (!response.ok) {
        throw new Error(
          data.message ?? "Authentication failed. Please try again.",
        );
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          "Unable to reach server. Please check internet connection and API URL.",
        );
      }

      throw error;
    }
  };

  const login = async (payload: LoginPayload) => {
    const data = await requestAuth("/auth/login", payload);
    await applySession(data);
  };

  const signup = async (payload: SignupPayload) => {
    const data = await requestAuth("/auth/signup", payload);
    await applySession(data);
  };

  const logout = async () => {
    await clearStoredSession();
    setUserToken(null);
    setUserData(null);
  };

  const value = {
    userToken,
    userData,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
