import { Redirect } from 'expo-router';

import LoginScreen from '@/src/screens/LoginScreen';
import { useAuth } from '@/src/context/AuthContext';

export default function LoginRoute() {
  const { userToken, isLoading } = useAuth();

  if (!isLoading && userToken) {
    return <Redirect href="/(tabs)" />;
  }

  return <LoginScreen />;
}
