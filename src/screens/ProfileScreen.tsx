import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useAuth } from "../context/AuthContext";

type StoredUser = {
  name?: string;
  email?: string;
};

export const ProfileScreen = () => {
  const { userData, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      if (!userData) {
        setUser(null);
        return;
      }

      setUser({
        name: userData.name,
        email: userData.email,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const onLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await logout();
    } catch {
      Alert.alert(
        "Logout failed",
        "Unable to clear your session. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#E86A6A" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topSection}>
        <View style={styles.avatarWrap}>
          <MaterialCommunityIcons
            name="account-circle"
            size={86}
            color="#E86A6A"
          />
        </View>

        <Text style={styles.nameText}>
          {user?.name?.trim() || "Guest User"}
        </Text>
        <Text style={styles.emailText}>
          {user?.email?.trim() || "email-not-available@example.com"}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>User Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>
            {user?.name?.trim() || "Not available"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>
            {user?.email?.trim() || "Not available"}
          </Text>
        </View>
      </View>

      <Pressable
        style={[
          styles.logoutButton,
          isLoggingOut && styles.logoutButtonDisabled,
        ]}
        onPress={onLogout}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#7F1D1D" />
        ) : (
          <Text style={styles.logoutText}>Logout</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9F5",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F5",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
  },
  avatarWrap: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: "#FFE8E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  nameText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
  },
  emailText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 10,
  },
  infoLabel: {
    color: "#64748B",
    fontSize: 14,
  },
  infoValue: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "65%",
    textAlign: "right",
  },
  logoutButton: {
    width: "100%",
    backgroundColor: "#FCA5A5",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: "#7F1D1D",
    fontWeight: "800",
    fontSize: 16,
  },
});
