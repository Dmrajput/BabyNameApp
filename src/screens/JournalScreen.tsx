import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useBabyCare } from "../context/BabyCareContext";
import { BabyCareStackParamList } from "../types";

type Props = NativeStackScreenProps<BabyCareStackParamList, "Journal">;

export const JournalScreen = ({ navigation }: Props) => {
  const { getJournalEntries, deleteJournalEntry } = useBabyCare();

  const entries = getJournalEntries();

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Delete this memory?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => deleteJournalEntry(id),
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Memory Journal</Text>

        {entries.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyEmoji}>📸</Text>
            <Text style={styles.emptyText}>No memories yet.</Text>
            <Text style={styles.emptySubtext}>
              Create your first memory to get started!
            </Text>
          </View>
        ) : (
          entries.map((item) => (
            <Pressable
              key={item._id}
              style={styles.entryCard}
              onPress={() =>
                navigation.navigate("AddJournal", { editId: item._id })
              }
            >
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.entryImage}
                />
              )}

              <View style={styles.entryContent}>
                <Text style={styles.entryDate}>
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>

                <Text style={styles.entryTitle}>{item.title}</Text>

                <Text style={styles.entryDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>

              <Pressable
                onPress={() => handleDelete(item._id)}
                style={styles.deleteIconButton}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={20}
                  color="#B91C1C"
                />
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate("AddJournal" as never, {} as never)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Memory</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F5",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
  entryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1E4DA",
    flexDirection: "row",
  },
  entryImage: {
    width: 80,
    height: 80,
    backgroundColor: "#F3E8E1",
  },
  entryContent: {
    flex: 1,
    padding: 12,
  },
  entryDate: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  entryDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  deleteIconButton: {
    padding: 12,
    justifyContent: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#E86A6A",
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
