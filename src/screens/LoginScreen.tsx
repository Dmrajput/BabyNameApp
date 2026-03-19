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

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to login. Please try again.",
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue</Text>

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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={styles.primaryButton}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#13324f" />
              ) : (
                <Text style={styles.primaryButtonText}>Login</Text>
              )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.linkText}>Go to Signup</Text>
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
    backgroundColor: "#fff8f4",
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff8f4",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fffefc",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#f1dfd2",
    shadowColor: "#bd8a69",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  title: {
    fontSize: 28,
    color: "#103d5f",
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
    borderColor: "#edd7c8",
    backgroundColor: "#fff5ef",
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
    backgroundColor: "#b8dff3",
  },
  primaryButtonText: {
    color: "#13324f",
    fontWeight: "700",
    fontSize: 16,
  },
  linkText: {
    marginTop: 14,
    textAlign: "center",
    color: "#26659b",
    fontWeight: "600",
  },
  errorText: {
    color: "#b2394f",
    marginBottom: 4,
    fontSize: 14,
  },
});
