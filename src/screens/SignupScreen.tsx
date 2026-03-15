import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAuth } from "@/src/context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign up. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardWrap}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <TextInput
              placeholder="Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#7e7e85"
            />
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#7e7e85"
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#7e7e85"
            />
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#7e7e85"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={styles.primaryButton}
              onPress={handleSignup}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#27553d" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkText}>Go to Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4fbf5",
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4fbf5",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fbfefb",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#d7eeda",
    shadowColor: "#7ea88a",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  title: {
    fontSize: 28,
    color: "#234a35",
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#5f6d79",
    marginBottom: 18,
  },
  input: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cde4d0",
    backgroundColor: "#eff9f0",
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#24333f",
    marginBottom: 12,
  },
  primaryButton: {
    marginTop: 6,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#b9e8c4",
  },
  primaryButtonText: {
    color: "#27553d",
    fontWeight: "700",
    fontSize: 16,
  },
  linkText: {
    marginTop: 14,
    textAlign: "center",
    color: "#2b7d4f",
    fontWeight: "600",
  },
  errorText: {
    color: "#b2394f",
    marginBottom: 4,
    fontSize: 14,
  },
});
