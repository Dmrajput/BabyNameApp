import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useBabyCare } from "../context/BabyCareContext";
import { BabyCareStackParamList } from "../types";

type Props = NativeStackScreenProps<BabyCareStackParamList, "AddJournal">;

export const AddJournalScreen = ({ navigation, route }: Props) => {
  const { addJournalEntry, updateJournalEntry, getJournalEntries } =
    useBabyCare();

  const editId = route.params?.editId;
  const allEntries = getJournalEntries();
  const editingEntry = editId ? allEntries.find((e) => e._id === editId) : null;

  const [title, setTitle] = useState(editingEntry?.title || "");
  const [description, setDescription] = useState(
    editingEntry?.description || "",
  );
  const [date, setDate] = useState(
    editingEntry ? editingEntry.date : new Date().toISOString().split("T")[0],
  );
  const [imageUrl, setImageUrl] = useState(editingEntry?.imageUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEntry) {
        await updateJournalEntry(editingEntry._id, {
          title,
          description,
          date,
          imageUrl: imageUrl || undefined,
        });
      } else {
        await addJournalEntry({
          title,
          description,
          date,
          imageUrl: imageUrl || undefined,
        });
      }

      navigation.goBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>
        {editingEntry ? "Edit Memory" : "Add Memory"}
      </Text>

      {/* Image Preview */}
      {imageUrl && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
          <Pressable
            style={styles.removeImageButton}
            onPress={() => setImageUrl("")}
          >
            <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      )}

      {/* Image Input (Simple URL for now) */}
      <View style={styles.section}>
        <Text style={styles.label}>Image URL (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChangeText={setImageUrl}
          editable={!isSubmitting}
        />
        <Text style={styles.hint}>
          Paste a URL to an image from the web (optional)
        </Text>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Memory title"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          editable={!isSubmitting}
        />
        <Text style={styles.charCount}>{title.length}/100</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Write about this memory..."
          value={description}
          onChangeText={setDescription}
          maxLength={500}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          editable={!isSubmitting}
        />
        <Text style={styles.charCount}>{description.length}/500</Text>
      </View>

      {/* Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.hint}>Format: YYYY-MM-DD (e.g., 2025-04-25)</Text>
        <TextInput
          style={styles.input}
          placeholder="2025-04-25"
          value={date}
          onChangeText={setDate}
          editable={!isSubmitting}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.saveButton,
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting
              ? "Saving..."
              : editingEntry
                ? "Update"
                : "Save Memory"}
          </Text>
        </Pressable>
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
    marginBottom: 20,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F3E8E1",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 6,
  },
  section: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1E4DA",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
    fontStyle: "italic",
  },
  charCount: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3E8E1",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#E86A6A",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
