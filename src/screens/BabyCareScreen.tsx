import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { BabyCareCard } from "../components/BabyCareCard";
import { TodaySummaryWidget } from "../components/TodaySummaryWidget";
import { useBabyCare } from "../context/BabyCareContext";
import { BabyCareStackParamList } from "../types";

type Props = NativeStackScreenProps<BabyCareStackParamList, "BabyCareHome">;

export const BabyCareScreen = ({ navigation }: Props) => {
  const { isLoading, todayStats, pregnancyData, getWeekNumber } = useBabyCare();

  const week = getWeekNumber();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E86A6A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Baby Care</Text>
      <Text style={styles.subheading}>Track your baby's daily care activities.</Text>

      {/* Today Summary (only if pregnancy data exists) */}
      {pregnancyData && (
        <TodaySummaryWidget
          week={week}
          feedingCount={todayStats.feedingCount}
          sleepMinutes={todayStats.sleepMinutes}
          diaperCount={todayStats.diaperCount}
        />
      )}

      {/* Original Cards */}
      <View style={styles.gridContainer}>
        <BabyCareCard
          title="Feeding"
          emoji="🍼"
          count={todayStats.feedingCount}
          color="#FFD5E5"
          textColor="#C94A6D"
          onPress={() => navigation.navigate("Feeding")}
        />
        <BabyCareCard
          title="Sleep"
          emoji="😴"
          count={Math.floor(todayStats.sleepMinutes / 60)}
          color="#D5E8FF"
          textColor="#4A90C9"
          onPress={() => navigation.navigate("Sleep")}
        />
        <BabyCareCard
          title="Diaper"
          emoji="🧷"
          count={todayStats.diaperCount}
          color="#D5E8D5"
          textColor="#4A9D4A"
          onPress={() => navigation.navigate("Diaper")}
        />
        <BabyCareCard
          title="Vaccination"
          emoji="💉"
          color="#FFE8D5"
          textColor="#D4A64A"
          onPress={() => navigation.navigate("Vaccination")}
        />

        {/* New Cards */}
        <BabyCareCard
          title="Pregnancy"
          emoji="🤰"
          color="#FFB3D9"
          textColor="#8B1A54"
          onPress={() => navigation.navigate("Pregnancy")}
        />
        <BabyCareCard
          title="Development"
          emoji="👶"
          color="#B3E5FC"
          textColor="#0277BD"
          onPress={() => navigation.navigate("Development")}
        />
        <BabyCareCard
          title="Milestones"
          emoji="⭐"
          color="#FFEB99"
          textColor="#F57F17"
          onPress={() => navigation.navigate("Milestones")}
        />
        <BabyCareCard
          title="Journal"
          emoji="📸"
          color="#C8E6C9"
          textColor="#2E7D32"
          onPress={() => navigation.navigate("Journal")}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F5",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9F5",
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
});
