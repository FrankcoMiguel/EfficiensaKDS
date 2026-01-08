import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { changeLanguage } from '../../i18n/i18n';

type RootStackParamList = {
  DeviceManagement: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type IconName = 'refresh-outline' | 'hardware-chip-outline' | 'language-outline';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setShowLanguageModal(false);
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the welcome tutorial again and require terminal setup when you restart the app. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('hasCompletedOnboarding');
              await AsyncStorage.removeItem('terminalCode');
              Alert.alert('Success', 'Onboarding and terminal setup have been reset. Restart the app to see the tutorial again.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset onboarding. Please try again.');
            }
          }
        }
      ]
    );
  };

  interface SettingRowProps {
    icon: IconName;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    isLast?: boolean;
    isDangerous?: boolean;
  }

  const SettingRow: React.FC<SettingRowProps> = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    isLast = false,
    isDangerous = false 
  }) => (
    <View>
      <TouchableOpacity 
        style={styles.settingRow} 
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.iconContainer, isDangerous && styles.dangerousIconContainer]}>
            <Ionicons 
              name={icon} 
              size={20} 
              color={isDangerous ? "#ff4444" : "#4F7DF3"} 
            />
          </View>
          <View style={styles.settingText}>
            <Text style={[
              styles.settingTitle, 
              isDangerous && styles.dangerousText
            ]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[
                styles.settingSubtitle, 
                isDangerous && styles.dangerousSubtitle
              ]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.settingRight}>
          {onPress && (
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDangerous ? "#ff4444" : "#666"} 
            />
          )}
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Devices Section */}
        <View style={styles.section}>
          <SettingRow
            icon="hardware-chip-outline"
            title="Device Management"
            subtitle="Configure connected devices"
            onPress={() => navigation.navigate('DeviceManagement')}
            isLast
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <SettingRow
            icon="refresh-outline"
            title="Reset Tutorial"
            subtitle="Show welcome tutorial again"
            onPress={handleResetOnboarding}
            isLast
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F7DF3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dangerousIconContainer: {
    backgroundColor: '#fff0f0',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dangerousText: {
    color: '#ff4444',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  dangerousSubtitle: {
    color: '#ff6666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 66,
  },
  bottomPadding: {
    height: 40,
  },
});

export default SettingsScreen;
