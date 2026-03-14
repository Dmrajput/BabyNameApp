import React, { createContext, useContext, useMemo, useState } from 'react';

import { BabyName } from '../types';

type FavoritesContextValue = {
  favorites: BabyName[];
  favoriteNames: BabyName[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: BabyName) => void;
  removeFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<BabyName[]>([]);

  const favoriteNames = useMemo(() => favorites, [favorites]);

  const toggleFavorite = (item: BabyName) => {
    setFavorites((current) => {
      const exists = current.some((value) => value._id === item._id);
      if (exists) {
        return current.filter((value) => value._id !== item._id);
      }

      return [...current, item];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((current) => current.filter((value) => value._id !== id));
  };

  const isFavorite = (id: string) => favorites.some((item) => item._id === id);

  const value: FavoritesContextValue = {
    favorites,
    favoriteNames,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider.');
  }

  return context;
};
