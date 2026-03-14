import { Redirect } from 'expo-router';

import SignupScreen from '@/src/screens/SignupScreen';
import { useAuth } from '@/src/context/AuthContext';

export default function SignupRoute() {
  const { userToken, isLoading } = useAuth();

  if (!isLoading && userToken) {
    return <Redirect href="/(tabs)" />;
  }

  return <SignupScreen />;
}
