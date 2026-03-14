import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { NameDetailScreen } from '../screens/NameDetailScreen';
import { NameListScreen } from '../screens/NameListScreen';
import { HomeStackParamList } from '../types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#FFF9F5' },
        headerTintColor: '#334155',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Baby Name Finder' }} />
      <Stack.Screen
        name="NameList"
        component={NameListScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <Stack.Screen name="NameDetail" component={NameDetailScreen} options={{ title: 'Name Details' }} />
    </Stack.Navigator>
  );
};
