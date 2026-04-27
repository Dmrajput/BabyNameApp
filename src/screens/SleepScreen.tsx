import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
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

type Props = NativeStackScreenProps<BabyCareStackParamList, "Sleep">;

export const SleepScreen = ({ navigation }: Props) => {
  const { addSleepLog, getSleepLogsByDate, deleteSleepLog } = useBabyCare();
  const [isTracking, setIsTracking] = useState(false);
  const [trackingTime, setTrackingTime] = useState(0);
  const [manualDuration, setManualDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = getSleepLogsByDate(today);

  // Timer for active sleep tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setTrackingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const handleStartSleep = () => {
    setIsTracking(true);
    setTrackingTime(0);
  };

  const handleStopSleep = async () => {
    setIsTracking(false);
    const minutes = Math.floor(trackingTime / 60);
    if (minutes > 0) {
      const startTime = new Date(Date.now() - trackingTime * 1000);
      const endTime = new Date();

      setIsSubmitting(true);
      try {
        await addSleepLog({
          date: today,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: minutes,
        });
        setTrackingTime(0);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddManualSleep = async () => {
    if (!manualDuration.trim()) {
      alert("Please enter sleep duration");
      return;
    }

    const minutes = parseInt(manualDuration, 10);
    if (isNaN(minutes) || minutes <= 0) {
      alert("Please enter a valid duration");
      return;
    }

    const startTime = new Date(Date.now() - minutes * 60 * 1000);
    const endTime = new Date();

    setIsSubmitting(true);
    try {
      await addSleepLog({
        date: today,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: minutes,
      });
      setManualDuration("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTrackerTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSleepMinutes = todayLogs.reduce(
    (sum, log) => sum + (log.duration || 0),
    0,
  );
  const sleepHours = Math.floor(totalSleepMinutes / 60);
  const sleepMins = totalSleepMinutes % 60;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Sleep Tracker</Text>

      {/* Sleep Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Sleep Timer</Text>
        <Text style={styles.timerDisplay}>
          {formatTrackerTime(trackingTime)}
        </Text>

        {!isTracking ? (
          <Pressable
            style={styles.timerButton}
            onPress={handleStartSleep}
            disabled={isSubmitting}
          >
            <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.timerButtonText}>Start Sleep</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.timerButton, styles.timerButtonStop]}
            onPress={handleStopSleep}
            disabled={isSubmitting}
          >
            <MaterialCommunityIcons name="stop" size={24} color="#FFFFFF" />
            <Text style={styles.timerButtonText}>Stop Sleep</Text>
          </Pressable>
        )}
      </View>

      {/* Today's Total Sleep */}
      <View style={styles.statsBox}>
        <Text style={styles.statsLabel}>Today's Sleep</Text>
        <Text style={styles.statsValue}>
          {sleepHours}h {sleepMins}m
        </Text>
      </View>

      {/* Manual Sleep Entry */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Log Past Sleep (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 45"
          keyboardType="numeric"
          value={manualDuration}
          onChangeText={setManualDuration}
          editable={!isSubmitting}
        />

        <Pressable
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleAddManualSleep}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Saving..." : "Add Manual Entry"}
          </Text>
        </Pressable>
      </View>

      {/* Today's Sleep Sessions */}
      <View style={styles.logsSection}>
        <Text style={styles.logsHeading}>Sleep Sessions</Text>

        {todayLogs.length === 0 ? (
          <Text style={styles.emptyText}>No sleep logs yet.</Text>
        ) : (
          <FlatList
            data={todayLogs}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <LogItem
                time={`${formatTime(item.startTime)} - ${formatTime(
                  item.endTime || "",
                )}`}
                details={`${item.duration} minutes`}
                onDelete={() => deleteSleepLog(item._id)}
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
  timerContainer: {
    backgroundColor: "#D5E8FF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90C9",
    marginBottom: 12,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: "800",
    color: "#4A90C9",
    marginBottom: 16,
    fontFamily: "Courier New",
  },
  timerButton: {
    flexDirection: "row",
    backgroundColor: "#4A90C9",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  timerButtonStop: {
    backgroundColor: "#B91C1C",
  },
  timerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E4DA",
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4A90C9",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  submitButton: {
    backgroundColor: "#E86A6A",
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
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
