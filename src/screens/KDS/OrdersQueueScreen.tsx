import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KDSOrderCard from '../../components/kds/KDSOrderCard';
import { KDSOrder } from '../../types';

const HORIZONTAL_PADDING = 20;
const CARD_GAP = 16;

// Helper function to calculate responsive layout
const getResponsiveLayout = (screenWidth: number) => {
  // Breakpoints: phone < 600, tablet portrait < 900, tablet landscape < 1200, large screens >= 1200
  let columns = 1;
  if (screenWidth >= 1200) {
    columns = 4;
  } else if (screenWidth >= 900) {
    columns = 3;
  } else if (screenWidth >= 600) {
    columns = 2;
  }
  
  const totalGaps = (columns - 1) * CARD_GAP;
  const availableWidth = screenWidth - (HORIZONTAL_PADDING * 2) - totalGaps;
  const cardWidth = availableWidth / columns;
  
  return { columns, cardWidth };
};

// Mock data for demonstration
const generateMockOrders = (): KDSOrder[] => {
  const now = new Date();
  return [
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
      orderNumber: '1245',
      orderType: 'delivery',
      items: [
        { id: '6a', name: 'Family Combo', quantity: 1, status: 'pending' },
        { id: '6b', name: 'Extra Sauce', quantity: 3, status: 'pending' },
      ],
      status: 'queue',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 60000),
    },
  ];
};

const OrdersQueueScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Get responsive layout based on current screen width
  const { cardWidth } = getResponsiveLayout(screenWidth);

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
      }).filter(order => order.status !== 'completed')
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

  // Get active orders (not completed)
  const activeOrders = orders.filter(order => order.status !== 'completed');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Queue</Text>
        <Text style={styles.headerCount}>{activeOrders.length} Active Orders</Text>
      </View>

      {/* Orders Grid */}
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
        {activeOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptySubtitle}>
              No orders in the queue
            </Text>
          </View>
        ) : (
          <View style={styles.ordersGrid}>
            {activeOrders.map(order => (
              <View key={order.id} style={[styles.orderCardWrapper, { width: cardWidth }]}>
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerCount: {
    fontSize: 16,
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: HORIZONTAL_PADDING,
    paddingTop: 8,
  },
  ordersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  orderCardWrapper: {
    // Width is set dynamically
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

export default OrdersQueueScreen;
