import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { NameCard } from '../components/NameCard';
import { SearchBar } from '../components/SearchBar';
import { useFavorites } from '../context/FavoritesContext';
import namesData from '../data/babyNames.json';
import { BabyName, GenderFilter, HomeStackParamList } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'NameList'>;

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const NameListScreen = ({ route, navigation }: Props) => {
  const { category, initialQuery } = route.params;
  const [query, setQuery] = useState(initialQuery ?? '');
  const [gender, setGender] = useState<GenderFilter>('All');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');
  const { isFavorite, toggleFavorite } = useFavorites();

  const names = useMemo(() => {
    const typedData = namesData as BabyName[];

    return typedData.filter((item) => {
      const matchesCategory = item.category === category;
      const matchesSearch =
        !query.trim() ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.meaning.toLowerCase().includes(query.toLowerCase());
      const matchesGender = gender === 'All' || item.gender === gender;
      const matchesLetter = selectedLetter === 'All' || item.name.startsWith(selectedLetter);

      return matchesCategory && matchesSearch && matchesGender && matchesLetter;
    });
  }, [category, gender, query, selectedLetter]);

  return (
    <View style={styles.screen}>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search name or meaning" />

      <View style={styles.genderRow}>
        {(['All', 'Boy', 'Girl'] as GenderFilter[]).map((item) => {
          const active = gender === item;
          return (
            <Pressable
              key={item}
              onPress={() => setGender(item)}
              style={[styles.filterChip, active && styles.activeFilterChip]}
            >
              <Text style={[styles.filterText, active && styles.activeFilterText]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        horizontal
        data={['All', ...alphabet]}
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
              <Text style={[styles.alphaText, active && styles.activeAlphaText]}>{item}</Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={names}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No names match your filters.</Text>}
        renderItem={({ item }) => (
          <NameCard
            item={item}
            isFavorite={isFavorite(item.name)}
            onToggleFavorite={() => toggleFavorite(item.name)}
            onPress={() => navigation.navigate('NameDetail', { babyName: item })}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  genderRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#FBCFE8',
  },
  filterText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#9D174D',
  },
  alphabetRow: {
    paddingBottom: 12,
  },
  alphaChip: {
    backgroundColor: '#FFFFFF',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  activeAlphaChip: {
    backgroundColor: '#BFDBFE',
  },
  alphaText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
  activeAlphaText: {
    color: '#1D4ED8',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 30,
    fontSize: 15,
  },
});
