import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TouchableRipple } from 'react-native-paper';
import { themeColors, useTheme, ThemeColor } from '../../context/ThemeContext';

const ThemeSelector: React.FC = () => {
  const { themeColor, setThemeColor } = useTheme();

  return (
    <Card style={styles.container}>
      <Card.Title title="Theme Color" subtitle="Choose your restaurant's theme" />
      <Card.Content>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(themeColors).map(([key, color]: [string, (typeof themeColors)[keyof typeof themeColors]]) => (
            <TouchableRipple
              key={key}
              onPress={() => setThemeColor(key as ThemeColor)}
              style={[
                styles.colorOption,
                { backgroundColor: color.primary },
                themeColor === key && styles.selectedColor,
              ]}
            >
              <View style={styles.colorContent}>
                <View style={[styles.checkmark, themeColor === key && styles.checkmarkVisible]} />
                <Text style={styles.colorName}>{color.name}</Text>
              </View>
            </TouchableRipple>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    elevation: 4,
  },
  colorOption: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  colorContent: {
    alignItems: 'center',
  },
  colorName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  checkmarkVisible: {
    backgroundColor: '#fff',
  },
});

export default ThemeSelector;