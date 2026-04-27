import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { BabyCareProvider } from "./src/context/BabyCareContext";
import { CountryProvider } from "./src/context/CountryContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { StateProvider } from "./src/context/StateContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { apiService } from "./src/services/api";

// Inner component to access auth context
function AppWithProviders() {
  const { token } = useAuth();

  useEffect(() => {
    // Initialize API service on app start
    const initializeAPI = async () => {
      await apiService.initialize();
      // If user has token, set it
      if (token) {
        await apiService.setTokens(token);
      }
    };
    initializeAPI();
  }, [token]);

  return (
    <CountryProvider>
      <StateProvider>
        <FavoritesProvider>
          <BabyCareProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </BabyCareProvider>
        </FavoritesProvider>
      </StateProvider>
    </CountryProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppWithProviders />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
