import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, TouchableRipple, Text, Divider } from 'react-native-paper';
import { themeColors, useTheme, ThemeColor } from '../../context/ThemeContext';

const ThemeSelector: React.FC = () => {
  const { themeColor, setThemeColor } = useTheme();

  return (
    <>
      <List.Section>
        <List.Subheader>Theme Colors</List.Subheader>
        {Object.entries(themeColors).map(([key, color]) => (
          <List.Item
            key={key}
            title={color.name}
            left={() => (
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: color.primary }
                ]}
              />
            )}
            right={() => (
              themeColor === key ? (
                <List.Icon icon="check" color={color.primary} />
              ) : null
            )}
            onPress={() => setThemeColor(key as ThemeColor)}
          />
        ))}
      </List.Section>
      <Divider />
    </>
  );
};

const styles = StyleSheet.create({
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 8,
  },
});

export default ThemeSelector;