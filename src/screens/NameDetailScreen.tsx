import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useFavorites } from "../context/FavoritesContext";
import { getNameById } from "../services/api";
import { BabyName, HomeStackParamList } from "../types";

type Props = NativeStackScreenProps<HomeStackParamList, "NameDetail">;

type GoogleMobileAdsModule = {
  BannerAd: React.ComponentType<any>;
  BannerAdSize: {
    ANCHORED_ADAPTIVE_BANNER: string;
  };
  TestIds: {
    BANNER: string;
  };
};

const loadGoogleMobileAdsModule = (): GoogleMobileAdsModule | null => {
  try {
    return require("react-native-google-mobile-ads") as GoogleMobileAdsModule;
  } catch {
    return null;
  }
};

const NameDetailBanner = React.memo(
  ({
    BannerAdComponent,
    bannerSize,
    adUnitId,
    onLoaded,
    onFailedToLoad,
  }: {
    BannerAdComponent: React.ComponentType<any>;
    bannerSize: string;
    adUnitId: string;
    onLoaded: () => void;
    onFailedToLoad: (error: { message?: string }) => void;
  }) => {
    return (
      <BannerAdComponent
        unitId={adUnitId}
        size={bannerSize}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={onLoaded}
        onAdFailedToLoad={onFailedToLoad}
      />
    );
  },
);

export const NameDetailScreen = ({ route }: Props) => {
  const { nameId } = route.params;
  const adsModule = useMemo(loadGoogleMobileAdsModule, []);
  const BannerAdComponent = adsModule?.BannerAd;
  const bannerSize = adsModule?.BannerAdSize?.ANCHORED_ADAPTIVE_BANNER;
  const bannerAdUnitId = useMemo(() => {
    if (!adsModule) {
      return null;
    }

    return __DEV__
      ? adsModule.TestIds.BANNER
      : process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID || null;
  }, [adsModule]);

  const [babyName, setBabyName] = useState<BabyName | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showBanner, setShowBanner] = useState<boolean>(
    Boolean(bannerAdUnitId),
  );
  const [bannerError, setBannerError] = useState<string>("");
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleBannerLoaded = useCallback(() => {
    setShowBanner(true);
    setBannerError("");
  }, []);

  const handleBannerFailedToLoad = useCallback(
    (loadError: { message?: string }) => {
      // Fail-safe: hide banner if load fails, never block UI or crash.
      setShowBanner(false);
      setBannerError(loadError?.message ?? "Banner ad failed to load.");
    },
    [],
  );

  useEffect(() => {
    if (!adsModule) {
      setShowBanner(false);
      if (__DEV__) {
        setBannerError(
          "react-native-google-mobile-ads module is unavailable in this build.",
        );
      }
      return;
    }

    if (!bannerAdUnitId) {
      setShowBanner(false);
      if (!__DEV__) {
        setBannerError(
          "Ad unit ID is not configured. Set EXPO_PUBLIC_ADMOB_BANNER_ANDROID in .env.",
        );
      }
      return;
    }

    setShowBanner(true);
    setBannerError("");
  }, [adsModule, bannerAdUnitId]);

  useEffect(() => {
    let isActive = true;

    const loadNameDetails = async () => {
      try {
        if (isActive) {
          setLoading(true);
          setError("");
        }

        const data = await getNameById(nameId);
        if (isActive) {
          setBabyName(data);
        }
      } catch (_error) {
        if (isActive) {
          setError("Unable to load details. Please try again.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadNameDetails();

    return () => {
      isActive = false;
    };
  }, [nameId]);

  const onShare = async () => {
    if (!babyName) {
      return;
    }

    try {
      await Share.share({
        message: `${babyName.name}: ${babyName.meaning} (${babyName.origin}, ${babyName.gender}, Rating ${(babyName.rating ?? 0).toFixed(1)}/5)`,
      });
    } catch {
      Alert.alert("Unable to share right now.");
    }
  };

  const favorite = babyName ? isFavorite(babyName._id) : false;

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#E86A6A" />
      </View>
    );
  }

  if (error || !babyName) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{error || "Name not found."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.contentArea}>
        <View style={styles.card}>
          <Text style={styles.name}>{babyName.name}</Text>
          <Text style={styles.meaning}>{babyName.meaning}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Origin</Text>
            <Text style={styles.value}>{babyName.origin}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{babyName.gender}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Rating</Text>
            <Text style={styles.value}>
              {(babyName.rating ?? 0).toFixed(1)} / 5
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.actionButton}
              onPress={() => toggleFavorite(babyName)}
            >
              <MaterialCommunityIcons
                name={favorite ? "heart" : "heart-outline"}
                size={20}
                color={favorite ? "#DC2626" : "#334155"}
              />
              <Text style={styles.actionText}>
                {favorite ? "Saved" : "Favorite"}
              </Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={onShare}>
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color="#334155"
              />
              <Text style={styles.actionText}>Share</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {showBanner && BannerAdComponent && bannerSize && bannerAdUnitId ? (
        <View style={styles.bannerContainer}>
          <NameDetailBanner
            BannerAdComponent={BannerAdComponent}
            bannerSize={bannerSize}
            adUnitId={bannerAdUnitId}
            onLoaded={handleBannerLoaded}
            onFailedToLoad={handleBannerFailedToLoad}
          />
        </View>
      ) : __DEV__ && bannerError ? (
        <View style={styles.bannerDebugContainer}>
          <Text style={styles.bannerDebugText}>Banner: {bannerError}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    backgroundColor: "#FFF9F5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F5",
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  name: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  meaning: {
    fontSize: 18,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  label: {
    fontSize: 15,
    color: "#475569",
  },
  value: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "700",
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 8,
  },
  actionText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "700",
  },
  bannerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFF9F5",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  bannerDebugContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  bannerDebugText: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
  },
});
