import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { generateBabyNames } from '../utils/nameGenerator';

export const GeneratorScreen = () => {
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const onGenerate = () => {
    setResults(generateBabyNames(fatherName, motherName));
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Baby Name Generator</Text>
      <Text style={styles.subheading}>Blend parent names into beautiful ideas.</Text>

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

      <Pressable style={styles.button} onPress={onGenerate}>
        <Text style={styles.buttonText}>Generate Names</Text>
      </Pressable>

      <FlatList
        data={results}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Enter both names and tap Generate to see results.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <Text style={styles.resultName}>{item}</Text>
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
  button: {
    backgroundColor: '#FCA5A5',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 13,
    marginBottom: 14,
  },
  buttonText: {
    color: '#7F1D1D',
    fontWeight: '800',
    fontSize: 15,
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
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  resultName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1E293B',
  },
});
