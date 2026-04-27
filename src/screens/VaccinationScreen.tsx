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
import { BabyCareStackParamList, VaccinationLog } from "../types";

type Props = NativeStackScreenProps<BabyCareStackParamList, "Vaccination">;

const COMMON_VACCINES = [
  "BCG",
  "Polio (IPV)",
  "Hepatitis B",
  "Rotavirus",
  "Pneumococcal",
  "Diphtheria, Tetanus, Pertussis (DPT)",
  "Measles, Mumps, Rubella (MMR)",
  "Chickenpox",
  "Hepatitis A",
  "Influenza",
];

export const VaccinationScreen = ({ navigation }: Props) => {
  const {
    addVaccinationLog,
    updateVaccinationLog,
    deleteVaccinationLog,
    getVaccinationLogs,
  } = useBabyCare();

  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [customVaccineName, setCustomVaccineName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allVaccines = getVaccinationLogs();

  // Ensure all common vaccines exist
  const ensureCommonVaccines = async () => {
    for (const vaccineName of COMMON_VACCINES) {
      const exists = allVaccines.some((v) => v.vaccineName === vaccineName);
      if (!exists) {
        await addVaccinationLog({
          vaccineName,
          status: "pending",
        });
      }
    }
  };

  React.useEffect(() => {
    void ensureCommonVaccines();
  }, []);

  const filteredVaccines = allVaccines.filter((vaccine) => {
    if (filter === "completed") return vaccine.status === "completed";
    if (filter === "pending") return vaccine.status === "pending";
    return true;
  });

  const handleToggleVaccine = async (vaccine: VaccinationLog) => {
    const newStatus = vaccine.status === "completed" ? "pending" : "completed";
    const vaccineDate =
      newStatus === "completed"
        ? new Date().toISOString().split("T")[0]
        : undefined;

    await updateVaccinationLog(vaccine._id, {
      status: newStatus,
      vaccineDate,
    });
  };

  const handleAddCustomVaccine = async () => {
    if (!customVaccineName.trim()) {
      alert("Please enter vaccine name");
      return;
    }

    setIsSubmitting(true);
    try {
      await addVaccinationLog({
        vaccineName: customVaccineName,
        status: "pending",
      });
      setCustomVaccineName("");
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = allVaccines.filter(
    (v) => v.status === "completed",
  ).length;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Vaccination Tracker</Text>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            Completed: {completedCount} / {allVaccines.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    allVaccines.length > 0
                      ? (completedCount / allVaccines.length) * 100
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

        {/* Vaccine List */}
        {filteredVaccines.length === 0 ? (
          <Text style={styles.emptyText}>
            {filter === "completed"
              ? "No completed vaccines yet."
              : filter === "pending"
                ? "All vaccines completed!"
                : "No vaccines yet."}
          </Text>
        ) : (
          <FlatList
            data={filteredVaccines}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.vaccineItem}>
                <Pressable
                  style={styles.checkboxArea}
                  onPress={() => handleToggleVaccine(item)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      item.status === "completed" && styles.checkboxChecked,
                    ]}
                  >
                    {item.status === "completed" && (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                </Pressable>

                <View style={styles.vaccineInfo}>
                  <Text
                    style={[
                      styles.vaccineName,
                      item.status === "completed" &&
                        styles.vaccineNameCompleted,
                    ]}
                  >
                    {item.vaccineName}
                  </Text>
                  {item.status === "completed" && item.vaccineDate && (
                    <Text style={styles.vaccineDate}>
                      Completed:{" "}
                      {new Date(item.vaccineDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                <Pressable
                  onPress={() => deleteVaccinationLog(item._id)}
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
        <Text style={styles.addButtonText}>Add Vaccine</Text>
      </Pressable>

      {/* Add Custom Vaccine Modal */}
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
            <Text style={styles.modalTitle}>Add Custom Vaccine</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Vaccine name"
              value={customVaccineName}
              onChangeText={setCustomVaccineName}
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
                onPress={handleAddCustomVaccine}
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
  progressContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F3E8E1",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E86A6A",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1E4DA",
    backgroundColor: "#FFFFFF",
  },
  filterButtonActive: {
    backgroundColor: "#FFE8D5",
    borderColor: "#D4A64A",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  filterTextActive: {
    color: "#D4A64A",
    fontWeight: "700",
  },
  vaccineItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 10,
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
    borderColor: "#D4A64A",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#D4A64A",
  },
  vaccineInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vaccineName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  vaccineNameCompleted: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  vaccineDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
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
    marginBottom: 16,
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
