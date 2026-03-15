import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import { BottomTabNavigator } from "./BottomTabNavigator";

type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Signup: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FFF9F5",
    card: "#FFFFFF",
    text: "#1F2937",
    border: "#F3E8E1",
    primary: "#E86A6A",
  },
};

export const AppNavigator = () => {
  return (
    <NavigationContainer theme={appTheme}>
      <RootStack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        <RootStack.Screen name="MainTabs" component={BottomTabNavigator} />
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Signup" component={SignupScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
