import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TerminalSetupScreen from '../screens/Auth/TerminalSetupScreen';
import ChangeUserScreen from '../screens/Auth/ChangeUserScreen';

export type AuthStackParamList = {
  TerminalSetup: undefined; // Terminal Setup (Owner/Manager)
  ChangeUser: undefined; // Employee User Switching
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName="TerminalSetup">
      <Stack.Screen name="TerminalSetup" component={TerminalSetupScreen} />
      <Stack.Screen name="ChangeUser" component={ChangeUserScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;