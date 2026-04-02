import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
};

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search names...",
  compact = false,
}: SearchBarProps) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <MaterialIcons name="search" size={compact ? 18 : 20} color="#7A7D85" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9EA3AF"
        style={[styles.input, compact && styles.inputCompact]}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 14,
  },
  containerCompact: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1E293B",
  },
  inputCompact: {
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 18,
  },
});
