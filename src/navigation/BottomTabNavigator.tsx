import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { AdminScreen } from "../screens/AdminScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { GeneratorScreen } from "../screens/GeneratorScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { TabParamList } from "../types";
import { BabyCareStackNavigator } from "./BabyCareStackNavigator";
import { HomeStackNavigator } from "./HomeStackNavigator";

const Tab = createBottomTabNavigator<TabParamList>();
const ADMIN_EMAIL = "divyarajsinh5216@gmail.com";

export const BottomTabNavigator = () => {
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin =
    (userData?.email ?? "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const baseTabBarHeight = 64;
  const tabBarPaddingBottom = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#E86A6A",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          height: baseTabBarHeight + insets.bottom,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === "HomeTab") {
            return (
              <MaterialCommunityIcons
                name="home-heart"
                size={size}
                color={color}
              />
            );
          }

          if (route.name === "Generator") {
            return (
              <MaterialCommunityIcons
                name="creation"
                size={size}
                color={color}
              />
            );
          }

          if (route.name === "BabyCare") {
            return (
              <MaterialCommunityIcons
                name="baby-face"
                size={size}
                color={color}
              />
            );
          }

          if (route.name === "Profile") {
            return (
              <MaterialCommunityIcons
                name="account-circle"
                size={size}
                color={color}
              />
            );
          }

          if (route.name === "Admin") {
            return (
              <MaterialCommunityIcons
                name="shield-crown"
                size={size}
                color={color}
              />
            );
          }

          return (
            <MaterialCommunityIcons
              name="heart-multiple"
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Generator"
        component={GeneratorScreen}
        options={{ title: "Generator" }}
      />
      <Tab.Screen
        name="BabyCare"
        component={BabyCareStackNavigator}
        options={{ title: "BabyCare" }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: "Favorites" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      {isAdmin ? (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{ title: "Admin" }}
        />
      ) : null}
    </Tab.Navigator>
  );
};
