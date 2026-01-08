import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';

interface ThemedHeaderProps {
  title: string;
  subtitle?: string;
}

const ThemedHeader: React.FC<ThemedHeaderProps> = ({ title, subtitle }) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <Text variant="headlineMedium" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="titleMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
});

export default ThemedHeader;