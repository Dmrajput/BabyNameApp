import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryCard } from '../components/CategoryCard';
import { SearchBar } from '../components/SearchBar';
import { categories } from '../data/categories';
import { HomeStackParamList } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!query.trim()) {
      return categories;
    }

    const normalized = query.toLowerCase();
    return categories.filter((item) => item.title.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Baby Name Finder</Text>
      <Text style={styles.subheading}>Find beautiful names with meaning and origin.</Text>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search categories or prepare a name search" />

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.column}
        renderItem={({ item }) => (
          <CategoryCard
            title={item.title}
            icon={item.icon}
            color={item.color}
            onPress={() =>
              navigation.navigate('NameList', {
                category: item.id,
                title: item.title,
                initialQuery: query,
              })
            }
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
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  column: {
    justifyContent: 'space-between',
  },
});
