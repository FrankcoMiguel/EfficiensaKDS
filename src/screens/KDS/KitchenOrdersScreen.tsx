import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

type OrderStatus = 'on-time' | 'warning' | 'late';
type OrderPriority = 'normal' | 'priority' | 'urgent';

interface KitchenOrder {
  id: string;
  orderNumber: string;
  orderType: string; // "Table 5", "Delivery", "Takeout", "Urgent"
  items: string; // "2x Burger, 1x Fries"
  status: OrderStatus;
  priority: OrderPriority;
  station: string; // "Burger station", "Pizza station", "Cold station"
  elapsedSeconds: number;
  createdAt: Date;
}

type FilterType = 'all' | 'on-time' | 'warning' | 'late';

// Mock data generator
const generateMockOrders = (): KitchenOrder[] => {
  const now = new Date();
  return [
    {
      id: '1',
      orderNumber: '1234',
      orderType: 'Table 5',
      items: '2x Burger, 1x Fries',
      status: 'on-time',
      priority: 'normal',
      station: 'Burger station',
      elapsedSeconds: 370, // 6:10
      createdAt: new Date(now.getTime() - 370000),
    },
    {
      id: '2',
      orderNumber: '1235',
      orderType: 'Delivery',
      items: '1x Pizza, 2x Drinks',
      status: 'warning',
      priority: 'normal',
      station: 'Pizza station',
      elapsedSeconds: 91, // 1:31
      createdAt: new Date(now.getTime() - 91000),
    },
    {
      id: '3',
      orderNumber: '1236',
      orderType: 'Urgent',
      items: '3x Salad, 1x Soup',
      status: 'late',
      priority: 'priority',
      station: 'Cold station',
      elapsedSeconds: 197, // 3:17
      createdAt: new Date(now.getTime() - 197000),
    },
    {
      id: '4',
      orderNumber: '1237',
      orderType: 'Table 12',
      items: '1x Steak, 2x Side Salad',
      status: 'on-time',
      priority: 'normal',
      station: 'Grill station',
      elapsedSeconds: 145,
      createdAt: new Date(now.getTime() - 145000),
    },
    {
      id: '5',
      orderNumber: '1238',
      orderType: 'Takeout',
      items: '2x Chicken Wings, 1x Fries',
      status: 'warning',
      priority: 'normal',
      station: 'Fryer station',
      elapsedSeconds: 280,
      createdAt: new Date(now.getTime() - 280000),
    },
    {
      id: '6',
      orderNumber: '1239',
      orderType: 'Table 3',
      items: '1x Pasta, 1x Garlic Bread',
      status: 'on-time',
      priority: 'normal',
      station: 'Pasta station',
      elapsedSeconds: 60,
      createdAt: new Date(now.getTime() - 60000),
    },
  ];
};

const HORIZONTAL_PADDING = 20;
const CARD_GAP = 12;

const getResponsiveLayout = (screenWidth: number) => {
  if (screenWidth >= 1200) return { columns: 3, cardWidth: (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3 };
  if (screenWidth >= 768) return { columns: 2, cardWidth: (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2 };
  return { columns: 1, cardWidth: screenWidth - HORIZONTAL_PADDING * 2 };
};

interface OrderCardProps {
  order: KitchenOrder;
  onPress?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const [elapsed, setElapsed] = useState(order.elapsedSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCardColors = () => {
    switch (order.status) {
      case 'on-time':
        return {
          background: '#E8F5E9',
          border: '#4CAF50',
          timeColor: '#2E7D32',
        };
      case 'warning':
        return {
          background: '#FFF9C4',
          border: '#FBC02D',
          timeColor: '#F57F17',
        };
      case 'late':
        return {
          background: '#FFEBEE',
          border: '#EF5350',
          timeColor: '#C62828',
        };
      default:
        return {
          background: '#F5F5F5',
          border: '#9E9E9E',
          timeColor: '#616161',
        };
    }
  };

  const getStatusBadgeStyle = () => {
    if (order.priority === 'priority' || order.priority === 'urgent') {
      return {
        backgroundColor: '#FFCDD2',
        textColor: '#C62828',
        label: 'Priority',
      };
    }
    return {
      backgroundColor: '#C8E6C9',
      textColor: '#2E7D32',
      label: 'In Progress',
    };
  };

  const colors = getCardColors();
  const badge = getStatusBadgeStyle();

  return (
    <TouchableOpacity
      style={[
        styles.orderCard,
        {
          backgroundColor: colors.background,
          borderLeftColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header Row */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle}>
          Order #{order.orderNumber} - {order.orderType}
        </Text>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color={colors.timeColor} />
          <Text style={[styles.timeText, { color: colors.timeColor }]}>
            {formatTime(elapsed)}
          </Text>
          <Text style={styles.elapsedLabel}>elapsed</Text>
        </View>
      </View>

      {/* Items */}
      <Text style={styles.itemsText}>{order.items}</Text>

      {/* Footer Row */}
      <View style={styles.orderFooter}>
        <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
          <Text style={[styles.statusBadgeText, { color: badge.textColor }]}>
            {badge.label}
          </Text>
        </View>
        <Text style={styles.stationText}>{order.station}</Text>
      </View>
    </TouchableOpacity>
  );
};

const KitchenOrdersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const layout = useMemo(() => getResponsiveLayout(screenWidth), [screenWidth]);

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

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    return orders.filter(order => order.status === activeFilter);
  }, [orders, activeFilter]);

  const getFilterCount = (filter: FilterType): number => {
    if (filter === 'all') return orders.length;
    return orders.filter(o => o.status === filter).length;
  };

  const filterButtons: { key: FilterType; label: string; color: string; activeColor: string }[] = [
    { key: 'on-time', label: 'On Time', color: '#4CAF50', activeColor: '#2E7D32' },
    { key: 'warning', label: 'Warning', color: '#FBC02D', activeColor: '#F57F17' },
    { key: 'late', label: 'Late', color: '#EF5350', activeColor: '#C62828' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kitchen Orders</Text>
        <View style={styles.filterContainer}>
          {filterButtons.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                activeFilter === filter.key && { 
                  backgroundColor: filter.color,
                  borderColor: filter.color,
                },
              ]}
              onPress={() => setActiveFilter(activeFilter === filter.key ? 'all' : filter.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter.key && { color: '#fff', fontWeight: '700' },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          layout.columns > 1 && styles.scrollContentGrid,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#4a5568" />
            <Text style={styles.emptyTitle}>No Orders</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter !== 'all'
                ? `No ${activeFilter.replace('-', ' ')} orders`
                : 'All orders are completed'}
            </Text>
          </View>
        ) : (
          <View style={[
            styles.ordersContainer,
            layout.columns > 1 && styles.ordersGrid,
          ]}>
            {filteredOrders.map((order) => (
              <View 
                key={order.id} 
                style={layout.columns > 1 ? { width: layout.cardWidth } : undefined}
              >
                <OrderCard order={order} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Summary Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.summaryText}>{getFilterCount('on-time')} On Time</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#FBC02D' }]} />
            <Text style={styles.summaryText}>{getFilterCount('warning')} Warning</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#EF5350' }]} />
            <Text style={styles.summaryText}>{getFilterCount('late')} Late</Text>
          </View>
        </View>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3142',
    flexWrap: 'wrap',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a3142',
    borderWidth: 1,
    borderColor: '#3d4559',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: HORIZONTAL_PADDING,
  },
  scrollContentGrid: {
    paddingBottom: 20,
  },
  ordersContainer: {
    gap: CARD_GAP,
  },
  ordersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  orderCard: {
    borderRadius: 12,
    borderLeftWidth: 5,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  elapsedLabel: {
    fontSize: 14,
    color: '#555',
    marginLeft: 2,
  },
  itemsText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 12,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stationText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a3142',
    backgroundColor: '#1a1f2e',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
});

export default KitchenOrdersScreen;
