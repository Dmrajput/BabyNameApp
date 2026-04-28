import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CategoryCard } from "../components/CategoryCard";
import { useCountry } from "../context/CountryContext";
import { getCategories } from "../services/api";
import { CategoryItem, HomeStackParamList } from "../types";

type Props = NativeStackScreenProps<HomeStackParamList, "Home">;

const CATEGORIES_STORAGE_KEY = "categoriesCache";
const COUNTRY_MODAL_MAX_HEIGHT = Math.min(
  Dimensions.get("window").height * 0.75,
  520,
);
const COUNTRY_SCROLL_MAX_HEIGHT = Math.max(COUNTRY_MODAL_MAX_HEIGHT - 16, 280);

export const HomeScreen = ({ navigation }: Props) => {
  const { selectedCountry, countries, setSelectedCountry, isCountryLoading } =
    useCountry();
  const [showCountryModal, setShowCountryModal] = React.useState(false);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [categoriesError, setCategoriesError] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;
    const cacheKey = `${CATEGORIES_STORAGE_KEY}:${selectedCountry}`;

    const loadCategories = async () => {
      if (isCountryLoading) {
        return;
      }

      try {
        setCategoriesLoading(true);
        const cached = await AsyncStorage.getItem(cacheKey);

        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (isMounted && Array.isArray(parsed) && parsed.length > 0) {
              setCategories(parsed);
              setCategoriesLoading(false);
            }
          } catch {
            // Ignore invalid cached categories.
          }
        }

        const remoteCategories = await getCategories(selectedCountry);

        if (!isMounted) {
          return;
        }

        setCategories(remoteCategories);
        setCategoriesError("");
        await AsyncStorage.setItem(cacheKey, JSON.stringify(remoteCategories));
      } catch {
        if (isMounted) {
          setCategoriesError("Unable to load categories. Please try again.");
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [selectedCountry, isCountryLoading]);

  const selectedCountryItem =
    countries.find((item) => item.code === selectedCountry) || countries[0];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Baby Name Finder</Text>
      <Text style={styles.subheading}>
        Find beautiful names with meaning and origin.
      </Text>

      <Pressable
        style={styles.countryButton}
        onPress={() => setShowCountryModal(true)}
        disabled={!countries.length || isCountryLoading}
      >
        <Text style={styles.countryText}>
          🌍 {selectedCountryItem?.flag || ""}{" "}
          {selectedCountryItem?.label || selectedCountry}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color="#475569" />
      </Pressable>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.column}
        ListHeaderComponent={
          categoriesLoading ? (
            <ActivityIndicator color="#E86A6A" style={styles.loader} />
          ) : categoriesError ? (
            <Text style={styles.errorText}>{categoriesError}</Text>
          ) : null
        }
        ListEmptyComponent={
          !categoriesLoading && !categoriesError ? (
            <Text style={styles.emptyText}>
              No categories available right now.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <CategoryCard
            title={item.title}
            icon={item.icon}
            color={item.color}
            onPress={() =>
              navigation.navigate("NameList", {
                category: item.id,
                title: item.title,
              })
            }
          />
        )}
      />

      <Modal
        visible={showCountryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowCountryModal(false)}
        >
          <View style={styles.modalCard}>
            <ScrollView
              style={styles.countryScroll}
              keyboardShouldPersistTaps="handled"
            >
              {countries.map((item) => {
                const active = item.code === selectedCountry;

                return (
                  <Pressable
                    key={item.code}
                    style={[
                      styles.countryOption,
                      active && styles.countryOptionActive,
                    ]}
                    onPress={() => {
                      void setSelectedCountry(item.code);
                      setShowCountryModal(false);
                    }}
                  >
                    <Text style={styles.countryOptionText}>
                      {item.flag} {item.label}
                    </Text>

                    {active ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={18}
                        color="#0F766E"
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1E4DA",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  countryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  listContent: {
    paddingBottom: 20,
  },
  loader: {
    marginVertical: 10,
  },
  errorText: {
    color: "#B91C1C",
    marginBottom: 10,
    fontSize: 13,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
  },
  column: {
    justifyContent: "space-between",
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    maxHeight: COUNTRY_MODAL_MAX_HEIGHT,
    width: "100%",
  },
  countryScroll: {
    maxHeight: COUNTRY_SCROLL_MAX_HEIGHT,
  },
  countryOption: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  countryOptionActive: {
    backgroundColor: "#F0FDFA",
  },
  countryOptionText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "600",
  },
});
