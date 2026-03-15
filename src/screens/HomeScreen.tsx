import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { CategoryCard } from "../components/CategoryCard";
import { CategoryItem, HomeStackParamList } from "../types";

type Props = NativeStackScreenProps<HomeStackParamList, "Home">;

const categories: CategoryItem[] = [
  { id: "Hindu", title: "Hindu Names", icon: "om", color: "#FFE6D9" },
  {
    id: "Muslim",
    title: "Muslim Names",
    icon: "star-and-crescent",
    color: "#EAF8E7",
  },
  { id: "Jain", title: "Jain Names", icon: "leaf", color: "#E9FCEB" },
  { id: "Buddhist", title: "Buddhist Names", icon: "sun", color: "#FFF4D6" },
  {
    id: "Modern",
    title: "Modern Names",
    icon: "rocket",
    color: "#E6F1FF",
  },
  {
    id: "Trending",
    title: "Trending Names",
    icon: "chart-line",
    color: "#FFF2CC",
  },
  { id: "Persian", title: "Persian Names", icon: "gem", color: "#F3E8FF" },
  { id: "Arabic", title: "Arabic Names", icon: "moon", color: "#E8F9FF" },
  { id: "Royal", title: "Royal Names", icon: "crown", color: "#FFE7D9" },
];

export const HomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Baby Name Finder</Text>
      <Text style={styles.subheading}>
        Find beautiful names with meaning and origin.
      </Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.column}
        renderItem={({ item }) => (
          <CategoryCard
            title={item.title}
            icon={item.icon}
            color={item.color}
            onPress={() =>
              navigation.navigate("NameList", {
                category: item.id,
                title: item.title,
              })
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
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  column: {
    justifyContent: "space-between",
  },
});
