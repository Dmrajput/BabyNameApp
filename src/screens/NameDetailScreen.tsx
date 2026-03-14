import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useFavorites } from '../context/FavoritesContext';
import { getNameById } from '../services/api';
import { BabyName, HomeStackParamList } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'NameDetail'>;

export const NameDetailScreen = ({ route }: Props) => {
  const { nameId } = route.params;
  const [babyName, setBabyName] = useState<BabyName | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const loadNameDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getNameById(nameId);
        setBabyName(data);
      } catch (_error) {
        setError('Unable to load details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    void loadNameDetails();
  }, [nameId]);

  const onShare = async () => {
    if (!babyName) {
      return;
    }

    try {
      await Share.share({
        message: `${babyName.name}: ${babyName.meaning} (${babyName.origin}, ${babyName.gender})`,
      });
    } catch {
      Alert.alert('Unable to share right now.');
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
        <Text style={styles.errorText}>{error || 'Name not found.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
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

        <View style={styles.buttonRow}>
          <Pressable style={styles.actionButton} onPress={() => toggleFavorite(babyName)}>
            <MaterialCommunityIcons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={favorite ? '#DC2626' : '#334155'}
            />
            <Text style={styles.actionText}>{favorite ? 'Saved' : 'Favorite'}</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={onShare}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#334155" />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  name: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  meaning: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 15,
    color: '#475569',
  },
  value: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '700',
  },
});
