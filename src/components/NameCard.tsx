import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { BabyName } from "../types";

type NameCardProps = {
  item: BabyName;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
  compact?: boolean;
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

const formatGender = (value: BabyName["gender"]): string => {
  if (value === "Boy" || value === "Male") {
    return "Male";
  }

  if (value === "Girl" || value === "Female") {
    return "Female";
  }

  return "Unisex";
};

const getOriginLabel = (item: BabyName): string => {
  const origin = item.origin?.toString().trim();
  const state = item.state?.toString().trim();

  return origin || state || "Unknown";
};

const getRatingValue = (item: BabyName): number => {
  if (typeof item.rating === "number" && Number.isFinite(item.rating)) {
    return Math.max(0, Math.min(5, item.rating));
  }

  return 0;
};

export const NameCard = ({
  item,
  isFavorite,
  onToggleFavorite,
  onPress,
  compact = false,
}: NameCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const favoriteCount = getFavoriteCount(item);
  const genderLabel = formatGender(item.gender);
  const originLabel = getOriginLabel(item);
  const ratingValue = getRatingValue(item);

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
      <Animated.View
        style={[
          styles.card,
          compact && styles.cardCompact,
          { transform: [{ scale }] },
        ]}
      >
        <View style={styles.left}>
          <Text style={[styles.name, compact && styles.nameCompact]}>
            {item.name}
          </Text>
          <Text
            style={[styles.meaning, compact && styles.meaningCompact]}
            numberOfLines={2}
          >
            {item.meaning}
          </Text>

          <Text style={[styles.meta, compact && styles.metaCompact]}>
            {genderLabel} | {originLabel}
          </Text>

          <View style={[styles.statsRow, compact && styles.statsRowCompact]}>
            <Text
              style={[styles.ratingText, compact && styles.ratingTextCompact]}
            >
              Rating {ratingValue.toFixed(1)} / 5
            </Text>
            <MaterialCommunityIcons
              name="heart"
              size={compact ? 13 : 15}
              color="#EF4444"
            />
            <Text
              style={[
                styles.favoriteText,
                compact && styles.favoriteTextCompact,
              ]}
            >
              {formatUsers(favoriteCount)} users
            </Text>
          </View>
        </View>

        <Pressable onPress={onPressFavorite} hitSlop={12}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={compact ? 21 : 24}
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
  cardCompact: {
    borderRadius: 14,
    padding: 10,
    marginBottom: 6,
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
  nameCompact: {
    fontSize: 18,
    marginBottom: 2,
  },
  meaning: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 4,
  },
  meaningCompact: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 2,
    lineHeight: 17,
  },
  meta: {
    fontSize: 12,
    color: "#888888",
  },
  metaCompact: {
    fontSize: 12,
    marginTop: 1,
  },
  statsRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statsRowCompact: {
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "700",
  },
  ratingTextCompact: {
    fontSize: 12,
  },
  favoriteText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "700",
  },
  favoriteTextCompact: {
    fontSize: 12,
  },
});
