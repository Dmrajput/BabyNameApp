import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryCard } from '../components/CategoryCard';
import { getNames } from '../services/api';
import { CategoryItem, HomeStackParamList } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError('');

        const names = await getNames();
        const uniqueCategories = Array.from(new Set(names.map((item) => item.category)));

        const categoryStyles: Record<string, { icon: string; color: string }> = {
          Hindu: { icon: 'om', color: '#FFE6D9' },
          Muslim: { icon: 'star-and-crescent', color: '#EAF8E7' },
          Modern: { icon: 'rocket-launch', color: '#E6F1FF' },
          Trending: { icon: 'trending-up', color: '#FFF2CC' },
        };

        const mapped = uniqueCategories.map((category) => {
          const style = categoryStyles[category] ?? { icon: 'heart', color: '#FDE68A' };
          return {
            id: category,
            title: `${category} Names`,
            icon: style.icon,
            color: style.color,
          };
        });

        setCategories(mapped);
      } catch (_error) {
        setError('Unable to load categories. Please check your API server.');
      } finally {
        setLoading(false);
      }
    };

    void loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories;
  }, [categories]);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Baby Name Finder</Text>
      <Text style={styles.subheading}>Find beautiful names with meaning and origin.</Text>

      {loading ? <ActivityIndicator color="#E86A6A" style={styles.loader} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={categories}
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
  loader: {
    marginVertical: 10,
  },
  errorText: {
    color: '#B91C1C',
    marginBottom: 10,
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 20,
  },
  column: {
    justifyContent: 'space-between',
  },
});
