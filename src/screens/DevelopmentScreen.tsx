import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useBabyCare } from "../context/BabyCareContext";
import { WEEKLY_DEVELOPMENT } from "../data/weeklyDevelopment";
import { BabyCareStackParamList } from "../types";

type Props = NativeStackScreenProps<BabyCareStackParamList, "Development">;

export const DevelopmentScreen = ({ navigation }: Props) => {
  const { developmentMode, setDevelopmentMode, getWeekNumber, getWeekData } =
    useBabyCare();

  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber());
  const flatListRef = useRef<FlatList>(null);

  const weekData = getWeekData(selectedWeek);
  const currentWeek = getWeekNumber();

  const handleModeChange = async (mode: "fruit" | "animal" | "object") => {
    await setDevelopmentMode(mode);
  };

  const getComparisonText = () => {
    if (!weekData) return "";
    switch (developmentMode) {
      case "fruit":
        return weekData.fruitComparison;
      case "animal":
        return weekData.animalComparison;
      case "object":
        return weekData.objectComparison;
    }
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Baby Development</Text>

      {/* Mode Toggle */}
      <View style={styles.modeToggleContainer}>
        {(["fruit", "animal", "object"] as const).map((mode) => (
          <Pressable
            key={mode}
            style={[
              styles.modeButton,
              developmentMode === mode && styles.modeButtonActive,
            ]}
            onPress={() => handleModeChange(mode)}
          >
            <Text
              style={[
                styles.modeButtonText,
                developmentMode === mode && styles.modeButtonTextActive,
              ]}
            >
              {mode === "fruit"
                ? "🍎 Fruit"
                : mode === "animal"
                  ? "🐰 Animal"
                  : "💻 Object"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Week Selector */}
      <Text style={styles.subheading}>Select Week</Text>
      <FlatList
        ref={flatListRef}
        data={WEEKLY_DEVELOPMENT}
        keyExtractor={(item) => item.week.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekListContent}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.weekButton,
              selectedWeek === item.week && styles.weekButtonActive,
              currentWeek === item.week && styles.weekButtonCurrent,
            ]}
            onPress={() => setSelectedWeek(item.week)}
          >
            <Text
              style={[
                styles.weekButtonText,
                selectedWeek === item.week && styles.weekButtonTextActive,
              ]}
            >
              {item.week}
            </Text>
          </Pressable>
        )}
      />

      {/* Week Display */}
      {weekData && (
        <View style={styles.weekDisplayContainer}>
          <Text style={styles.comparisonLabel}>Week {selectedWeek}</Text>

          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonEmoji}>
              {developmentMode === "fruit"
                ? weekData.fruitComparison.split(" ")[0]
                : developmentMode === "animal"
                  ? weekData.animalComparison.split(" ")[0]
                  : weekData.objectComparison.split(" ")[0]}
            </Text>
            <Text style={styles.comparisonText}>{getComparisonText()}</Text>
          </View>

          {weekData.size && (
            <View style={styles.sizeCard}>
              <Text style={styles.cardTitle}>Size & Weight</Text>
              <View style={styles.sizeRow}>
                <View style={styles.sizeBox}>
                  <Text style={styles.sizeLabel}>Length</Text>
                  <Text style={styles.sizeValue}>{weekData.size.length}</Text>
                </View>
                <View style={styles.sizeBox}>
                  <Text style={styles.sizeLabel}>Weight</Text>
                  <Text style={styles.sizeValue}>{weekData.size.weight}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Baby Development</Text>
            {weekData.babyDevelopment.map((item, idx) => (
              <Text key={idx} style={styles.bulletPoint}>
                • {item}
              </Text>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Mom May Feel</Text>
            {weekData.motherFeel.map((item, idx) => (
              <Text key={idx} style={styles.bulletPoint}>
                • {item}
              </Text>
            ))}
          </View>
        </View>
      )}

      {currentWeek > 0 && (
        <View style={styles.currentWeekBanner}>
          <MaterialCommunityIcons
            name="information"
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.currentWeekText}>
            You are currently in week {currentWeek}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F5",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
  },
  subheading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 10,
  },
  modeToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E4DA",
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#B3E5FC",
    borderColor: "#4A90C9",
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  modeButtonTextActive: {
    color: "#4A90C9",
    fontWeight: "700",
  },
  weekListContent: {
    paddingVertical: 12,
    paddingRight: 16,
  },
  weekButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E4DA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  weekButtonActive: {
    backgroundColor: "#B3E5FC",
    borderColor: "#4A90C9",
  },
  weekButtonCurrent: {
    borderWidth: 2,
    borderColor: "#E86A6A",
  },
  weekButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  weekButtonTextActive: {
    color: "#4A90C9",
  },
  weekDisplayContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  comparisonCard: {
    backgroundColor: "#B3E5FC",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  comparisonEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  comparisonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A90C9",
    textAlign: "center",
  },
  sizeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
  },
  sizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sizeBox: {
    flex: 1,
    alignItems: "center",
  },
  sizeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  sizeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E86A6A",
  },
  bulletPoint: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 8,
    lineHeight: 18,
  },
  currentWeekBanner: {
    flexDirection: "row",
    backgroundColor: "#4A90C9",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  currentWeekText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
});
