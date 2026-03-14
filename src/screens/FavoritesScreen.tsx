import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { NameCard } from '../components/NameCard';
import { useFavorites } from '../context/FavoritesContext';

export const FavoritesScreen = () => {
  const navigation = useNavigation<any>();
  const { favoriteNames, isFavorite, removeFavorite } = useFavorites();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Favorite Names</Text>
      <Text style={styles.subheading}>Your saved shortlist appears here.</Text>

      <FlatList
        data={favoriteNames}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No favorites yet. Add from name list.</Text>}
        renderItem={({ item }) => (
          <NameCard
            item={item}
            isFavorite={isFavorite(item.name)}
            onToggleFavorite={() => removeFavorite(item.name)}
            onPress={() =>
              navigation.navigate('HomeTab' as never, {
                screen: 'NameDetail',
                params: { babyName: item },
              } as never)
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
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 24,
  },
});
