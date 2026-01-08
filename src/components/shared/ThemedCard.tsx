import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, CardProps } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';

interface ThemedCardProps extends Omit<CardProps, 'theme'> {
  variant?: 'default' | 'highlighted';
}

const ThemedCard: React.FC<ThemedCardProps> = ({ 
  variant = 'default',
  style,
  children,
  ...props 
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const cardStyle = variant === 'highlighted' ? {
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  } : {};

  return (
    <Card
      style={[styles.card, cardStyle, style]}
      {...props}
    >
      {children}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
  },
});

export default ThemedCard;