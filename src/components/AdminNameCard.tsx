import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BabyName } from "../types";

type AdminNameCardProps = {
  item: BabyName;
  onEdit: (item: BabyName) => void;
  onDelete: (item: BabyName) => void;
};

export const AdminNameCard = ({
  item,
  onEdit,
  onDelete,
}: AdminNameCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.rating}>{(item.rating ?? 0).toFixed(1)} / 5</Text>
      </View>

      <Text style={styles.meaning}>{item.meaning}</Text>

      <Text style={styles.meta}>
        {item.gender} | {item.category}
      </Text>
      <Text style={styles.meta}>{item.origin}</Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(item)}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#8A4B08" />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(item)}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={16}
            color="#991B1B"
          />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },
  rating: {
    fontSize: 12,
    fontWeight: "800",
    color: "#B45309",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  meaning: {
    color: "#475569",
    fontSize: 14,
    marginBottom: 6,
  },
  meta: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editBtn: {
    backgroundColor: "#FEF3C7",
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
  },
  editText: {
    color: "#8A4B08",
    fontWeight: "700",
  },
  deleteText: {
    color: "#991B1B",
    fontWeight: "700",
  },
});
