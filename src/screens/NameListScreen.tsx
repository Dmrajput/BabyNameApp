import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import {
  AdEventType,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";

import { NameCard } from "../components/NameCard";
import { SearchBar } from "../components/SearchBar";
import { useCountry } from "../context/CountryContext";
import { useFavorites } from "../context/FavoritesContext";
import { useStateFilter } from "../context/StateContext";
import { getNamesPage } from "../services/api";
import { BabyName, GenderFilter, HomeStackParamList } from "../types";

type Props = NativeStackScreenProps<HomeStackParamList, "NameList">;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const AD_RETRY_DELAY_MS = 15_000;
const BANNER_FIRST_AD_AFTER = 10;
const BANNER_AD_FREQUENCY = 20;
const INTERSTITIAL_ELIGIBLE_FIRST = 50;
const INTERSTITIAL_ELIGIBLE_INTERVAL = 100;
const PAGE_SIZE = 100;

// const INTERSTITIAL_TEST_OR_PROD_ID =
//   process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID ||
//   (__DEV__ ? TestIds.INTERSTITIAL : undefined);
const INTERSTITIAL_TEST_OR_PROD_ID = TestIds.INTERSTITIAL;
// const BANNER_TEST_OR_PROD_ID =
//   process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID ||
//   (__DEV__ ? TestIds.BANNER : undefined);
const BANNER_TEST_OR_PROD_ID = TestIds.BANNER;
type AdPlaceholder = {
  type: "ad";
  id: string;
};

type ListItem = BabyName | AdPlaceholder;

const getRandomCooldownMs = () => {
  // Show interstitial in a 90-120s window to avoid aggressive ad frequency.
  const min = 90_000;
  const max = 120_000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const NameListScreen = ({ route, navigation }: Props) => {
  const { category, title, initialQuery } = route.params;
  const { selectedCountry, isCountryLoading } = useCountry();
  const { selectedState, states, setSelectedState, isStateLoading } =
    useStateFilter();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery ?? "");
  const [gender, setGender] = useState<GenderFilter>("All");
  const [selectedLetter, setSelectedLetter] = useState<string>("All");
  const [showStateModal, setShowStateModal] = useState(false);
  const [names, setNames] = useState<BabyName[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string>("");
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [adError, setAdError] = useState<string>("");
  const { isFavorite, toggleFavorite } = useFavorites();
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);

  // Create one interstitial instance for this screen lifecycle.
  const interstitialRef = useRef(
    INTERSTITIAL_TEST_OR_PROD_ID
      ? InterstitialAd.createForAdRequest(INTERSTITIAL_TEST_OR_PROD_ID, {
          requestNonPersonalizedAdsOnly: true,
        })
      : null,
  );
  const lastShownAtRef = useRef(0);
  const nextCooldownMsRef = useRef(getRandomCooldownMs());
  const isMountedRef = useRef(true);
  const isAdShowingRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAdEligibleRef = useRef(false);
  const lastEligibilityTriggerRef = useRef(0);
  const viewedNameIdsRef = useRef<Set<string>>(new Set());

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
      return false;
    }

    try {
      isAdShowingRef.current = true;
      interstitialRef.current.show();
      return true;
    } catch {
      isAdShowingRef.current = false;
      // Never block user flow on ad failures.
      return false;
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

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeClosed();
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  const fetchNames = useCallback(
    async (pageNumber = 1, reset = false) => {
      if (
        loadingRef.current ||
        (!reset && pageNumber > 1 && !hasMoreRef.current)
      ) {
        return;
      }

      loadingRef.current = true;
      setLoading(pageNumber === 1);
      setIsLoadingMore(pageNumber > 1);

      try {
        if (pageNumber === 1 && reset) {
          viewedNameIdsRef.current = new Set();
          isAdEligibleRef.current = false;
          lastEligibilityTriggerRef.current = 0;
        }

        if (pageNumber === 1) {
          setError("");
        }

        const response = await getNamesPage({
          page: pageNumber,
          limit: PAGE_SIZE,
          search: debouncedQuery,
          category,
          country: selectedCountry,
          state: selectedState,
          gender,
          letter: selectedLetter,
        });

        setNames((previous) =>
          pageNumber === 1 ? response.data : [...previous, ...response.data],
        );
        setTotalCount(response.total);
        pageRef.current = response.currentPage;

        // Stop pagination when server returns an empty page to avoid
        // repeated onEndReached fetch loops in empty-filter states.
        const nextHasMore =
          response.data.length > 0 &&
          response.currentPage < response.totalPages;
        hasMoreRef.current = nextHasMore;
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Unable to load names. Please try again.";
        setError(message);
        if (__DEV__) {
          console.error("Failed to load names:", error);
        }
        if (pageNumber === 1) {
          setNames([]);
          setTotalCount(0);
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      debouncedQuery,
      category,
      selectedCountry,
      selectedState,
      gender,
      selectedLetter,
    ],
  );

  useEffect(() => {
    if (isCountryLoading || isStateLoading) {
      return;
    }

    pageRef.current = 1;
    hasMoreRef.current = true;
    setNames([]);
    setTotalCount(0);
    void fetchNames(1, true);
  }, [
    fetchNames,
    category,
    debouncedQuery,
    selectedCountry,
    selectedState,
    gender,
    selectedLetter,
    isCountryLoading,
    isStateLoading,
  ]);

  const stateOptions = useMemo(() => ["All", ...states], [states]);

  const handleLoadMore = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }

    void fetchNames(pageRef.current + 1);
  }, [fetchNames]);

  const renderNameCard = useCallback(
    ({ item }: { item: ListItem }) => {
      if ("type" in item && item.type === "ad") {
        if (!BANNER_TEST_OR_PROD_ID) {
          return null;
        }

        return (
          <View style={styles.bannerWrap}>
            <BannerAd
              unitId={BANNER_TEST_OR_PROD_ID}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
          </View>
        );
      }

      return (
        <NameCard
          compact
          item={item}
          isFavorite={isFavorite(item._id)}
          onToggleFavorite={() => toggleFavorite(item)}
          onPress={() => {
            navigation.navigate("NameDetail", { nameId: item._id });

            if (isAdEligibleRef.current) {
              const didShow = tryShowInterstitial();
              if (didShow) {
                isAdEligibleRef.current = false;
              }
            }
          }}
        />
      );
    },
    [isFavorite, navigation, toggleFavorite, tryShowInterstitial],
  );

  const listData = useMemo(() => {
    if (!BANNER_TEST_OR_PROD_ID || names.length === 0) {
      return names as ListItem[];
    }

    const items: ListItem[] = [];

    names.forEach((item, index) => {
      items.push(item);
      const position = index + 1;
      if (
        position >= BANNER_FIRST_AD_AFTER &&
        (position - BANNER_FIRST_AD_AFTER) % BANNER_AD_FREQUENCY === 0
      ) {
        items.push({ type: "ad", id: `ad-${position}` });
      }
    });

    return items;
  }, [names]);

  const keyExtractor = useCallback((item: ListItem) => {
    if ("type" in item && item.type === "ad") {
      return item.id;
    }

    return item._id;
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      let didAdd = false;

      viewableItems.forEach((token) => {
        const item = token.item as ListItem | undefined;
        if (!item) {
          return;
        }

        if ("type" in item && item.type === "ad") {
          return;
        }

        const nameItem = item as BabyName;
        if (!nameItem._id || viewedNameIdsRef.current.has(nameItem._id)) {
          return;
        }

        viewedNameIdsRef.current.add(nameItem._id);
        didAdd = true;
      });

      if (!didAdd) {
        return;
      }

      const viewedCount = viewedNameIdsRef.current.size;
      if (viewedCount < INTERSTITIAL_ELIGIBLE_FIRST) {
        return;
      }

      const offset = viewedCount - INTERSTITIAL_ELIGIBLE_FIRST;
      if (offset % INTERSTITIAL_ELIGIBLE_INTERVAL !== 0) {
        return;
      }

      if (viewedCount <= lastEligibilityTriggerRef.current) {
        return;
      }

      isAdEligibleRef.current = true;
      lastEligibilityTriggerRef.current = viewedCount;
    },
  ).current;

  const stickyHeader = (
    <View style={styles.stickyHeaderWrap}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search name or meaning"
        compact
      />

      <View style={styles.filterRow}>
        <Pressable
          style={styles.stateButtonInline}
          onPress={() => setShowStateModal(true)}
          disabled={isStateLoading}
        >
          <Text style={styles.stateButtonTextInline} numberOfLines={1}>
            {selectedState}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={16}
            color="#475569"
          />
        </Pressable>

        <View style={styles.genderFiltersWrapCompact}>
          {(["All", "Boy", "Girl"] as GenderFilter[]).map((item) => {
            const active = gender === item;
            return (
              <Pressable
                key={item}
                onPress={() => setGender(item)}
                style={[
                  styles.filterChipCompact,
                  active && styles.activeFilterChipCompact,
                ]}
              >
                <Text
                  style={[
                    styles.filterTextCompact,
                    active && styles.activeFilterText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.inlineCountBadgeCompact}>
          <Text style={styles.inlineCountTextCompact}>
            {loading ? "..." : totalCount}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.alphabetRowCompact}
      >
        {["All", ...alphabet].map((item) => {
          const active = selectedLetter === item;
          return (
            <Pressable
              key={item}
              onPress={() => setSelectedLetter(item)}
              style={[
                styles.alphaChipCompact,
                active && styles.activeAlphaChipCompact,
              ]}
            >
              <Text
                style={[
                  styles.alphaTextCompact,
                  active && styles.activeAlphaTextCompact,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#E86A6A" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : __DEV__ && adError ? (
        <Text style={styles.adDebugText}>Ad: {adError}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>{title}</Text>
      </View>

      {stickyHeader}

      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        initialNumToRender={16}
        maxToRenderPerBatch={18}
        windowSize={9}
        updateCellsBatchingPeriod={40}
        removeClippedSubviews={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={styles.emptyText}>No names match your filters.</Text>
          ) : null
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator color="#E86A6A" style={styles.loader} />
          ) : null
        }
        renderItem={renderNameCard}
      />

      <Modal
        visible={showStateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStateModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowStateModal(false)}
        >
          <View style={styles.modalCard}>
            <ScrollView style={styles.stateOptionsScroll}>
              {stateOptions.map((item) => {
                const active = item === selectedState;

                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.stateOption,
                      active && styles.stateOptionActive,
                    ]}
                    onPress={() => {
                      void setSelectedState(item);
                      setShowStateModal(false);
                    }}
                  >
                    <Text style={styles.stateOptionText}>{item}</Text>
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
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  screenHeader: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  screenTitle: {
    fontSize: 21,
    color: "#1F2937",
    fontWeight: "800",
  },
  stickyHeaderWrap: {
    backgroundColor: "#FFF9F5",
    paddingBottom: 4,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  stateButtonInline: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1E4DA",
    paddingHorizontal: 10,
    height: 34,
    minWidth: 90,
    marginRight: 6,
  },
  stateButtonTextInline: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    maxWidth: 76,
    marginRight: 2,
  },
  genderFiltersWrapCompact: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  filterChipCompact: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 5,
    minWidth: 42,
    alignItems: "center",
  },
  activeFilterChipCompact: {
    backgroundColor: "#FBCFE8",
  },
  filterTextCompact: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },
  inlineCountBadgeCompact: {
    minWidth: 48,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#F4E7DF",
    marginLeft: 6,
  },
  inlineCountTextCompact: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "800",
  },
  alphabetRowCompact: {
    paddingBottom: 6,
  },
  alphaChipCompact: {
    backgroundColor: "#FFFFFF",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  activeAlphaChipCompact: {
    backgroundColor: "#BFDBFE",
  },
  alphaTextCompact: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 11,
  },
  activeAlphaTextCompact: {
    color: "#1D4ED8",
  },
  activeFilterText: {
    color: "#9D174D",
  },
  listContent: {
    paddingBottom: 12,
  },
  bannerWrap: {
    alignItems: "center",
    paddingVertical: 6,
  },
  loader: {
    marginVertical: 6,
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
    marginTop: 16,
    fontSize: 13,
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
    maxHeight: "70%",
  },
  stateOptionsScroll: {
    maxHeight: 300,
  },
  stateOption: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  stateOptionActive: {
    backgroundColor: "#F0FDFA",
  },
  stateOptionText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "600",
  },
});
