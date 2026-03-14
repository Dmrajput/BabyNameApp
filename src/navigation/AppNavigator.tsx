import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { BottomTabNavigator } from './BottomTabNavigator';

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFF9F5',
    card: '#FFFFFF',
    text: '#1F2937',
    border: '#F3E8E1',
    primary: '#E86A6A',
  },
};

export const AppNavigator = () => {
  return (
    <NavigationContainer theme={appTheme}>
      <BottomTabNavigator />
    </NavigationContainer>
  );
};
