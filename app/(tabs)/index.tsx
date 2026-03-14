import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/src/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { userData, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.badge}>Logged In</Text>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>You are authenticated successfully.</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{userData?.name ?? '-'}</Text>

          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userData?.email ?? '-'}</Text>
        </View>

        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef5ff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#c7dbff',
    color: '#1e3c72',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700',
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1f3352',
  },
  subtitle: {
    marginTop: 6,
    color: '#4b5f80',
    fontSize: 16,
    marginBottom: 20,
  },
  infoCard: {
    borderRadius: 20,
    backgroundColor: '#f7faff',
    borderColor: '#d8e5ff',
    borderWidth: 1,
    padding: 16,
    gap: 6,
    marginBottom: 20,
  },
  infoLabel: {
    color: '#54709e',
    fontSize: 13,
    marginTop: 4,
  },
  infoValue: {
    color: '#243a5f',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ffd4d9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#7f1d2b',
    fontWeight: '700',
    fontSize: 16,
  },
});
