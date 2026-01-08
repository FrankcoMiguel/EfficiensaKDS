import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import DashboardScreen from '../screens/Admin/DashboardScreen';
import ReportsScreen from '../screens/Admin/ReportsScreen';

export type AdminStackParamList = {
  Dashboard: undefined;
  Reports: undefined;
};

const Stack = createStackNavigator<AdminStackParamList>();

const AdminNavigator: React.FC = () => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Recent Orders' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;