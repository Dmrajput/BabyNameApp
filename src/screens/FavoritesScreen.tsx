import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { NameCard } from "../components/NameCard";
import { useFavorites } from "../context/FavoritesContext";

export const FavoritesScreen = () => {
  const navigation = useNavigation<any>();
  const {
    favoriteNames,
    favoriteCount,
    isFavorite,
    isLoading,
    removeFavorite,
  } = useFavorites();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Favorite Names</Text>
      <Text style={styles.subheading}>Your saved shortlist appears here.</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{favoriteCount} saved</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#E86A6A" />
        </View>
      ) : (
        <FlatList
          data={favoriteNames}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No favorites yet. Add from name list.
            </Text>
          }
          renderItem={({ item }) => (
            <NameCard
              item={item}
              isFavorite={isFavorite(item._id)}
              onToggleFavorite={() => removeFavorite(item._id)}
              onPress={() => {
                if (item.category === "AI") {
                  Alert.alert(
                    "AI name details are already shown on this card.",
                  );
                  return;
                }

                navigation.navigate(
                  "HomeTab" as never,
                  {
                    screen: "NameDetail",
                    params: { nameId: item._id },
                  } as never,
                );
              }}
            />
          )}
        />
      )}
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
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  countBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FDE7D9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  countText: {
    color: "#9A3412",
    fontSize: 12,
    fontWeight: "700",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 24,
  },
});
