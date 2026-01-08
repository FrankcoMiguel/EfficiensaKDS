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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KDSOrderCard from '../../components/kds/KDSOrderCard';
import { KDSOrder } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for ready orders
const generateMockOrders = (): KDSOrder[] => {
  const now = new Date();
  return [
    {
      id: '1',
      orderNumber: '035',
      tableName: 'Table 8',
      orderType: 'dine-in',
      items: [
        { id: '1a', name: 'Filet Mignon', quantity: 1, status: 'done', station: 'grill' },
        { id: '1b', name: 'Truffle Fries', quantity: 1, status: 'done', station: 'fry' },
        { id: '1c', name: 'Garden Salad', quantity: 1, status: 'done', station: 'prep' },
      ],
      status: 'ready',
      priority: 'vip',
      createdAt: new Date(now.getTime() - 900000), // 15 minutes ago
      startedAt: new Date(now.getTime() - 780000),
      readyAt: new Date(now.getTime() - 60000), // Ready 1 minute ago
      source: 'POS',
      server: 'Emma',
    },
    {
      id: '2',
      orderNumber: '036',
      orderType: 'takeout',
      items: [
        { id: '2a', name: 'BBQ Ribs', quantity: 1, status: 'done', station: 'grill' },
        { id: '2b', name: 'Mac & Cheese', quantity: 1, status: 'done', station: 'prep' },
        { id: '2c', name: 'Cornbread', quantity: 2, status: 'done', station: 'prep' },
      ],
      status: 'ready',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 720000), // 12 minutes ago
      startedAt: new Date(now.getTime() - 600000),
      readyAt: new Date(now.getTime() - 120000), // Ready 2 minutes ago
      source: 'Online',
    },
    {
      id: '3',
      orderNumber: '037',
      tableName: 'Table 2',
      orderType: 'dine-in',
      items: [
        { id: '3a', name: 'Margherita Pizza', quantity: 1, status: 'done', station: 'grill' },
        { id: '3b', name: 'Breadsticks', quantity: 1, status: 'done', station: 'prep' },
      ],
      status: 'ready',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 600000), // 10 minutes ago
      startedAt: new Date(now.getTime() - 480000),
      readyAt: new Date(now.getTime() - 180000), // Ready 3 minutes ago
      source: 'POS',
      server: 'David',
    },
  ];
};

const ExpoScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setOrders(generateMockOrders());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setOrders(generateMockOrders());
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleBump = (orderId: string) => {
    // Complete the order
    setOrders(prev =>
      prev.filter(order => order.id !== orderId)
    );
  };

  const handleRecall = (orderId: string) => {
    // Send order back to cooking
    setOrders(prev =>
      prev.filter(order => order.id !== orderId)
    );
    // In real app, this would update the order status to 'cooking' in the backend
  };

  const readyOrders = orders.filter(order => order.status === 'ready');
  
  // Group by order type
  const dineInOrders = readyOrders.filter(o => o.orderType === 'dine-in');
  const takeoutOrders = readyOrders.filter(o => o.orderType === 'takeout');
  const deliveryOrders = readyOrders.filter(o => o.orderType === 'delivery');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="checkmark-circle" size={28} color="#34C759" />
          <Text style={styles.headerTitle}>Expo / Ready</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <View style={[styles.countBadge, { backgroundColor: '#34C759' }]}>
              <Text style={styles.countText}>{readyOrders.length}</Text>
            </View>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Bar */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Ionicons name="restaurant" size={18} color="#007AFF" />
          <Text style={styles.quickStatText}>{dineInOrders.length} Dine-in</Text>
        </View>
        <View style={styles.quickStatItem}>
          <Ionicons name="bag-handle" size={18} color="#FF9500" />
          <Text style={styles.quickStatText}>{takeoutOrders.length} Takeout</Text>
        </View>
        <View style={styles.quickStatItem}>
          <Ionicons name="bicycle" size={18} color="#AF52DE" />
          <Text style={styles.quickStatText}>{deliveryOrders.length} Delivery</Text>
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
        {readyOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={64} color="#34C759" />
            <Text style={styles.emptyTitle}>No Orders Ready</Text>
            <Text style={styles.emptySubtitle}>
              Completed orders will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.ordersGrid}>
            {readyOrders.map(order => (
              <View key={order.id} style={styles.orderCardWrapper}>
                <KDSOrderCard
                  order={order}
                  onBump={handleBump}
                  onRecall={handleRecall}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bump All Button */}
      {readyOrders.length > 0 && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.bumpAllButton}
            onPress={() => setOrders([])}
          >
            <Ionicons name="checkmark-done" size={24} color="#fff" />
            <Text style={styles.bumpAllText}>Bump All Ready Orders</Text>
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
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#2a3142',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickStatText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
    backgroundColor: '#2a3142',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bumpAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  bumpAllText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ExpoScreen;
