import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    AdEventType,
    InterstitialAd,
    TestIds,
} from "react-native-google-mobile-ads";

import { NameCard } from "../components/NameCard";
import { SearchBar } from "../components/SearchBar";
import { useFavorites } from "../context/FavoritesContext";
import { getNamesByCategory } from "../services/api";
import { BabyName, GenderFilter, HomeStackParamList } from "../types";

type Props = NativeStackScreenProps<HomeStackParamList, "NameList">;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const AD_TRIGGER_EVERY_OPENS = 10;
const AD_SHOW_DELAY_MS = 300;
const AD_RETRY_DELAY_MS = 15_000;

const INTERSTITIAL_TEST_OR_PROD_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID;

const getRandomCooldownMs = () => {
  // Show interstitial in a 90-120s window to avoid aggressive ad frequency.
  const min = 90_000;
  const max = 120_000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const NameListScreen = ({ route, navigation }: Props) => {
  const { category, initialQuery } = route.params;
  const [query, setQuery] = useState(initialQuery ?? "");
  const [gender, setGender] = useState<GenderFilter>("All");
  const [selectedLetter, setSelectedLetter] = useState<string>("All");
  const [allNames, setAllNames] = useState<BabyName[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [adError, setAdError] = useState<string>("");
  const { isFavorite, toggleFavorite } = useFavorites();

  // Create one interstitial instance for this screen lifecycle.
  const interstitialRef = useRef(
    INTERSTITIAL_TEST_OR_PROD_ID
      ? InterstitialAd.createForAdRequest(INTERSTITIAL_TEST_OR_PROD_ID, {
          requestNonPersonalizedAdsOnly: true,
        })
      : null,
  );
  const openCountRef = useRef(0);
  const lastShownAtRef = useRef(0);
  const nextCooldownMsRef = useRef(getRandomCooldownMs());
  const isMountedRef = useRef(true);
  const isAdShowingRef = useRef(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tryShowInterstitial = useCallback(() => {
    const now = Date.now();
    const cooldownFinished =
      now - lastShownAtRef.current >= nextCooldownMsRef.current;

    // Policy-safe guard: only show when loaded and cooldown has passed.
    if (
      !isInterstitialLoaded ||
      !cooldownFinished ||
      !interstitialRef.current ||
      isAdShowingRef.current
    ) {
      return;
    }

    try {
      isAdShowingRef.current = true;
      interstitialRef.current.show();
    } catch {
      isAdShowingRef.current = false;
      // Never block user flow on ad failures.
    }
  }, [isInterstitialLoaded]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!interstitialRef.current) {
      if (!__DEV__) {
        setAdError(
          "Ad unit ID is not configured. Set EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID in .env.",
        );
      }
      return;
    }

    // Subscribe to ad lifecycle events once on mount.
    const ad = interstitialRef.current;

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      if (!isMountedRef.current) {
        return;
      }

      setIsInterstitialLoaded(true);
      setAdError("");
    });

    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (eventError) => {
        isAdShowingRef.current = false;

        if (!isMountedRef.current) {
          return;
        }

        setIsInterstitialLoaded(false);
        setAdError(eventError?.message ?? "Ad failed to load.");

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        // Retry loading safely after a short delay.
        retryTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) {
            return;
          }
          ad.load();
        }, AD_RETRY_DELAY_MS);
      },
    );

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      isAdShowingRef.current = false;

      if (!isMountedRef.current) {
        return;
      }

      setIsInterstitialLoaded(false);
      lastShownAtRef.current = Date.now();
      nextCooldownMsRef.current = getRandomCooldownMs();

      // Preload the next ad after close for future natural trigger.
      ad.load();
    });

    // Load an interstitial when screen mounts (but do not show immediately).
    ad.load();

    return () => {
      isMountedRef.current = false;
      isAdShowingRef.current = false;

      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeClosed();
    };
  }, []);

  useEffect(() => {
    const loadNames = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getNamesByCategory(category);
        setAllNames(data);
      } catch (_error) {
        setError("Unable to load names. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadNames();
  }, [category]);

  const names = useMemo(() => {
    return allNames.filter((item) => {
      const matchesSearch =
        !query.trim() ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.meaning.toLowerCase().includes(query.toLowerCase());
      const matchesGender = gender === "All" || item.gender === gender;
      const matchesLetter =
        selectedLetter === "All" || item.name.startsWith(selectedLetter);

      return matchesSearch && matchesGender && matchesLetter;
    });
  }, [allNames, gender, query, selectedLetter]);

  return (
    <View style={styles.screen}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search name or meaning"
      />

      <View style={styles.genderRow}>
        <View style={styles.genderFiltersWrap}>
          {(["All", "Boy", "Girl"] as GenderFilter[]).map((item) => {
            const active = gender === item;
            return (
              <Pressable
                key={item}
                onPress={() => setGender(item)}
                style={[styles.filterChip, active && styles.activeFilterChip]}
              >
                <Text
                  style={[styles.filterText, active && styles.activeFilterText]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.inlineCountBadge}>
          <Text style={styles.inlineCountText}>
            {loading ? "..." : names.length}
          </Text>
        </View>
      </View>

      <FlatList
        horizontal
        data={["All", ...alphabet]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.alphabetRow}
        renderItem={({ item }) => {
          const active = selectedLetter === item;
          return (
            <Pressable
              onPress={() => setSelectedLetter(item)}
              style={[styles.alphaChip, active && styles.activeAlphaChip]}
            >
              <Text
                style={[styles.alphaText, active && styles.activeAlphaText]}
              >
                {item}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={names}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          loading ? (
            <ActivityIndicator color="#E86A6A" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : __DEV__ && adError ? (
            <Text style={styles.adDebugText}>Ad: {adError}</Text>
          ) : null
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={styles.emptyText}>No names match your filters.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <NameCard
            item={item}
            isFavorite={isFavorite(item._id)}
            onToggleFavorite={() => toggleFavorite(item)}
            onPress={() => {
              // Natural action trigger: every 10 name opens.
              openCountRef.current += 1;
              navigation.navigate("NameDetail", { nameId: item._id });

              if (openCountRef.current % AD_TRIGGER_EVERY_OPENS === 0) {
                // Slight delay keeps navigation feeling responsive.
                if (showTimeoutRef.current) {
                  clearTimeout(showTimeoutRef.current);
                }

                showTimeoutRef.current = setTimeout(() => {
                  tryShowInterstitial();
                }, AD_SHOW_DELAY_MS);
              }
            }}
          />
        )}
      />
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
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  genderFiltersWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#FBCFE8",
  },
  filterText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#9D174D",
  },
  alphabetRow: {
    paddingBottom: 12,
  },
  alphaChip: {
    backgroundColor: "#FFFFFF",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  activeAlphaChip: {
    backgroundColor: "#BFDBFE",
  },
  alphaText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 12,
  },
  activeAlphaText: {
    color: "#1D4ED8",
  },
  inlineCountBadge: {
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#F4E7DF",
  },
  inlineCountText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: 24,
  },
  loader: {
    marginVertical: 10,
  },
  errorText: {
    color: "#B91C1C",
    marginBottom: 10,
    fontSize: 13,
  },
  adDebugText: {
    color: "#64748B",
    marginBottom: 10,
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 30,
    fontSize: 15,
  },
});
