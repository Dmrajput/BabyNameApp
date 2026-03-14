import React, { createContext, useContext, useMemo, useState } from 'react';

import namesData from '../data/babyNames.json';
import { BabyName } from '../types';

type FavoritesContextValue = {
  favorites: string[];
  favoriteNames: BabyName[];
  isFavorite: (name: string) => boolean;
  toggleFavorite: (name: string) => void;
  removeFavorite: (name: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const favoriteNames = useMemo(() => {
    const typedData = namesData as BabyName[];
    return typedData.filter((item) => favorites.includes(item.name));
  }, [favorites]);

  const toggleFavorite = (name: string) => {
    setFavorites((current) =>
      current.includes(name) ? current.filter((value) => value !== name) : [...current, name]
    );
  };

  const removeFavorite = (name: string) => {
    setFavorites((current) => current.filter((value) => value !== name));
  };

  const isFavorite = (name: string) => favorites.includes(name);

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
