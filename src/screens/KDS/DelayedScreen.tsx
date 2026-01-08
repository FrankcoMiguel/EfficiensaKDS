import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KDSOrderCard from '../../components/kds/KDSOrderCard';
import { KDSOrder } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for delayed orders needing attention
const generateMockOrders = (): KDSOrder[] => {
  const now = new Date();
  return [
    {
      id: '1',
      orderNumber: '028',
      tableName: 'Table 15',
      orderType: 'dine-in',
      items: [
        { id: '1a', name: 'Prime Rib', quantity: 1, status: 'in-progress', station: 'grill', modifiers: ['Medium'] },
        { id: '1b', name: 'Loaded Potato', quantity: 1, status: 'pending', station: 'prep' },
        { id: '1c', name: 'Creamed Spinach', quantity: 1, status: 'pending', station: 'prep' },
      ],
      status: 'delayed',
      priority: 'vip',
      createdAt: new Date(now.getTime() - 1200000), // 20 minutes ago
      startedAt: new Date(now.getTime() - 1080000),
      source: 'POS',
      server: 'Carlos',
      notes: 'Customer complained about wait time',
    },
    {
      id: '2',
      orderNumber: '030',
      tableName: 'Table 4',
      orderType: 'dine-in',
      items: [
        { id: '2a', name: 'Lobster Tail', quantity: 2, status: 'pending', station: 'grill' },
        { id: '2b', name: 'Butter', quantity: 2, status: 'done', station: 'prep' },
        { id: '2c', name: 'Lemon Wedges', quantity: 2, status: 'done', station: 'prep' },
      ],
      status: 'delayed',
      priority: 'rush',
      createdAt: new Date(now.getTime() - 900000), // 15 minutes ago
      startedAt: new Date(now.getTime() - 780000),
      source: 'POS',
      server: 'Anna',
      notes: 'Kitchen ran out of lobster, had to get more',
    },
    {
      id: '3',
      orderNumber: '032',
      orderType: 'delivery',
      items: [
        { id: '3a', name: 'Family Meal Deal', quantity: 1, status: 'in-progress', station: 'grill' },
        { id: '3b', name: 'Extra Sides', quantity: 4, status: 'pending', station: 'prep' },
      ],
      status: 'delayed',
      priority: 'rush',
      createdAt: new Date(now.getTime() - 840000), // 14 minutes ago
      startedAt: new Date(now.getTime() - 720000),
      source: 'DoorDash',
      notes: 'Driver waiting',
    },
  ];
};

const DelayedScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setOrders(generateMockOrders());
  }, []);

  // Attention-grabbing pulse animation
  useEffect(() => {
    if (orders.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [orders.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setOrders(generateMockOrders());
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleBump = (orderId: string) => {
    // Mark as resolved
    setOrders(prev =>
      prev.filter(order => order.id !== orderId)
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
                  ? {
                      ...item,
                      status: item.status === 'done' ? 'pending' : 'done',
                    }
                  : item
              ),
            }
          : order
      )
    );
  };

  const delayedOrders = orders.filter(order => order.status === 'delayed');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#FF3B30" />
      
      {/* Alert Header */}
      {delayedOrders.length > 0 && (
        <Animated.View style={[styles.alertBanner, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="warning" size={24} color="#fff" />
          <Text style={styles.alertText}>
            {delayedOrders.length} order{delayedOrders.length !== 1 ? 's' : ''} need{delayedOrders.length === 1 ? 's' : ''} immediate attention!
          </Text>
        </Animated.View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="alert-circle" size={28} color="#FF3B30" />
          <Text style={styles.headerTitle}>Delayed / Attention</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <View style={[styles.countBadge, { backgroundColor: '#FF3B30' }]}>
              <Text style={styles.countText}>{delayedOrders.length}</Text>
            </View>
            <Text style={styles.statLabel}>Delayed</Text>
          </View>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {delayedOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="thumbs-up" size={64} color="#34C759" />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptySubtitle}>
              No delayed orders requiring attention
            </Text>
          </View>
        ) : (
          <View style={styles.ordersGrid}>
            {delayedOrders.map(order => (
              <View key={order.id} style={styles.orderCardWrapper}>
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

      {/* Action Bar */}
      {delayedOrders.length > 0 && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.acknowledgeButton}
            onPress={() => {
              // Acknowledge all - in real app would mark as acknowledged
            }}
          >
            <Ionicons name="eye" size={20} color="#FF3B30" />
            <Text style={styles.acknowledgeText}>Acknowledge All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.prioritizeButton}
            onPress={() => {
              // Would re-prioritize these orders
            }}
          >
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.prioritizeText}>Rush All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f2e',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    gap: 10,
  },
  alertText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  countBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  countText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  ordersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  orderCardWrapper: {
    width: SCREEN_WIDTH > 768 ? (SCREEN_WIDTH - 56) / 2 : SCREEN_WIDTH - 40,
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#2a3142',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  acknowledgeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3d4559',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
    gap: 8,
  },
  acknowledgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  prioritizeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  prioritizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DelayedScreen;
