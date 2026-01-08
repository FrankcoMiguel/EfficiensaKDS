import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';

interface ThemedButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
}

const ThemedButton: React.FC<ThemedButtonProps> = ({ 
  variant = 'primary',
  style,
  ...props 
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
        };
      case 'secondary':
        return {
          backgroundColor: (theme as any).light,
          borderColor: (theme as any).light,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.primary,
          borderWidth: 1,
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#fff';
      case 'secondary':
        return (theme as any).dark;
      case 'outline':
        return theme.primary;
      default:
        return '#fff';
    }
  };

  return (
    <Button
      mode={variant === 'outline' ? 'outlined' : 'contained'}
      style={[styles.button, getButtonStyle(), style]}
      textColor={getTextColor()}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    marginVertical: 8,
  },
});

export default ThemedButton;