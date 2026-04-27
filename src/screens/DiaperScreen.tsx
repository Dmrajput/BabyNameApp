import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { LogItem } from "../components/BabyCareCard";
import { useBabyCare } from "../context/BabyCareContext";
import { BabyCareStackParamList } from "../types";

type Props = NativeStackScreenProps<BabyCareStackParamList, "Diaper">;

export const DiaperScreen = ({ navigation }: Props) => {
  const { addDiaperLog, getDiaperLogsByDate, deleteDiaperLog } = useBabyCare();

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = getDiaperLogsByDate(today);

  const handleAddDiaper = async (type: "wet" | "dirty" | "both") => {
    try {
      await addDiaperLog({
        date: today,
        type,
      });
    } catch (error) {
      console.error("Error adding diaper log:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Count types
  const wetCount = todayLogs.filter((log) => log.type === "wet").length;
  const dirtyCount = todayLogs.filter((log) => log.type === "dirty").length;
  const bothCount = todayLogs.filter((log) => log.type === "both").length;
  const totalWet = wetCount + bothCount;
  const totalDirty = dirtyCount + bothCount;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Diaper Log</Text>

      {/* Quick Log Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.quickButton}
          onPress={() => handleAddDiaper("wet")}
        >
          <Text style={styles.buttonEmoji}>💧</Text>
          <Text style={styles.buttonLabel}>Wet</Text>
        </Pressable>

        <Pressable
          style={styles.quickButton}
          onPress={() => handleAddDiaper("dirty")}
        >
          <Text style={styles.buttonEmoji}>💩</Text>
          <Text style={styles.buttonLabel}>Dirty</Text>
        </Pressable>

        <Pressable
          style={styles.quickButton}
          onPress={() => handleAddDiaper("both")}
        >
          <Text style={styles.buttonEmoji}>🔄</Text>
          <Text style={styles.buttonLabel}>Both</Text>
        </Pressable>
      </View>

      {/* Today's Count Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryEmoji}>💧</Text>
          <Text style={styles.summaryLabel}>Wet</Text>
          <Text style={styles.summaryCount}>{totalWet}</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryEmoji}>💩</Text>
          <Text style={styles.summaryLabel}>Dirty</Text>
          <Text style={styles.summaryCount}>{totalDirty}</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryEmoji}>📊</Text>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryCount}>{totalWet + totalDirty}</Text>
        </View>
      </View>

      {/* Logs List */}
      <View style={styles.logsSection}>
        <Text style={styles.logsHeading}>Today's Logs</Text>

        {todayLogs.length === 0 ? (
          <Text style={styles.emptyText}>No diaper logs yet.</Text>
        ) : (
          <FlatList
            data={todayLogs}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <LogItem
                time={formatTime(item.createdAt)}
                details={
                  item.type === "wet"
                    ? "Wet"
                    : item.type === "dirty"
                      ? "Dirty"
                      : "Wet & Dirty"
                }
                onDelete={() => deleteDiaperLog(item._id)}
              />
            )}
          />
        )}
      </View>
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
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F1E4DA",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 24,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#D5E8D5",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B7E4B7",
  },
  summaryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A9D4A",
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#4A9D4A",
  },
  logsSection: {
    marginBottom: 24,
  },
  logsHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 24,
  },
});
