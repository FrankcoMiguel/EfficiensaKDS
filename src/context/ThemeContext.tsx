import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@app_theme';

// Efficiensa Blue Theme Colors
export const themeColors = {
  efficiensa: {
    name: 'Efficiensa Blue',
    // Primary colors
    primary: '#162570',      // Dark navy blue - main brand color
    secondary: '#2B9EDE',    // Bright blue - accents, borders
    accent: '#4F7DF3',       // Medium blue - icons, interactive elements
    // Background colors
    background: '#F4F6FC',   // Light gray-blue - main background
    surface: '#FFFFFF',      // White - cards, surfaces
    surfaceLight: '#eff6ff', // Very light blue - menu items, subtle backgrounds
    surfaceBorder: '#bfdbfe', // Light blue - borders
    // Text colors
    textPrimary: '#333333',  // Dark gray - main text
    textSecondary: '#64748B', // Medium gray - secondary text
    textMuted: '#798698',    // Muted gray - descriptions
    textOnPrimary: '#FFFFFF', // White - text on primary color
    // State colors
    success: '#4CAF50',      // Green - success states
    error: '#ff4444',        // Red - error states, destructive actions
    warning: '#FF9800',      // Orange - warning states
    // Border colors
    border: '#E1E8F0',       // Light gray - general borders
    borderActive: '#2B9EDE', // Blue - active/focused borders
  },
};

export type ThemeColor = keyof typeof themeColors;

interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  success: string;
  error: string;
  warning: string;
  border: string;
  borderActive: string;
}

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  getCurrentTheme: () => Theme;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColorState] = useState<ThemeColor>('efficiensa');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && savedTheme in themeColors) {
        setThemeColorState(savedTheme as ThemeColor);
      }
    } catch (error) {
      console.warn('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeColor = async (color: ThemeColor) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, color);
      setThemeColorState(color);
    } catch (error) {
      console.warn('Error saving theme:', error);
    }
  };

  const getCurrentTheme = () => themeColors[themeColor];
  const theme = themeColors[themeColor];

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, getCurrentTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};