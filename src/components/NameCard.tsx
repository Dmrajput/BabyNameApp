import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { BabyName } from "../types";

type NameCardProps = {
  item: BabyName;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
};

const getFavoriteCount = (item: BabyName): number => {
  const value = item.favoriteCount;

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  return 0;
};

const formatUsers = (count: number): string => {
  return new Intl.NumberFormat("en-US").format(count);
};

export const NameCard = ({
  item,
  isFavorite,
  onToggleFavorite,
  onPress,
}: NameCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const favoriteCount = getFavoriteCount(item);

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.985,
      duration: 110,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 110,
      useNativeDriver: true,
    }).start();
  };

  const onPressFavorite = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.2,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleFavorite();
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.left}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meaning}>{item.meaning}</Text>

          <View style={styles.countRow}>
            <MaterialCommunityIcons name="heart" size={15} color="#EF4444" />
            <Text style={styles.countText}>
              {formatUsers(favoriteCount)} users
            </Text>
          </View>
        </View>

        <Pressable onPress={onPressFavorite} hitSlop={12}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#EF4444" : "#64748B"}
            />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 24,
    color: "#1F2937",
    fontWeight: "800",
    marginBottom: 4,
  },
  meaning: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: "#6B7280",
  },
  countRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },
});
