import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./src/context/AuthContext";
import { CountryProvider } from "./src/context/CountryContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { StateProvider } from "./src/context/StateContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CountryProvider>
          <StateProvider>
            <FavoritesProvider>
              <StatusBar style="dark" />
              <AppNavigator />
            </FavoritesProvider>
          </StateProvider>
        </CountryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
