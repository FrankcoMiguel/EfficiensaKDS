import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const STORAGE_KEY = 'kds_display_config';

export interface ScreenConfig {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
  duration: number; // seconds
}

export interface DisplayConfig {
  screens: ScreenConfig[];
  transitionType: 'fade' | 'slide' | 'none';
  autoRotate: boolean;
}

const DEFAULT_SCREENS: ScreenConfig[] = [
  { id: 'queue', name: 'Orders Queue', icon: 'list-outline', enabled: true, duration: 30 },
  { id: 'cooking', name: 'Cooking / In Progress', icon: 'flame-outline', enabled: true, duration: 30 },
  { id: 'expo', name: 'Ready / Expo', icon: 'checkmark-circle-outline', enabled: false, duration: 30 },
  { id: 'kitchen', name: 'Kitchen Orders', icon: 'restaurant-outline', enabled: false, duration: 30 },
  { id: 'delayed', name: 'Delayed / Attention', icon: 'alert-circle-outline', enabled: false, duration: 30 },
  { id: 'history', name: 'Completed / History', icon: 'time-outline', enabled: false, duration: 30 },
];

const TRANSITION_OPTIONS = [
  { id: 'fade', name: 'Fade', icon: 'contrast-outline' as const },
  { id: 'slide', name: 'Slide', icon: 'swap-horizontal-outline' as const },
  { id: 'none', name: 'None', icon: 'remove-outline' as const },
];

const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120];

const MainScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const [config, setConfig] = useState<DisplayConfig>({
    screens: DEFAULT_SCREENS,
    transitionType: 'fade',
    autoRotate: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const isLargeScreen = screenWidth >= 768;

  // Load saved config
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new screens
        const mergedScreens = DEFAULT_SCREENS.map(defaultScreen => {
          const savedScreen = parsed.screens?.find((s: ScreenConfig) => s.id === defaultScreen.id);
          return savedScreen || defaultScreen;
        });
        setConfig({
          ...parsed,
          screens: mergedScreens,
        });
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: DisplayConfig) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const toggleScreen = (screenId: string) => {
    const newScreens = config.screens.map(screen =>
      screen.id === screenId ? { ...screen, enabled: !screen.enabled } : screen
    );
    saveConfig({ ...config, screens: newScreens });
  };

  const updateDuration = (screenId: string, duration: number) => {
    const newScreens = config.screens.map(screen =>
      screen.id === screenId ? { ...screen, duration } : screen
    );
    saveConfig({ ...config, screens: newScreens });
  };

  const setTransitionType = (type: 'fade' | 'slide' | 'none') => {
    saveConfig({ ...config, transitionType: type });
  };

  const toggleAutoRotate = () => {
    saveConfig({ ...config, autoRotate: !config.autoRotate });
  };

  const enabledScreens = config.screens.filter(s => s.enabled);

  const startDisplay = () => {
    if (enabledScreens.length === 0) {
      return;
    }
    navigation.navigate('KDSDisplay', { config });
  };

  const openSingleScreen = (screenId: string) => {
    navigation.navigate('KDSDisplay', { 
      config: {
        ...config,
        screens: config.screens.map(s => ({ ...s, enabled: s.id === screenId })),
        autoRotate: false,
      }
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Efficiensa KDS</Text>
          <Text style={styles.headerSubtitle}>Configure your display screens</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && styles.scrollContentLarge
        ]}
      >
        {/* Screen Selection */}
        <View style={[styles.section, isLargeScreen && styles.sectionLarge]}>
          <Text style={styles.sectionTitle}>Display Screens</Text>
          <Text style={styles.sectionSubtitle}>
            Select which screens to show and set duration for each
          </Text>
          
          <View style={styles.screenList}>
            {config.screens.map((screen) => (
              <View key={screen.id} style={styles.screenItem}>
                <View style={styles.screenItemLeft}>
                  <TouchableOpacity
                    style={[
                      styles.screenToggle,
                      screen.enabled && styles.screenToggleEnabled,
                    ]}
                    onPress={() => toggleScreen(screen.id)}
                  >
                    <Ionicons 
                      name={screen.icon} 
                      size={24} 
                      color={screen.enabled ? '#fff' : '#6b7280'} 
                    />
                  </TouchableOpacity>
                  <View style={styles.screenInfo}>
                    <Text style={[
                      styles.screenName,
                      !screen.enabled && styles.screenNameDisabled
                    ]}>
                      {screen.name}
                    </Text>
                    {screen.enabled && config.autoRotate && (
                      <Text style={styles.screenDuration}>
                        {screen.duration}s display time
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.screenItemRight}>
                  {screen.enabled && config.autoRotate && (
                    <View style={styles.durationSelector}>
                      <TouchableOpacity
                        style={styles.durationButton}
                        onPress={() => {
                          const currentIndex = DURATION_OPTIONS.indexOf(screen.duration);
                          if (currentIndex > 0) {
                            updateDuration(screen.id, DURATION_OPTIONS[currentIndex - 1]);
                          }
                        }}
                      >
                        <Ionicons name="remove" size={18} color="#9ca3af" />
                      </TouchableOpacity>
                      <Text style={styles.durationText}>{screen.duration}s</Text>
                      <TouchableOpacity
                        style={styles.durationButton}
                        onPress={() => {
                          const currentIndex = DURATION_OPTIONS.indexOf(screen.duration);
                          if (currentIndex < DURATION_OPTIONS.length - 1) {
                            updateDuration(screen.id, DURATION_OPTIONS[currentIndex + 1]);
                          }
                        }}
                      >
                        <Ionicons name="add" size={18} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* <TouchableOpacity
                    style={styles.openButton}
                    onPress={() => openSingleScreen(screen.id)}
                  >
                    <Ionicons name="open-outline" size={20} color="#007AFF" />
                  </TouchableOpacity> */}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Auto Rotate Setting */}
        <View style={[styles.section, isLargeScreen && styles.sectionLarge]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.sectionTitle}>Auto-Rotate Screens</Text>
              <Text style={styles.sectionSubtitle}>
                Automatically cycle through enabled screens
              </Text>
            </View>
            <Switch
              value={config.autoRotate}
              onValueChange={toggleAutoRotate}
              trackColor={{ false: '#3d4559', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Transition Type */}
        {config.autoRotate && enabledScreens.length > 1 && (
          <View style={[styles.section, isLargeScreen && styles.sectionLarge]}>
            <Text style={styles.sectionTitle}>Transition Effect</Text>
            <Text style={styles.sectionSubtitle}>
              Animation when switching between screens
            </Text>
            
            <View style={styles.transitionOptions}>
              {TRANSITION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.transitionOption,
                    config.transitionType === option.id && styles.transitionOptionActive,
                  ]}
                  onPress={() => setTransitionType(option.id as 'fade' | 'slide' | 'none')}
                >
                  <Ionicons 
                    name={option.icon} 
                    size={24} 
                    color={config.transitionType === option.id ? '#fff' : '#9ca3af'} 
                  />
                  <Text style={[
                    styles.transitionOptionText,
                    config.transitionType === option.id && styles.transitionOptionTextActive,
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={[styles.section, styles.summarySection, isLargeScreen && styles.sectionLarge]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Screens Selected</Text>
            <Text style={styles.summaryValue}>{enabledScreens.length}</Text>
          </View>
          {config.autoRotate && enabledScreens.length > 1 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cycle Time</Text>
              <Text style={styles.summaryValue}>
                {enabledScreens.reduce((acc, s) => acc + s.duration, 0)}s
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.startButton,
            enabledScreens.length === 0 && styles.startButtonDisabled,
          ]}
          onPress={startDisplay}
          disabled={enabledScreens.length === 0}
        >
          <Ionicons name="play" size={24} color="#fff" />
          <Text style={styles.startButtonText}>
            {enabledScreens.length === 0 
              ? 'Select at least one screen' 
              : enabledScreens.length === 1 
                ? `Open ${enabledScreens[0].name}`
                : `Start Display (${enabledScreens.length} screens)`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f2e',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  scrollContentLarge: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    backgroundColor: '#2a3142',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionLarge: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    marginBottom: 16,
  },
  screenList: {
    gap: 12,
  },
  screenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3d4559',
    borderRadius: 12,
    padding: 14,
    paddingVertical: 16,
  },
  screenItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  screenToggle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  screenToggleEnabled: {
    backgroundColor: '#007AFF',
  },
  screenInfo: {
    flex: 1,
  },
  screenName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  screenNameDisabled: {
    color: '#6b7280',
  },
  screenDuration: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  screenItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a3142',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  durationButton: {
    padding: 8,
  },
  durationText: {
    fontSize: 14,
    color: '#fff',
    minWidth: 36,
    textAlign: 'center',
  },
  openButton: {
    padding: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  transitionOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  transitionOption: {
    flex: 1,
    backgroundColor: '#3d4559',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  transitionOptionActive: {
    backgroundColor: '#007AFF',
  },
  transitionOptionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  transitionOptionTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  summarySection: {
    backgroundColor: '#2a3142',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#9ca3af',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    backgroundColor: '#1a1f2e',
    borderTopWidth: 1,
    borderTopColor: '#2a3142',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
  },
  startButtonDisabled: {
    backgroundColor: '#3d4559',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MainScreen;
