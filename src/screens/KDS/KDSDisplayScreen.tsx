import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  useWindowDimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DisplayConfig, ScreenConfig } from './MainScreen';
import KDSOrderCard from '../../components/kds/KDSOrderCard';
import { KDSOrder } from '../../types';

type RouteParams = {
  KDSDisplay: {
    config: DisplayConfig;
  };
};

// Mock data generator
const generateMockOrders = (status?: string): KDSOrder[] => {
  const now = new Date();
  const allOrders: KDSOrder[] = [
    {
      id: '1',
      orderNumber: '1241',
      tableName: '8',
      orderType: 'dine-in',
      items: [
        { id: '1a', name: 'Chicken Burger', quantity: 1, status: 'in-progress' },
        { id: '1b', name: 'Fries (Large)', quantity: 1, status: 'done' },
        { id: '1c', name: 'Milkshake', quantity: 1, status: 'pending' },
      ],
      status: 'cooking',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 225000),
      startedAt: new Date(now.getTime() - 225000),
      notes: 'No pickles',
    },
    {
      id: '2',
      orderNumber: '1238',
      tableName: '3',
      orderType: 'dine-in',
      items: [
        { id: '2a', name: 'Veggie Pizza', quantity: 2, status: 'done' },
        { id: '2b', name: 'Side Salad', quantity: 1, status: 'done' },
      ],
      status: 'ready',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 80000),
      startedAt: new Date(now.getTime() - 80000),
    },
    {
      id: '3',
      orderNumber: '1242',
      orderType: 'takeout',
      items: [
        { id: '3a', name: 'Steak Sandwich', quantity: 1, status: 'pending' },
        { id: '3b', name: 'Onion Rings', quantity: 1, status: 'pending' },
      ],
      status: 'cooking',
      priority: 'rush',
      createdAt: new Date(now.getTime() - 180000),
      startedAt: new Date(now.getTime() - 150000),
    },
    {
      id: '4',
      orderNumber: '1243',
      tableName: '12',
      orderType: 'dine-in',
      items: [
        { id: '4a', name: 'Pasta Carbonara', quantity: 2, status: 'pending' },
        { id: '4b', name: 'Garlic Bread', quantity: 1, status: 'pending' },
      ],
      status: 'queue',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 30000),
    },
    {
      id: '5',
      orderNumber: '1244',
      tableName: '5',
      orderType: 'dine-in',
      items: [
        { id: '5a', name: 'Fish & Chips', quantity: 1, status: 'pending' },
        { id: '5b', name: 'Coleslaw', quantity: 1, status: 'pending' },
      ],
      status: 'queue',
      priority: 'vip',
      createdAt: new Date(now.getTime() - 45000),
      notes: 'VIP Guest - Priority',
    },
    {
      id: '6',
      orderNumber: '1240',
      orderType: 'delivery',
      items: [
        { id: '6a', name: 'Family Combo', quantity: 1, status: 'done' },
        { id: '6b', name: 'Extra Sauce', quantity: 3, status: 'done' },
      ],
      status: 'delayed',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 900000),
      startedAt: new Date(now.getTime() - 850000),
      notes: 'Driver delayed',
    },
    {
      id: '7',
      orderNumber: '1235',
      tableName: '2',
      orderType: 'dine-in',
      items: [
        { id: '7a', name: 'Caesar Salad', quantity: 1, status: 'done' },
        { id: '7b', name: 'Soup of the Day', quantity: 2, status: 'done' },
      ],
      status: 'completed',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 1800000),
      startedAt: new Date(now.getTime() - 1750000),
      completedAt: new Date(now.getTime() - 1200000),
    },
  ];

  if (!status) return allOrders;
  
  // Filter based on screen type
  switch (status) {
    case 'queue':
      return allOrders.filter(o => o.status === 'queue' || o.status === 'cooking');
    case 'cooking':
      return allOrders.filter(o => o.status === 'cooking');
    case 'expo':
      return allOrders.filter(o => o.status === 'ready');
    case 'delayed':
      return allOrders.filter(o => o.status === 'delayed');
    case 'history':
      return allOrders.filter(o => o.status === 'completed');
    case 'kitchen':
      return allOrders.filter(o => o.status === 'cooking' || o.status === 'queue' || o.status === 'ready');
    default:
      return allOrders;
  }
};

const HORIZONTAL_PADDING = 20;
const CARD_GAP = 16;

const getResponsiveColumns = (screenWidth: number): number => {
  if (screenWidth >= 1200) return 4;
  if (screenWidth >= 900) return 3;
  if (screenWidth >= 600) return 2;
  return 1;
};

const KDSDisplayScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'KDSDisplay'>>();
  
  const { config } = route.params;
  const enabledScreens = config.screens.filter(s => s.enabled);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const currentScreen = enabledScreens[currentIndex];
  const columns = getResponsiveColumns(screenWidth);
  const cardWidth = (screenWidth - HORIZONTAL_PADDING * 2 - (columns - 1) * CARD_GAP) / columns;

  // Auto-hide controls
  const showControls = useCallback(() => {
    // Clear existing timer
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    
    // Show controls
    setControlsVisible(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    // Set timer to hide controls after 3 seconds
    hideControlsTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    }, 3000);
  }, [controlsOpacity]);

  const handleScreenTap = useCallback(() => {
    if (controlsVisible) {
      // If visible, hide immediately
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    } else {
      // If hidden, show controls
      showControls();
    }
  }, [controlsVisible, controlsOpacity, showControls]);

  // Initialize auto-hide on mount
  useEffect(() => {
    showControls();
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  // Load orders for current screen
  useEffect(() => {
    if (currentScreen) {
      setOrders(generateMockOrders(currentScreen.id));
    }
  }, [currentScreen?.id]);

  // Auto-rotate timer
  useEffect(() => {
    if (!config.autoRotate || enabledScreens.length <= 1 || isPaused) {
      return;
    }

    const duration = currentScreen?.duration || 30;

    // Reset and start progress animation
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setTimeout(() => {
      transitionToNext();
    }, duration * 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      progressAnim.stopAnimation();
    };
  }, [currentIndex, config.autoRotate, isPaused, enabledScreens.length]);

  const transitionToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % enabledScreens.length;
    
    if (config.transitionType === 'fade') {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => setCurrentIndex(nextIndex), 300);
    } else if (config.transitionType === 'slide') {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenWidth,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => setCurrentIndex(nextIndex), 300);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, enabledScreens.length, config.transitionType, screenWidth]);

  const transitionToPrev = useCallback(() => {
    const prevIndex = currentIndex === 0 ? enabledScreens.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
  }, [currentIndex, enabledScreens.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setOrders(generateMockOrders(currentScreen?.id));
      setRefreshing(false);
    }, 1000);
  }, [currentScreen?.id]);

  const handleBump = (orderId: string) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          if (order.status === 'queue') {
            return { ...order, status: 'cooking' as const, startedAt: new Date() };
          }
          if (order.status === 'cooking' || order.status === 'ready') {
            return { ...order, status: 'completed' as const, completedAt: new Date() };
          }
        }
        return order;
      }).filter(order => {
        // Filter based on current screen
        if (currentScreen?.id === 'queue') {
          return order.status === 'queue' || order.status === 'cooking';
        }
        if (currentScreen?.id === 'cooking') {
          return order.status === 'cooking';
        }
        return order.status !== 'completed';
      })
    );
  };

  const handleItemToggle = (orderId: string, itemId: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map(item =>
                item.id === itemId
                  ? { ...item, status: item.status === 'done' ? 'pending' : 'done' }
                  : item
              ),
            }
          : order
      )
    );
  };

  const getScreenTitle = (screen: ScreenConfig): string => {
    switch (screen.id) {
      case 'queue': return 'Orders Queue';
      case 'cooking': return 'Cooking';
      case 'expo': return 'Ready / Expo';
      case 'delayed': return 'Needs Attention';
      case 'history': return 'Completed';
      case 'kitchen': return 'Kitchen Status';
      default: return screen.name;
    }
  };

  const getScreenColor = (screen: ScreenConfig): string => {
    switch (screen.id) {
      case 'queue': return '#007AFF';
      case 'cooking': return '#FF9500';
      case 'expo': return '#34C759';
      case 'delayed': return '#FF3B30';
      case 'history': return '#8E8E93';
      case 'kitchen': return '#10B981';
      default: return '#007AFF';
    }
  };

  if (!currentScreen) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>No screens configured</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />
        
        {/* Header - Auto-hide */}
        <Animated.View style={[styles.header, { opacity: controlsOpacity }]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={[styles.screenIndicator, { backgroundColor: getScreenColor(currentScreen) }]}>
              <Ionicons name={currentScreen.icon} size={20} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>{getScreenTitle(currentScreen)}</Text>
            <Text style={styles.headerCount}>{orders.length} orders</Text>
          </View>

          <View style={styles.headerRight}>
            {enabledScreens.length > 1 && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  setIsPaused(!isPaused);
                  showControls();
                }}
              >
                <Ionicons 
                  name={isPaused ? 'play' : 'pause'} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Progress bar for auto-rotate */}
        {config.autoRotate && enabledScreens.length > 1 && !isPaused && (
          <Animated.View style={[styles.progressContainer, { opacity: controlsOpacity }]}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: progressWidth,
                  backgroundColor: getScreenColor(currentScreen),
                }
              ]} 
            />
          </Animated.View>
        )}

        {/* Screen indicators */}
        {enabledScreens.length > 1 && (
          <Animated.View style={[styles.screenIndicators, { opacity: controlsOpacity }]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
            {enabledScreens.map((screen, index) => (
              <TouchableOpacity
                key={screen.id}
                style={[
                  styles.indicatorDot,
                  index === currentIndex && styles.indicatorDotActive,
                  index === currentIndex && { backgroundColor: getScreenColor(screen) },
                ]}
                onPress={() => {
                  setCurrentIndex(index);
                  showControls();
                }}
              />
            ))}
          </Animated.View>
        )}

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons 
                name={currentScreen.id === 'delayed' ? 'checkmark-circle' : 'restaurant-outline'} 
                size={64} 
                color={currentScreen.id === 'delayed' ? '#34C759' : '#6b7280'} 
              />
              <Text style={styles.emptyTitle}>
                {currentScreen.id === 'delayed' ? 'No Delayed Orders' : 'No Orders'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {currentScreen.id === 'delayed' 
                  ? 'All orders are on time!' 
                  : 'Orders will appear here'}
              </Text>
            </View>
          ) : (
            <View style={styles.ordersGrid}>
              {orders.map(order => (
                <View key={order.id} style={{ width: cardWidth }}>
                  <KDSOrderCard
                    order={order}
                    onBump={handleBump}
                    onItemToggle={handleItemToggle}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Navigation arrows for manual control - Auto-hide */}
      {enabledScreens.length > 1 && (
        <Animated.View style={[styles.navArrowsContainer, { opacity: controlsOpacity }]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
          <TouchableOpacity
            style={[styles.navArrow, styles.navArrowLeft]}
            onPress={() => {
              transitionToPrev();
              showControls();
            }}
          >
            <Ionicons name="chevron-back" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navArrow, styles.navArrowRight]}
            onPress={() => {
              transitionToNext();
              showControls();
            }}
          >
            <Ionicons name="chevron-forward" size={32} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
      </View>
    </TouchableWithoutFeedback>
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
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  screenIndicator: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerCount: {
    fontSize: 14,
    color: '#9ca3af',
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#2a3142',
  },
  progressBar: {
    height: '100%',
  },
  screenIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3d4559',
  },
  indicatorDotActive: {
    width: 24,
    borderRadius: 5,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: HORIZONTAL_PADDING,
  },
  ordersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
  },
  navArrowsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(42, 49, 66, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
  },
  navArrowLeft: {
    left: 8,
  },
  navArrowRight: {
    right: 8,
  },
});

export default KDSDisplayScreen;
