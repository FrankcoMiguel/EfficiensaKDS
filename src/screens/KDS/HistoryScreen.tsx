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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KDSOrderCard from '../../components/kds/KDSOrderCard';
import { KDSOrder } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for completed orders
const generateMockOrders = (): KDSOrder[] => {
  const now = new Date();
  return [
    {
      id: '1',
      orderNumber: '020',
      tableName: 'Table 6',
      orderType: 'dine-in',
      items: [
        { id: '1a', name: 'Chicken Parmesan', quantity: 1, status: 'done', station: 'grill' },
        { id: '1b', name: 'Spaghetti', quantity: 1, status: 'done', station: 'prep' },
        { id: '1c', name: 'Garlic Bread', quantity: 1, status: 'done', station: 'prep' },
      ],
      status: 'completed',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 3600000), // 1 hour ago
      startedAt: new Date(now.getTime() - 3480000),
      readyAt: new Date(now.getTime() - 2700000),
      completedAt: new Date(now.getTime() - 2580000),
      source: 'POS',
      server: 'Tom',
    },
    {
      id: '2',
      orderNumber: '021',
      orderType: 'takeout',
      items: [
        { id: '2a', name: 'Beef Tacos', quantity: 3, status: 'done', station: 'grill' },
        { id: '2b', name: 'Rice & Beans', quantity: 1, status: 'done', station: 'prep' },
        { id: '2c', name: 'Guacamole', quantity: 1, status: 'done', station: 'prep' },
      ],
      status: 'completed',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 3300000),
      startedAt: new Date(now.getTime() - 3180000),
      readyAt: new Date(now.getTime() - 2400000),
      completedAt: new Date(now.getTime() - 2280000),
      source: 'Online',
    },
    {
      id: '3',
      orderNumber: '022',
      tableName: 'Table 10',
      orderType: 'dine-in',
      items: [
        { id: '3a', name: 'Grilled Shrimp', quantity: 1, status: 'done', station: 'grill' },
        { id: '3b', name: 'Caesar Salad', quantity: 1, status: 'done', station: 'prep' },
      ],
      status: 'completed',
      priority: 'vip',
      createdAt: new Date(now.getTime() - 3000000),
      startedAt: new Date(now.getTime() - 2880000),
      readyAt: new Date(now.getTime() - 2100000),
      completedAt: new Date(now.getTime() - 1980000),
      source: 'POS',
      server: 'Rachel',
    },
    {
      id: '4',
      orderNumber: '023',
      orderType: 'delivery',
      items: [
        { id: '4a', name: 'Pizza Margherita', quantity: 2, status: 'done', station: 'grill' },
        { id: '4b', name: 'Tiramisu', quantity: 2, status: 'done', station: 'dessert' },
      ],
      status: 'completed',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 2700000),
      startedAt: new Date(now.getTime() - 2580000),
      readyAt: new Date(now.getTime() - 1800000),
      completedAt: new Date(now.getTime() - 1680000),
      source: 'UberEats',
    },
    {
      id: '5',
      orderNumber: '024',
      tableName: 'Table 3',
      orderType: 'dine-in',
      items: [
        { id: '5a', name: 'Ribeye Steak', quantity: 1, status: 'done', station: 'grill' },
        { id: '5b', name: 'Baked Potato', quantity: 1, status: 'done', station: 'prep' },
        { id: '5c', name: 'Asparagus', quantity: 1, status: 'done', station: 'prep' },
      ],
      status: 'completed',
      priority: 'vip',
      createdAt: new Date(now.getTime() - 2400000),
      startedAt: new Date(now.getTime() - 2280000),
      readyAt: new Date(now.getTime() - 1500000),
      completedAt: new Date(now.getTime() - 1380000),
      source: 'POS',
      server: 'Emma',
    },
  ];
};

const HistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'dine-in' | 'takeout' | 'delivery'>('all');

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

  const handleRecall = (orderId: string) => {
    // Recall order back to cooking
    const orderToRecall = orders.find(o => o.id === orderId);
    if (orderToRecall) {
      // In real app, this would update the order status in the backend
      setOrders(prev => prev.filter(order => order.id !== orderId));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.server?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || order.orderType === filterType;
    return matchesSearch && matchesFilter;
  });

  const calculateAverageTime = () => {
    const completedOrders = orders.filter(o => o.completedAt && o.createdAt);
    if (completedOrders.length === 0) return '0:00';
    
    const totalTime = completedOrders.reduce((acc, order) => {
      const time = new Date(order.completedAt!).getTime() - new Date(order.createdAt).getTime();
      return acc + time;
    }, 0);
    
    const avgMs = totalTime / completedOrders.length;
    const mins = Math.floor(avgMs / 60000);
    const secs = Math.floor((avgMs % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time" size={28} color="#8E8E93" />
          <Text style={styles.headerTitle}>History</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{calculateAverageTime()}</Text>
            <Text style={styles.statLabel}>Avg Time</Text>
          </View>
        </View>
      </View>

      {/* Search & Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {(['all', 'dine-in', 'takeout', 'delivery'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                filterType === type && styles.filterChipActive,
              ]}
              onPress={() => setFilterType(type)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === type && styles.filterChipTextActive,
                ]}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search' : 'Completed orders will appear here'}
            </Text>
          </View>
        ) : (
          <View style={styles.ordersGrid}>
            {filteredOrders.map(order => (
              <View key={order.id} style={styles.orderCardWrapper}>
                <KDSOrderCard
                  order={order}
                  onRecall={handleRecall}
                  showActions={true}
                  compact={true}
                />
                <View style={styles.completedInfo}>
                  <Ionicons name="checkmark-circle" size={14} color="#34C759" />
                  <Text style={styles.completedText}>
                    Completed {formatTimeAgo(order.completedAt!)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Export Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color="#007AFF" />
          <Text style={styles.exportText}>Export Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.clearText}>Clear History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
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
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#3d4559',
  },
  searchContainer: {
    backgroundColor: '#2a3142',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3d4559',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  filtersScroll: {
    marginTop: 12,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3d4559',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
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
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingLeft: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#9ca3af',
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
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3d4559',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  exportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3d4559',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});

export default HistoryScreen;
