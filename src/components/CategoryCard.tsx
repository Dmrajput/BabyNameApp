import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

type CategoryCardProps = {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
};

export const CategoryCard = ({ title, icon, color, onPress }: CategoryCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      style={styles.wrapper}
    >
      <Animated.View style={[styles.card, { backgroundColor: color, transform: [{ scale }] }]}>
        <View style={styles.iconCircle}>
          <FontAwesome6 name={icon} size={18} color="#4B5563" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 18,
    minHeight: 110,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFFCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 12,
    fontSize: 15,
    color: '#334155',
    fontWeight: '700',
  },
});
