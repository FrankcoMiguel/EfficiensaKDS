import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../../utils/formatCurrency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethod: 'Card' | 'MobileWallet' | 'PayAtCashier';
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: Date;
}

const RecentOrdersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // Empty orders - in production this would come from API/database
  const [orders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today, ${formatTime(date)}`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPaymentIcon = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'Card': return 'card-outline';
      case 'MobileWallet': return 'phone-portrait-outline';
      case 'PayAtCashier': return 'cash-outline';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return '#34C759';
      case 'pending': return '#FF9500';
      case 'cancelled': return '#FF3B5C';
    }
  };

  const getStatusBg = (status: Order['status']) => {
    switch (status) {
      case 'completed': return '#EDFFF2';
      case 'pending': return '#FFF8ED';
      case 'cancelled': return '#FFF0F3';
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const isExpanded = expandedOrderId === order.id;
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => toggleOrderExpand(order.id)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderLeft}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Text style={styles.orderTime}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBg(order.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.orderMeta}>
          <View style={styles.metaItem}>
            <Ionicons name={getPaymentIcon(order.paymentMethod)} size={16} color="#64748B" />
            <Text style={styles.metaText}>
              {order.paymentMethod === 'PayAtCashier' ? 'Cashier' : order.paymentMethod}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="bag-outline" size={16} color="#64748B" />
            <Text style={styles.metaText}>
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
            </Text>
          </View>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#64748B" 
          />
        </View>
        
        {isExpanded && (
          <View style={styles.orderDetails}>
            <View style={styles.itemsList}>
              {order.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemQty}>{item.quantity}x</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>{formatCurrency(order.tax)}</Text>
              </View>
              {order.tip > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tip</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(order.tip)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recent Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSummary}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedOrders}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#34C759' }]}>
            {formatCurrency(totalRevenue)}
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 44,
  },
  statsSummary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: 'bold',
    color: '#162570',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderLeft: {},
  orderNumber: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#162570',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 13,
    color: '#64748B',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
  },
  orderDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemsList: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    width: 32,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#162570',
  },
});

export default RecentOrdersScreen;