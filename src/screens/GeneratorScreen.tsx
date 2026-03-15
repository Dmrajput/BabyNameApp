import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useFavorites } from '../context/FavoritesContext';
import { generateBabyNames } from '../services/api';
import { BabyName, GeneratedName, NameGender } from '../types';

export const GeneratorScreen = () => {
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [gender, setGender] = useState<NameGender>('Boy');
  const [results, setResults] = useState<GeneratedName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isFavorite, toggleFavorite } = useFavorites();

  const mappedResults = useMemo(() => {
    return results.map((item) => {
      const safeId = `ai-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${item.gender.toLowerCase()}`;
      const favoriteShape: BabyName = {
        _id: safeId,
        name: item.name,
        meaning: item.meaning,
        gender: item.gender,
        origin: 'AI Generated',
        category: 'AI',
      };

      return {
        ...item,
        favoriteShape,
      };
    });
  }, [results]);

  const onGenerate = async () => {
    if (loading) {
      return;
    }

    if (!fatherName.trim() || !motherName.trim()) {
      Alert.alert('Both father and mother names are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await generateBabyNames(fatherName.trim(), motherName.trim(), gender);
      setResults(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate names right now. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onShare = async (item: GeneratedName) => {
    try {
      await Share.share({
        message: `${item.name} (${item.gender}) - ${item.meaning}`,
      });
    } catch {
      Alert.alert('Unable to share this name right now.');
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Baby Name Generator</Text>
      <Text style={styles.subheading}>Generate AI names with meaning from both parent names.</Text>

      <TextInput
        placeholder="Father Name"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={fatherName}
        onChangeText={setFatherName}
      />
      <TextInput
        placeholder="Mother Name"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={motherName}
        onChangeText={setMotherName}
      />

      <View style={styles.genderRow}>
        {(['Boy', 'Girl', 'Unisex'] as NameGender[]).map((item) => {
          const active = gender === item;
          return (
            <Pressable
              key={item}
              onPress={() => setGender(item)}
              style={[styles.genderChip, active && styles.genderChipActive]}
            >
              <Text style={[styles.genderChipText, active && styles.genderChipTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onGenerate}>
        {loading ? <ActivityIndicator color="#7F1D1D" /> : <Text style={styles.buttonText}>Generate AI Names</Text>}
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={mappedResults}
        keyExtractor={(item) => item.favoriteShape._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Enter names, choose gender, then tap Generate AI Names.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <View style={styles.resultTopRow}>
              <View style={styles.resultTextWrap}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultMeaning}>{item.meaning}</Text>
                <Text style={styles.resultGender}>{item.gender}</Text>
              </View>

              <View style={styles.iconColumn}>
                <Pressable onPress={() => toggleFavorite(item.favoriteShape)} hitSlop={10}>
                  <MaterialCommunityIcons
                    name={isFavorite(item.favoriteShape._id) ? 'heart' : 'heart-outline'}
                    size={22}
                    color={isFavorite(item.favoriteShape._id) ? '#EF4444' : '#64748B'}
                  />
                </Pressable>

                <Pressable onPress={() => onShare(item)} hitSlop={10}>
                  <MaterialCommunityIcons name="share-variant" size={22} color="#64748B" />
                </Pressable>
              </View>
            </View>
          </View>
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
    color: '#1F2937',
  },
  genderRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  genderChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F3E8E1',
  },
  genderChipActive: {
    backgroundColor: '#FBCFE8',
    borderColor: '#F9A8D4',
  },
  genderChipText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  genderChipTextActive: {
    color: '#9D174D',
  },
  button: {
    backgroundColor: '#FCA5A5',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 13,
    marginBottom: 14,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#7F1D1D',
    fontWeight: '800',
    fontSize: 15,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 24,
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  resultTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  resultName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1E293B',
  },
  resultMeaning: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 2,
  },
  resultGender: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '700',
  },
  iconColumn: {
    rowGap: 12,
    alignItems: 'center',
  },
});
