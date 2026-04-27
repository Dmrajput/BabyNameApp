import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { LogItem } from "../components/BabyCareCard";
import { useBabyCare } from "../context/BabyCareContext";
import { BabyCareStackParamList } from "../types";

type Props = NativeStackScreenProps<BabyCareStackParamList, "Feeding">;

export const FeedingScreen = ({ navigation }: Props) => {
  const { addFeedingLog, getFeedingLogsByDate, deleteFeedingLog } =
    useBabyCare();
  const [feedingType, setFeedingType] = useState<"breastfeeding" | "bottle">(
    "breastfeeding",
  );
  const [duration, setDuration] = useState("");
  const [side, setSide] = useState<"left" | "right" | "both">("both");
  const [volume, setVolume] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = getFeedingLogsByDate(today);

  const handleAddFeeding = async () => {
    if (feedingType === "breastfeeding") {
      if (!duration.trim()) {
        alert("Please enter duration in minutes");
        return;
      }

      setIsSubmitting(true);
      try {
        await addFeedingLog({
          date: today,
          type: "breastfeeding",
          duration: parseInt(duration, 10),
          side,
        });
        setDuration("");
        setSide("both");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!volume.trim()) {
        alert("Please enter volume in ml");
        return;
      }

      setIsSubmitting(true);
      try {
        await addFeedingLog({
          date: today,
          type: "bottle",
          volume: parseInt(volume, 10),
        });
        setVolume("");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Feeding Tracker</Text>

      {/* Type Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            feedingType === "breastfeeding" && styles.toggleButtonActive,
          ]}
          onPress={() => setFeedingType("breastfeeding")}
        >
          <Text
            style={[
              styles.toggleText,
              feedingType === "breastfeeding" && styles.toggleTextActive,
            ]}
          >
            Breastfeeding
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toggleButton,
            feedingType === "bottle" && styles.toggleButtonActive,
          ]}
          onPress={() => setFeedingType("bottle")}
        >
          <Text
            style={[
              styles.toggleText,
              feedingType === "bottle" && styles.toggleTextActive,
            ]}
          >
            Bottle
          </Text>
        </Pressable>
      </View>

      {/* Breastfeeding Form */}
      {feedingType === "breastfeeding" && (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 15"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Side</Text>
          <View style={styles.sideToggleContainer}>
            {(["left", "right", "both"] as const).map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.sideButton,
                  side === s && styles.sideButtonActive,
                ]}
                onPress={() => setSide(s)}
              >
                <Text
                  style={[
                    styles.sideButtonText,
                    side === s && styles.sideButtonTextActive,
                  ]}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Bottle Form */}
      {feedingType === "bottle" && (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Volume (ml)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 120"
            keyboardType="numeric"
            value={volume}
            onChangeText={setVolume}
            editable={!isSubmitting}
          />
        </View>
      )}

      {/* Submit Button */}
      <Pressable
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleAddFeeding}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? "Saving..." : "Log Feeding"}
        </Text>
      </Pressable>

      {/* Today's Logs */}
      <View style={styles.logsSection}>
        <Text style={styles.logsHeading}>Today's Feeding Logs</Text>

        {todayLogs.length === 0 ? (
          <Text style={styles.emptyText}>No feeding logs yet.</Text>
        ) : (
          <FlatList
            data={todayLogs}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <LogItem
                time={formatTime(item.createdAt)}
                details={
                  item.type === "breastfeeding"
                    ? `${item.duration}m - ${item.side}`
                    : `${item.volume}ml`
                }
                onDelete={() => deleteFeedingLog(item._id)}
              />
            )}
          />
        )}
      </View>
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
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#FFD5E5",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "#C94A6D",
    fontWeight: "700",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F1E4DA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 16,
  },
  sideToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  sideButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1E4DA",
    justifyContent: "center",
    alignItems: "center",
  },
  sideButtonActive: {
    backgroundColor: "#FFD5E5",
    borderColor: "#C94A6D",
  },
  sideButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  sideButtonTextActive: {
    color: "#C94A6D",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#E86A6A",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  logsSection: {
    marginBottom: 24,
  },
  logsHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 16,
  },
});
