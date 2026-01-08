import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KDSOrderCard from '../../components/kds/KDSOrderCard';
import { KDSOrder } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for orders currently being cooked
const generateMockOrders = (): KDSOrder[] => {
  const now = new Date();
  return [
    {
      id: '1',
      orderNumber: '038',
      tableName: 'Table 3',
      orderType: 'dine-in',
      items: [
        { id: '1a', name: 'Ribeye Steak', quantity: 1, status: 'in-progress', station: 'grill', modifiers: ['Medium-Rare', 'Extra Sauce'] },
        { id: '1b', name: 'Baked Potato', quantity: 1, status: 'done', station: 'prep' },
        { id: '1c', name: 'Grilled Asparagus', quantity: 1, status: 'pending', station: 'grill' },
      ],
      status: 'cooking',
      priority: 'vip',
      createdAt: new Date(now.getTime() - 480000), // 8 minutes ago
      startedAt: new Date(now.getTime() - 420000), // Started 7 minutes ago
      source: 'POS',
      server: 'Sarah',
    },
    {
      id: '2',
      orderNumber: '039',
      tableName: 'Table 7',
      orderType: 'dine-in',
      items: [
        { id: '2a', name: 'Grilled Salmon', quantity: 2, status: 'in-progress', station: 'grill' },
        { id: '2b', name: 'Rice Pilaf', quantity: 2, status: 'done', station: 'prep' },
        { id: '2c', name: 'Steamed Vegetables', quantity: 2, status: 'done', station: 'prep' },
      ],
      status: 'cooking',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 360000), // 6 minutes ago
      startedAt: new Date(now.getTime() - 300000), // Started 5 minutes ago
      source: 'POS',
      server: 'Mike',
    },
    {
      id: '3',
      orderNumber: '040',
      orderType: 'takeout',
      items: [
        { id: '3a', name: 'Chicken Wings', quantity: 12, status: 'in-progress', station: 'fry', modifiers: ['Buffalo Hot'] },
        { id: '3b', name: 'Celery Sticks', quantity: 1, status: 'done', station: 'prep' },
        { id: '3c', name: 'Ranch Dressing', quantity: 2, status: 'done', station: 'prep' },
      ],
      status: 'cooking',
      priority: 'rush',
      createdAt: new Date(now.getTime() - 300000), // 5 minutes ago
      startedAt: new Date(now.getTime() - 240000), // Started 4 minutes ago
      source: 'Online',
    },
    {
      id: '4',
      orderNumber: '041',
      tableName: 'Table 1',
      orderType: 'dine-in',
      items: [
        { id: '4a', name: 'Pasta Carbonara', quantity: 1, status: 'pending', station: 'prep' },
        { id: '4b', name: 'Garlic Bread', quantity: 1, status: 'done', station: 'prep' },
      ],
      status: 'cooking',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 180000), // 3 minutes ago
      startedAt: new Date(now.getTime() - 120000), // Started 2 minutes ago
      source: 'POS',
      server: 'Lisa',
    },
  ];
};

const CookingScreen: React.FC = () => {
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
    // Move order to ready status
    setOrders(prev =>
      prev.filter(order => order.id !== orderId)
    );
    // In real app, this would update the order status in the backend
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

  const cookingOrders = orders.filter(order => order.status === 'cooking');
  
  // Calculate stats
  const totalItems = cookingOrders.reduce((acc, order) => acc + order.items.length, 0);
  const completedItems = cookingOrders.reduce(
    (acc, order) => acc + order.items.filter(item => item.status === 'done').length,
    0
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flame" size={28} color="#FF9500" />
          <Text style={styles.headerTitle}>Cooking</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <View style={[styles.countBadge, { backgroundColor: '#FF9500' }]}>
              <Text style={styles.countText}>{cookingOrders.length}</Text>
            </View>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.countBadge, { backgroundColor: '#34C759' }]}>
              <Text style={styles.countText}>{completedItems}/{totalItems}</Text>
            </View>
            <Text style={styles.statLabel}>Items</Text>
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
        {cookingOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#FF9500" />
            <Text style={styles.emptyTitle}>Kitchen Clear</Text>
            <Text style={styles.emptySubtitle}>
              No orders currently cooking
            </Text>
          </View>
        ) : (
          <View style={styles.ordersGrid}>
            {cookingOrders.map(order => (
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
});

export default CookingScreen;
