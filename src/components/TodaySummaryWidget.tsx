import React from "react";
import { StyleSheet, Text, View } from "react-native";

type TodaySummaryWidgetProps = {
  week: number;
  feedingCount: number;
  sleepMinutes: number;
  diaperCount: number;
  lastFeedingTime?: string;
};

export const TodaySummaryWidget = ({
  week,
  feedingCount,
  sleepMinutes,
  diaperCount,
  lastFeedingTime,
}: TodaySummaryWidgetProps) => {
  const sleepHours = Math.floor(sleepMinutes / 60);
  const sleepMins = sleepMinutes % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today Summary</Text>

      <View style={styles.statsGrid}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Week</Text>
          <Text style={styles.statValue}>{week}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>🍼 Feeding</Text>
          <Text style={styles.statValue}>{feedingCount}</Text>
          {lastFeedingTime && (
            <Text style={styles.statDetail}>{lastFeedingTime}</Text>
          )}
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>😴 Sleep</Text>
          <Text style={styles.statValue}>
            {sleepHours}h {sleepMins}m
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>🧷 Diapers</Text>
          <Text style={styles.statValue}>{diaperCount}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  stat: {
    width: "48%",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#E86A6A",
  },
  statDetail: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
});
