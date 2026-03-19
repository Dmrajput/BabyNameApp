import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import {
    addFavorite as addFavoriteApi,
    getFavorites as getFavoritesApi,
    removeFavorite as removeFavoriteApi,
} from "../services/api";
import { BabyName } from "../types";

const FAVORITES_CACHE_PREFIX = "favorites_cache_";
const AI_PREFIX = "ai-";
const objectIdRegex = /^[a-f\d]{24}$/i;

type FavoritesContextValue = {
  favorites: BabyName[];
  favoriteNames: BabyName[];
  favoriteCount: number;
  isLoading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: BabyName) => void;
  removeFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userData, userToken } = useAuth();
  const [favorites, setFavorites] = useState<BabyName[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const cacheKey = userData?.id
    ? `${FAVORITES_CACHE_PREFIX}${userData.id}`
    : null;

  const sortByRecent = useCallback((items: BabyName[]) => {
    return [...items].sort((a, b) => {
      const aDate = a.favoriteCreatedAt ? Date.parse(a.favoriteCreatedAt) : 0;
      const bDate = b.favoriteCreatedAt ? Date.parse(b.favoriteCreatedAt) : 0;
      return bDate - aDate;
    });
  }, []);

  const persistCache = useCallback(
    async (items: BabyName[]) => {
      if (!cacheKey) {
        return;
      }

      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(items));
      } catch {
        // Cache failures should never break app flow.
      }
    },
    [cacheKey],
  );

  const loadFavorites = useCallback(async () => {
    if (!cacheKey || !userToken) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as BabyName[];
        setFavorites(sortByRecent(parsed));
      }
    } catch {
      // Ignore cache parse failures and fetch from network.
    }

    try {
      const remote = await getFavoritesApi({ token: userToken });
      const sorted = sortByRecent(remote);
      setFavorites(sorted);
      await persistCache(sorted);
    } catch {
      // Keep cached favorites if network is unavailable.
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, persistCache, sortByRecent, userToken]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const favoriteNames = useMemo(() => favorites, [favorites]);
  const favoriteCount = favoriteNames.length;

  const isFavorite = useCallback(
    (id: string) => favorites.some((item) => item._id === id),
    [favorites],
  );

  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites((current) => {
        const previous = current;
        const next = current.filter((value) => value._id !== id);
        void persistCache(next);

        if (!userToken || !objectIdRegex.test(id) || id.startsWith(AI_PREFIX)) {
          return next;
        }

        void removeFavoriteApi({ token: userToken, nameId: id }).catch(
          async () => {
            setFavorites(previous);
            await persistCache(previous);
          },
        );

        return next;
      });
    },
    [persistCache, userToken],
  );

  const toggleFavorite = useCallback(
    (item: BabyName) => {
      setFavorites((current) => {
        const exists = current.some((value) => value._id === item._id);
        if (exists) {
          const next = current.filter((value) => value._id !== item._id);
          void persistCache(next);

          if (
            userToken &&
            objectIdRegex.test(item._id) &&
            !item._id.startsWith(AI_PREFIX)
          ) {
            void removeFavoriteApi({
              token: userToken,
              nameId: item._id,
            }).catch(async () => {
              setFavorites(current);
              await persistCache(current);
            });
          }

          return next;
        }

        const optimistic = {
          ...item,
          favoriteCreatedAt: new Date().toISOString(),
        };

        const next = sortByRecent([...current, optimistic]);
        void persistCache(next);

        if (
          !userToken ||
          !objectIdRegex.test(item._id) ||
          item._id.startsWith(AI_PREFIX)
        ) {
          return next;
        }

        void addFavoriteApi({ token: userToken, nameId: item._id })
          .then(async (response) => {
            setFavorites((latest) => {
              const updated = latest.map((value) => {
                if (value._id !== item._id) {
                  return value;
                }

                return {
                  ...value,
                  favoriteId: response.favoriteId,
                  favoriteCreatedAt:
                    response.createdAt ?? value.favoriteCreatedAt,
                };
              });

              void persistCache(updated);
              return sortByRecent(updated);
            });
          })
          .catch(async () => {
            setFavorites(current);
            await persistCache(current);
          });

        return next;
      });
    },
    [persistCache, sortByRecent, userToken],
  );

  const value: FavoritesContextValue = {
    favorites,
    favoriteNames,
    favoriteCount,
    isLoading,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider.");
  }

  return context;
};
