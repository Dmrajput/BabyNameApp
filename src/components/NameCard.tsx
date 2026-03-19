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

const getSafeRating = (item: BabyName): number => {
  const raw =
    (item as BabyName & { ratings?: unknown; Rating?: unknown }).rating ??
    (item as BabyName & { ratings?: unknown; Rating?: unknown }).ratings ??
    (item as BabyName & { ratings?: unknown; Rating?: unknown }).Rating;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (raw && typeof raw === "object" && "$numberDecimal" in raw) {
    const decimal = (raw as { $numberDecimal?: string }).$numberDecimal;
    const parsed = Number(decimal);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const NameCard = ({
  item,
  isFavorite,
  onToggleFavorite,
  onPress,
}: NameCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const safeRating = getSafeRating(item);

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
          <Text style={styles.meta}>
            {item.gender} • {item.origin}
          </Text>
          <Text style={styles.rating}>Rating: {safeRating.toFixed(1)} / 5</Text>
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
  rating: {
    marginTop: 4,
    fontSize: 12,
    color: "#B45309",
    fontWeight: "700",
  },
});
