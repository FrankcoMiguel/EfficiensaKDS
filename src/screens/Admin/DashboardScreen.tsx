import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../../utils/formatCurrency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// Empty data structure - in production this would come from API/database
const getEmptyData = () => {
  return {
    today: {
      revenue: 0,
      orders: 0,
      averageOrder: 0,
      customers: 0,
    },
    hourlyData: [] as { hour: number; orders: number; revenue: number }[],
    paymentBreakdown: {
      card: 0,
      cashier: 0,
      mobile: 0,
    },
    topItems: [] as { name: string; quantity: number; revenue: number }[],
    categoryPerformance: [] as { name: string; percentage: number; color: string }[],
    recentOrders: [] as { id: string; items: number; total: number; time: string; status: string }[],
    comparison: {
      revenueChange: 0,
      ordersChange: 0,
      avgOrderChange: 0,
    },
    kioskUsage: {
      totalSessions: 0,
      avgSessionTime: '0:00',
      completionRate: 0,
      abandonmentRate: 0,
    },
  };
};

const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [data, setData] = useState(getEmptyData());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const StatCard = ({ title, value, icon, color, change }: {
    title: string;
    value: string;
    icon: string;
    color: string;
    change?: number;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrapper, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={isTablet ? 28 : 24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {change !== undefined && (
        <View style={[styles.changeBadge, { backgroundColor: change >= 0 ? '#EDFFF2' : '#FFF0F3' }]}>
          <Ionicons 
            name={change >= 0 ? 'trending-up' : 'trending-down'} 
            size={12} 
            color={change >= 0 ? '#34C759' : '#FF3B5C'} 
          />
          <Text style={[styles.changeText, { color: change >= 0 ? '#34C759' : '#FF3B5C' }]}>
            {Math.abs(change).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );

  const HourlyChart = () => {
    const maxRevenue = Math.max(...data.hourlyData.map(h => h.revenue), 1);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Hourly Sales</Text>
        <View style={styles.chart}>
          {data.hourlyData.slice(-12).map((hourData, index) => (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(hourData.revenue / maxRevenue) * 100}%`,
                    backgroundColor: hourData.revenue > 0 ? '#2B9EDE' : '#E0E0E0',
                  }
                ]} 
              />
              <Text style={styles.barLabel}>
                {hourData.hour > 12 ? hourData.hour - 12 : hourData.hour || 12}
                {hourData.hour >= 12 ? 'p' : 'a'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const PaymentBreakdown = () => (
    <View style={styles.paymentBreakdown}>
      <Text style={styles.sectionTitle}>Payment Methods</Text>
      <View style={styles.paymentBar}>
        <View style={[styles.paymentSegment, { flex: data.paymentBreakdown.card, backgroundColor: '#162570' }]} />
        <View style={[styles.paymentSegment, { flex: data.paymentBreakdown.cashier, backgroundColor: '#2B9EDE' }]} />
        <View style={[styles.paymentSegment, { flex: data.paymentBreakdown.mobile, backgroundColor: '#4F7DF3' }]} />
      </View>
      <View style={styles.paymentLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#162570' }]} />
          <Text style={styles.legendText}>Card ({data.paymentBreakdown.card}%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2B9EDE' }]} />
          <Text style={styles.legendText}>Cashier ({data.paymentBreakdown.cashier}%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4F7DF3' }]} />
          <Text style={styles.legendText}>Mobile ({data.paymentBreakdown.mobile}%)</Text>
        </View>
      </View>
    </View>
  );

  const TopItems = () => (
    <View style={styles.topItemsContainer}>
      <Text style={styles.sectionTitle}>Top Selling Items</Text>
      {data.topItems.map((item, index) => (
        <View key={index} style={styles.topItem}>
          <View style={styles.topItemRank}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.topItemInfo}>
            <Text style={styles.topItemName}>{item.name}</Text>
            <Text style={styles.topItemQty}>{item.quantity} sold</Text>
          </View>
          <Text style={styles.topItemRevenue}>{formatCurrency(item.revenue)}</Text>
        </View>
      ))}
    </View>
  );

  const CategoryPerformance = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.sectionTitle}>Category Performance</Text>
      {data.categoryPerformance.map((category, index) => (
        <View key={index} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryPercent}>{category.percentage}%</Text>
          </View>
          <View style={styles.categoryBarBg}>
            <View 
              style={[
                styles.categoryBarFill, 
                { width: `${category.percentage}%`, backgroundColor: category.color }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );

  const KioskUsage = () => (
    <View style={styles.kioskUsageContainer}>
      <Text style={styles.sectionTitle}>Kiosk Usage</Text>
      <View style={styles.usageGrid}>
        <View style={styles.usageItem}>
          <Ionicons name="people" size={24} color="#2B9EDE" />
          <Text style={styles.usageValue}>{data.kioskUsage.totalSessions}</Text>
          <Text style={styles.usageLabel}>Sessions</Text>
        </View>
        <View style={styles.usageItem}>
          <Ionicons name="time" size={24} color="#FF9500" />
          <Text style={styles.usageValue}>{data.kioskUsage.avgSessionTime}</Text>
          <Text style={styles.usageLabel}>Avg Time</Text>
        </View>
        <View style={styles.usageItem}>
          <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          <Text style={styles.usageValue}>{data.kioskUsage.completionRate}%</Text>
          <Text style={styles.usageLabel}>Completed</Text>
        </View>
        <View style={styles.usageItem}>
          <Ionicons name="exit" size={24} color="#FF3B30" />
          <Text style={styles.usageValue}>{data.kioskUsage.abandonmentRate}%</Text>
          <Text style={styles.usageLabel}>Abandoned</Text>
        </View>
      </View>
    </View>
  );

  const RecentOrders = () => (
    <View style={styles.recentOrdersContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Reports')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {data.recentOrders.map((order, index) => (
        <View key={index} style={styles.orderItem}>
          <View style={styles.orderLeft}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.orderMeta}>{order.items} items • {order.time}</Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
            <View style={[styles.orderStatus, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.orderStatusText, { color: '#4CAF50' }]}>
                {order.status}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const QuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => (navigation as any).navigate('Settings')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="settings" size={24} color="#FF9800" />
          </View>
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => {}}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="headset" size={24} color="#2196F3" />
          </View>
          <Text style={styles.quickActionText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => {}}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="information-circle" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.quickActionText}>Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.statusBarBg, { paddingTop: insets.top }]} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.dateText}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => setData(getEmptyData())}>
            <Ionicons name="refresh" size={22} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['today', 'week', 'month'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data.today.revenue)}
            icon="cash"
            color="#4CAF50"
            change={data.comparison.revenueChange}
          />
          <StatCard
            title="Orders"
            value={data.today.orders.toString()}
            icon="receipt"
            color="#2196F3"
            change={data.comparison.ordersChange}
          />
          <StatCard
            title="Avg Order"
            value={formatCurrency(data.today.averageOrder)}
            icon="analytics"
            color="#FF9800"
            change={data.comparison.avgOrderChange}
          />
          <StatCard
            title="Customers"
            value={data.today.customers.toString()}
            icon="people"
            color="#9C27B0"
          />
        </View>

        {/* Charts Row */}
        <View style={styles.chartsRow}>
          <View style={styles.chartCard}>
            <HourlyChart />
          </View>
          <View style={styles.chartCard}>
            <PaymentBreakdown />
          </View>
        </View>

        {/* Kiosk Usage */}
        <View style={styles.card}>
          <KioskUsage />
        </View>

        {/* Two Column Layout */}
        <View style={styles.twoColumnRow}>
          <View style={[styles.card, styles.halfCard]}>
            <TopItems />
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <CategoryPerformance />
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.card}>
          <RecentOrders />
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <QuickActions />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FC',
  },
  statusBarBg: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#162570',
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F4F6FC',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 10,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4F6FC',
  },
  periodButtonActive: {
    backgroundColor: '#162570',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: isTablet ? 180 : 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 6,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconWrapper: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  statTitle: {
    fontSize: isTablet ? 14 : 13,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  chartsRow: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 16,
    marginBottom: 16,
  },
  chartCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartContainer: {},
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 6,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2B9EDE',
    fontWeight: '600',
  },
  paymentBreakdown: {},
  paymentBar: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  paymentSegment: {
    height: '100%',
  },
  paymentLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  twoColumnRow: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 16,
  },
  halfCard: {
    flex: 1,
  },
  topItemsContainer: {},
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topItemRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4F6FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  topItemQty: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  topItemRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  categoryContainer: {},
  categoryItem: {
    marginBottom: 14,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  categoryPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  kioskUsageContainer: {},
  usageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageItem: {
    alignItems: 'center',
  },
  usageValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8,
  },
  usageLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  recentOrdersContainer: {},
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderLeft: {},
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  orderMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  quickActionsContainer: {},
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
});

export default DashboardScreen;