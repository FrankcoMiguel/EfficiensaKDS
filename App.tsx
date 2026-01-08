import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { TableProvider } from './src/context/TableContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/i18n/LanguageContext';
import './src/i18n/i18n'; // Initialize i18n
import RootNavigator from './src/navigation/RootNavigator';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Inner app that can safely consume ThemeContext
const AppInner: React.FC = () => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider
        theme={{
          colors: {
            primary: theme.primary,
          },
        }}
      >
        <AuthProvider>
          <CartProvider>
            <TableProvider>
              <RootNavigator />
            </TableProvider>
          </CartProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

const App: React.FC = () => {
  return (
    <>
      <StatusBar 
        backgroundColor="#f8f9fa"
        barStyle="dark-content"
        animated={true}
        translucent={true}
      />
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AppInner />
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </>
  );
};

export default App;
