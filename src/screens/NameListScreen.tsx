import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { NameCard } from "../components/NameCard";
import { SearchBar } from "../components/SearchBar";
import { useFavorites } from "../context/FavoritesContext";
import { getNamesByCategory } from "../services/api";
import { BabyName, GenderFilter, HomeStackParamList } from "../types";

type Props = NativeStackScreenProps<HomeStackParamList, "NameList">;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const NameListScreen = ({ route, navigation }: Props) => {
  const { category, initialQuery } = route.params;
  const [query, setQuery] = useState(initialQuery ?? "");
  const [gender, setGender] = useState<GenderFilter>("All");
  const [selectedLetter, setSelectedLetter] = useState<string>("All");
  const [allNames, setAllNames] = useState<BabyName[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const loadNames = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getNamesByCategory(category);
        setAllNames(data);
      } catch (_error) {
        setError("Unable to load names. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadNames();
  }, [category]);

  const names = useMemo(() => {
    return allNames.filter((item) => {
      const matchesSearch =
        !query.trim() ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.meaning.toLowerCase().includes(query.toLowerCase());
      const matchesGender = gender === "All" || item.gender === gender;
      const matchesLetter =
        selectedLetter === "All" || item.name.startsWith(selectedLetter);

      return matchesSearch && matchesGender && matchesLetter;
    });
  }, [allNames, gender, query, selectedLetter]);

  return (
    <View style={styles.screen}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search name or meaning"
      />

      <View style={styles.genderRow}>
        <View style={styles.genderFiltersWrap}>
          {(["All", "Boy", "Girl"] as GenderFilter[]).map((item) => {
            const active = gender === item;
            return (
              <Pressable
                key={item}
                onPress={() => setGender(item)}
                style={[styles.filterChip, active && styles.activeFilterChip]}
              >
                <Text
                  style={[styles.filterText, active && styles.activeFilterText]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.inlineCountBadge}>
          <Text style={styles.inlineCountText}>
            {loading ? "..." : names.length}
          </Text>
        </View>
      </View>

      <FlatList
        horizontal
        data={["All", ...alphabet]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.alphabetRow}
        renderItem={({ item }) => {
          const active = selectedLetter === item;
          return (
            <Pressable
              onPress={() => setSelectedLetter(item)}
              style={[styles.alphaChip, active && styles.activeAlphaChip]}
            >
              <Text
                style={[styles.alphaText, active && styles.activeAlphaText]}
              >
                {item}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={names}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          loading ? (
            <ActivityIndicator color="#E86A6A" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No names match your filters.</Text>
        }
        renderItem={({ item }) => (
          <NameCard
            item={item}
            isFavorite={isFavorite(item._id)}
            onToggleFavorite={() => toggleFavorite(item)}
            onPress={() =>
              navigation.navigate("NameDetail", { nameId: item._id })
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F5",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  genderFiltersWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#FBCFE8",
  },
  filterText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#9D174D",
  },
  alphabetRow: {
    paddingBottom: 12,
  },
  alphaChip: {
    backgroundColor: "#FFFFFF",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  activeAlphaChip: {
    backgroundColor: "#BFDBFE",
  },
  alphaText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 12,
  },
  activeAlphaText: {
    color: "#1D4ED8",
  },
  inlineCountBadge: {
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#F4E7DF",
  },
  inlineCountText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: 24,
  },
  loader: {
    marginVertical: 10,
  },
  errorText: {
    color: "#B91C1C",
    marginBottom: 10,
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 30,
    fontSize: 15,
  },
});
