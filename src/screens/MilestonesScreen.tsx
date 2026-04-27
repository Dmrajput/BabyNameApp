import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useBabyCare } from "../context/BabyCareContext";
import { BabyCareStackParamList, Milestone } from "../types";

type Props = NativeStackScreenProps<BabyCareStackParamList, "Milestones">;

export const MilestonesScreen = ({ navigation }: Props) => {
  const {
    milestones,
    updateMilestone,
    addMilestone,
    deleteMilestone,
    getMilestonesByCategory,
  } = useBabyCare();

  const [category, setCategory] = useState<"pregnancy" | "baby">("pregnancy");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryMilestones = getMilestonesByCategory(category);

  const filteredMilestones = categoryMilestones.filter((m) => {
    if (filter === "completed") return m.completed;
    if (filter === "pending") return !m.completed;
    return true;
  });

  const handleToggleComplete = async (milestone: Milestone) => {
    await updateMilestone(milestone._id, {
      completed: !milestone.completed,
      completedDate: !milestone.completed
        ? new Date().toISOString().split("T")[0]
        : undefined,
    });
  };

  const handleAddMilestone = async () => {
    if (!newTitle.trim()) {
      alert("Please enter a milestone title");
      return;
    }

    setIsSubmitting(true);
    try {
      await addMilestone({
        category,
        title: newTitle,
        completed: false,
        notes: editingNote || undefined,
      });
      setNewTitle("");
      setEditingNote("");
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = categoryMilestones.filter((m) => m.completed).length;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Milestones</Text>

        {/* Category Tabs */}
        <View style={styles.tabContainer}>
          {(["pregnancy", "baby"] as const).map((cat) => (
            <Pressable
              key={cat}
              style={[styles.tab, category === cat && styles.tabActive]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.tabText,
                  category === cat && styles.tabTextActive,
                ]}
              >
                {cat === "pregnancy" ? "🤰 Pregnancy" : "👶 Baby"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            Completed: {completedCount} / {categoryMilestones.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    categoryMilestones.length > 0
                      ? (completedCount / categoryMilestones.length) * 100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(["all", "pending", "completed"] as const).map((f) => (
            <Pressable
              key={f}
              style={[
                styles.filterButton,
                filter === f && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Milestones List */}
        {filteredMilestones.length === 0 ? (
          <Text style={styles.emptyText}>
            {filter === "completed"
              ? "No completed milestones yet."
              : filter === "pending"
                ? "All milestones completed! 🎉"
                : "No milestones yet."}
          </Text>
        ) : (
          <FlatList
            data={filteredMilestones}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.milestoneItem}>
                <Pressable
                  onPress={() => handleToggleComplete(item)}
                  style={styles.checkboxArea}
                >
                  <View
                    style={[
                      styles.checkbox,
                      item.completed && styles.checkboxChecked,
                    ]}
                  >
                    {item.completed && (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                </Pressable>

                <View style={styles.milestoneInfo}>
                  <Text
                    style={[
                      styles.milestoneTitle,
                      item.completed && styles.milestoneTitleCompleted,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {item.completed && item.completedDate && (
                    <Text style={styles.completedDate}>
                      Completed:{" "}
                      {new Date(item.completedDate).toLocaleDateString()}
                    </Text>
                  )}
                  {item.notes && (
                    <Text style={styles.milestoneNote}>{item.notes}</Text>
                  )}
                </View>

                <Pressable
                  onPress={() => deleteMilestone(item._id)}
                  style={styles.deleteButton}
                >
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={18}
                    color="#B91C1C"
                  />
                </Pressable>
              </View>
            )}
          />
        )}
      </ScrollView>

      {/* Add Button */}
      <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Milestone</Text>
      </Pressable>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowAddModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Milestone</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Milestone title"
              value={newTitle}
              onChangeText={setNewTitle}
              editable={!isSubmitting}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Add a note (optional)"
              value={editingNote}
              onChangeText={setEditingNote}
              multiline
              numberOfLines={3}
              editable={!isSubmitting}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalButtonAdd,
                  isSubmitting && styles.modalButtonDisabled,
                ]}
                onPress={handleAddMilestone}
                disabled={isSubmitting}
              >
                <Text style={styles.modalButtonText}>
                  {isSubmitting ? "Adding..." : "Add"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E4DA",
    marginRight: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#FFB3D9",
    borderColor: "#C94A6D",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#C94A6D",
    fontWeight: "700",
  },
  progressContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F3E8E1",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFB3D9",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F1E4DA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#FFB3D9",
    borderColor: "#C94A6D",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#C94A6D",
    fontWeight: "700",
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  checkboxArea: {
    padding: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFB3D9",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FFB3D9",
  },
  milestoneInfo: {
    flex: 1,
    marginLeft: 12,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  milestoneTitleCompleted: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  completedDate: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 3,
  },
  milestoneNote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  deleteButton: {
    padding: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 24,
  },
  addButton: {
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#F1E4DA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 12,
  },
  modalTextarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F3E8E1",
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  modalButtonAdd: {
    backgroundColor: "#E86A6A",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});
