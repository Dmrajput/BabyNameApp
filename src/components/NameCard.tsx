import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { BabyName } from '../types';

type NameCardProps = {
  item: BabyName;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
};

export const NameCard = ({ item, isFavorite, onToggleFavorite, onPress }: NameCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.985,
      duration: 110,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 110,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.left}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meaning}>{item.meaning}</Text>
          <Text style={styles.meta}>
            {item.gender} • {item.origin}
          </Text>
          <Text style={styles.rating}>Rating: {(item.rating ?? 0).toFixed(1)} / 5</Text>
        </View>

        <Pressable onPress={onToggleFavorite} hitSlop={12}>
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#EF4444' : '#64748B'}
          />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: '800',
    marginBottom: 4,
  },
  meaning: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#6B7280',
  },
  rating: {
    marginTop: 4,
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
  },
});
