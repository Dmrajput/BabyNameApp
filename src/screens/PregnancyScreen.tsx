import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useBabyCare } from "../context/BabyCareContext";
import { BabyCareStackParamList } from "../types";

type Props = NativeStackScreenProps<BabyCareStackParamList, "Pregnancy">;

export const PregnancyScreen = ({ navigation }: Props) => {
  const {
    pregnancyData,
    setPregnancyStartDate,
    getWeekNumber,
    getWeekData,
    getCurrentInsight,
  } = useBabyCare();

  const [isEditingDate, setIsEditingDate] = useState(!pregnancyData);
  const [dateInput, setDateInput] = useState(
    pregnancyData
      ? pregnancyData.startDate
      : new Date(Date.now() - 7 * 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
  );

  const handleConfirmDate = async () => {
    if (!dateInput) {
      alert("Please enter a date");
      return;
    }

    try {
      await setPregnancyStartDate(dateInput);
      setIsEditingDate(false);
    } catch (err) {
      alert("Error saving date");
    }
  };

  const week = getWeekNumber();
  const weekData = getWeekData(week);
  const insight = getCurrentInsight();

  if (isEditingDate || !pregnancyData) {
    return (
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Start Pregnancy Tracking</Text>
        <Text style={styles.subheading}>
          Enter your pregnancy start date to begin tracking.
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Pregnancy Start Date</Text>
          <Text style={styles.hint}>
            (Format: YYYY-MM-DD, e.g., 2025-10-15)
          </Text>
          <TextInput
            style={styles.dateInput}
            placeholder="2025-10-15"
            value={dateInput}
            onChangeText={setDateInput}
          />
        </View>

        <Pressable style={styles.button} onPress={handleConfirmDate}>
          <Text style={styles.buttonText}>Start Tracking</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Your Pregnancy</Text>
          <Text style={styles.weekText}>Week {week} of 40</Text>
        </View>
        <Pressable
          onPress={() => setIsEditingDate(true)}
          style={styles.editButton}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#E86A6A" />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Progress</Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${(week / 40) * 100}%` }]}
          />
        </View>
      </View>

      {/* Size & Development */}
      {weekData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>

          <View style={styles.comparisonRow}>
            <View style={styles.comparisonBox}>
              <Text style={styles.comparisonEmoji}>🍎</Text>
              <Text style={styles.comparisonText}>
                {weekData.fruitComparison}
              </Text>
            </View>
          </View>

          {weekData.size && (
            <View style={styles.sizeInfo}>
              <Text style={styles.sizeLabel}>Size & Weight</Text>
              <Text style={styles.sizeValue}>
                {weekData.size.length} • {weekData.size.weight}
              </Text>
            </View>
          )}

          <Text style={styles.subTitle}>Baby Development</Text>
          {weekData.babyDevelopment.map((item, idx) => (
            <Text key={idx} style={styles.bulletPoint}>
              • {item}
            </Text>
          ))}

          <Text style={[styles.subTitle, { marginTop: 16 }]}>You May Feel</Text>
          {weekData.motherFeel.map((item, idx) => (
            <Text key={idx} style={styles.bulletPoint}>
              • {item}
            </Text>
          ))}
        </View>
      )}

      {/* Daily Insight */}
      {insight && (
        <View style={[styles.card, styles.insightCard]}>
          <Text style={styles.insightEmoji}>{insight.icon}</Text>
          <Text style={styles.insightText}>{insight.text}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F5",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  weekText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E86A6A",
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  hint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 8,
    fontStyle: "italic",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#F1E4DA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
  },
  button: {
    backgroundColor: "#E86A6A",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  progressContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#F3E8E1",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFB3D9",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  comparisonBox: {
    alignItems: "center",
    backgroundColor: "#FFF9F5",
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
  },
  comparisonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  comparisonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  sizeInfo: {
    backgroundColor: "#FFF9F5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  sizeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  sizeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E86A6A",
  },
  bulletPoint: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 6,
    lineHeight: 18,
  },
  insightCard: {
    backgroundColor: "#FFB3D9",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 24,
  },
  insightEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B1A54",
    textAlign: "center",
    lineHeight: 20,
  },
});
