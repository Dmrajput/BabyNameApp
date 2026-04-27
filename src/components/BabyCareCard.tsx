import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

type BabyCareCardProps = {
  title: string;
  emoji: string;
  count?: number;
  color: string;
  textColor: string;
  onPress: () => void;
};

export const BabyCareCard = ({
  title,
  emoji,
  count,
  color,
  textColor,
  onPress,
}: BabyCareCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      style={styles.wrapper}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: color, transform: [{ scale }] },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>{emoji}</Text>
          {count !== undefined && (
            <View style={[styles.badge, { backgroundColor: textColor }]}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
};

type LogItemProps = {
  time: string;
  details: string;
  onDelete?: () => void;
};

export const LogItem = ({ time, details, onDelete }: LogItemProps) => {
  return (
    <View style={styles.logItem}>
      <View style={styles.logContent}>
        <Text style={styles.logTime}>{time}</Text>
        <Text style={styles.logDetails}>{details}</Text>
      </View>
      {onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={20}
            color="#B91C1C"
          />
        </Pressable>
      )}
    </View>
  );
};

type QuickStatsProps = {
  feedingCount: number;
  sleepMinutes: number;
  diaperCount: number;
  lastFeedingTime?: string;
};

export const QuickStats = ({
  feedingCount,
  sleepMinutes,
  diaperCount,
  lastFeedingTime,
}: QuickStatsProps) => {
  const sleepHours = Math.floor(sleepMinutes / 60);
  const sleepMins = sleepMinutes % 60;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>🍼 Feeding</Text>
        <Text style={styles.statValue}>{feedingCount}</Text>
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>😴 Sleep</Text>
        <Text style={styles.statValue}>
          {sleepHours}h {sleepMins}m
        </Text>
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>🧷 Diaper</Text>
        <Text style={styles.statValue}>{diaperCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "48%",
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 18,
    minHeight: 110,
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  emoji: {
    fontSize: 32,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  title: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
  },

  // LogItem styles
  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  logContent: {
    flex: 1,
  },
  logTime: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  logDetails: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },
  deleteButton: {
    padding: 6,
  },

  // QuickStats styles
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
});
