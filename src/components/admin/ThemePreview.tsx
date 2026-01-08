import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const ThemePreview: React.FC = () => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <Card style={styles.container}>
      <Card.Title title="Theme Preview" />
      <Card.Content>
        <Surface style={styles.previewContainer}>
          {/* Header Preview */}
          <View style={[styles.headerPreview, { backgroundColor: theme.primary }]}>
            <Text style={styles.headerText}>Header</Text>
          </View>

          {/* Button Preview */}
          <View style={styles.row}>
            <Button
              mode="contained"
              style={[styles.button, { backgroundColor: theme.primary }]}
              labelStyle={{ color: '#fff' }}
            >
              Primary Button
            </Button>
            <Button
              mode="outlined"
              style={styles.button}
              textColor={theme.primary}
            >
              Secondary Button
            </Button>
          </View>

          {/* Icons Preview */}
          <View style={styles.row}>
            <Icon name="check-circle" size={24} color={theme.primary} />
            <Icon name="star" size={24} color={theme.primary} />
            <Icon name="heart" size={24} color={theme.primary} />
          </View>

          {/* Text Preview */}
          <Text style={[styles.text, { color: theme.primary }]}>
            Sample Colored Text
          </Text>
        </Surface>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 8,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 8,
  },
  headerPreview: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    marginHorizontal: 8,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ThemePreview;