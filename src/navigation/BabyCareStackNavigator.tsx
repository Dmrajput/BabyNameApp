import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { BabyCareScreen } from "../screens/BabyCareScreen";
import { FeedingScreen } from "../screens/FeedingScreen";
import { SleepScreen } from "../screens/SleepScreen";
import { DiaperScreen } from "../screens/DiaperScreen";
import { VaccinationScreen } from "../screens/VaccinationScreen";
import { PregnancyScreen } from "../screens/PregnancyScreen";
import { DevelopmentScreen } from "../screens/DevelopmentScreen";
import { MilestonesScreen } from "../screens/MilestonesScreen";
import { JournalScreen } from "../screens/JournalScreen";
import { AddJournalScreen } from "../screens/AddJournalScreen";
import { BabyCareStackParamList } from "../types";

const Stack = createNativeStackNavigator<BabyCareStackParamList>();

export const BabyCareStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#FFF9F5" },
        headerTintColor: "#334155",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="BabyCareHome"
        component={BabyCareScreen}
        options={{ title: "Baby Care" }}
      />
      <Stack.Screen
        name="Feeding"
        component={FeedingScreen}
        options={{ title: "Feeding Tracker" }}
      />
      <Stack.Screen
        name="Sleep"
        component={SleepScreen}
        options={{ title: "Sleep Tracker" }}
      />
      <Stack.Screen
        name="Diaper"
        component={DiaperScreen}
        options={{ title: "Diaper Log" }}
      />
      <Stack.Screen
        name="Vaccination"
        component={VaccinationScreen}
        options={{ title: "Vaccination Tracker" }}
      />
      <Stack.Screen
        name="Pregnancy"
        component={PregnancyScreen}
        options={{ title: "Pregnancy" }}
      />
      <Stack.Screen
        name="Development"
        component={DevelopmentScreen}
        options={{ title: "Development" }}
      />
      <Stack.Screen
        name="Milestones"
        component={MilestonesScreen}
        options={{ title: "Milestones" }}
      />
      <Stack.Screen
        name="Journal"
        component={JournalScreen}
        options={{ title: "Memory Journal" }}
      />
      <Stack.Screen
        name="AddJournal"
        component={AddJournalScreen}
        options={{ title: "Add Memory" }}
      />
    </Stack.Navigator>
  );
};
