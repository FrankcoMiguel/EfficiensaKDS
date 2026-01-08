import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ChangeUserScreen from '../screens/Auth/ChangeUserScreen';
import DeviceManagementScreen from '../screens/Settings/DeviceManagementScreen';
import DashboardScreen from '../screens/Admin/DashboardScreen';
import ReportsScreen from '../screens/Admin/ReportsScreen';
import { MainScreen, KDSDisplayScreen, KitchenOrdersScreen } from '../screens/KDS';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from '../components/shared';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
    
    // Listen for app state changes to re-check onboarding
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkOnboardingStatus();
      }
    });
    
    // Also check periodically while app is active (for onboarding completion)
    const interval = setInterval(() => {
      checkOnboardingStatus();
    }, 1000);
    
    return () => {
      subscription?.remove();
      clearInterval(interval);
    };
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      setIsOnboardingComplete(hasCompletedOnboarding === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding if there's an error
      setIsOnboardingComplete(false);
    }
  };

  if (isLoading || isOnboardingComplete === null) {
    return <LoadingScreen message="Initializing..." />;
  }

  // Show onboarding for first-time users
  if (!isOnboardingComplete) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen 
          name="KDSDisplay" 
          component={KDSDisplayScreen}
          options={{ 
            animation: 'fade',
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="KitchenOrders" 
          component={KitchenOrdersScreen}
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
        <Stack.Screen name="ChangeUser" component={ChangeUserScreen} />
        <Stack.Screen 
          name="AdminDashboard" 
          component={DashboardScreen} 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="Reports" 
          component={ReportsScreen} 
          options={{ 
            headerShown: false 
          }} 
        />
        {isAdmin && (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;