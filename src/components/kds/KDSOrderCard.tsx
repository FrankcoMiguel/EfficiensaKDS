import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KDSOrder, KDSOrderItem } from '../../types';

interface KDSOrderCardProps {
  order: KDSOrder;
  onBump?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onItemToggle?: (orderId: string, itemId: string) => void;
  onPress?: (order: KDSOrder) => void;
  showActions?: boolean;
  compact?: boolean;
}

// Responsive font scale helper
const getResponsiveStyles = (screenWidth: number) => {
  // Base scale: 375 (iPhone SE) = 1, larger screens scale up slightly
  const scale = Math.min(screenWidth / 375, 1.3);
  const isSmallScreen = screenWidth < 400;
  const isLargeScreen = screenWidth >= 900;
  
  return {
    scale,
    isSmallScreen,
    isLargeScreen,
    orderNumberSize: isSmallScreen ? 16 : isLargeScreen ? 22 : 20,
    orderTypeSize: isSmallScreen ? 12 : 14,
    itemNameSize: isSmallScreen ? 13 : 15,
    itemStatusSize: isSmallScreen ? 12 : 14,
    timeBadgeSize: isSmallScreen ? 12 : 14,
    statusBadgeSize: isSmallScreen ? 10 : 12,
    actionButtonSize: isSmallScreen ? 12 : 14,
    noteSize: isSmallScreen ? 11 : 12,
    cardPadding: isSmallScreen ? 12 : 16,
    itemPadding: isSmallScreen ? 8 : 10,
  };
};

const KDSOrderCard: React.FC<KDSOrderCardProps> = ({
  order,
  onBump,
  onRecall,
  onItemToggle,
  onPress,
  showActions = true,
  compact = false,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const [elapsedTime, setElapsedTime] = useState(0);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Get responsive styles based on screen width
  const responsiveStyles = useMemo(() => getResponsiveStyles(screenWidth), [screenWidth]);

  // Calculate elapsed time
  useEffect(() => {
    const startTime = order.startedAt || order.createdAt;
    const calculateElapsed = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - new Date(startTime).getTime()) / 1000);
      setElapsedTime(elapsed);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt, order.startedAt]);

  // Pulse animation for delayed orders
  useEffect(() => {
    if (order.status === 'delayed' || elapsedTime > 600) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [order.status, elapsedTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeBadgeColor = (): string => {
    if (order.status === 'delayed') return '#FF3B30';
    if (order.status === 'ready') return '#34C759';
    if (elapsedTime > 600) return '#FF3B30';
    if (elapsedTime > 300) return '#FF9500';
    return '#34C759';
  };

  const getBorderColor = (): string => {
    if (order.priority === 'rush') return '#FF3B30';
    switch (order.status) {
      case 'queue': return '#007AFF';
      case 'cooking': return '#FF9500';
      case 'ready': return '#34C759';
      case 'delayed': return '#FF3B30';
      case 'completed': return '#8E8E93';
      default: return '#666';
    }
  };

  const getItemStatusColor = (status: string): string => {
    switch (status) {
      case 'done': return '#34C759';
      case 'in-progress': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getItemStatusText = (status: string): string => {
    switch (status) {
      case 'done': return 'Ready';
      case 'in-progress': return 'In progress';
      default: return 'Pending';
    }
  };

  const getOrderTypeLabel = (): string => {
    switch (order.orderType) {
      case 'dine-in': return `Table #${order.tableName?.replace('Table ', '') || '?'} - Dine In`;
      case 'takeout': return 'Pickup - Mobile Order';
      case 'delivery': return 'Delivery';
      default: return order.orderType;
    }
  };

  const getActionButton = () => {
    if (order.status === 'queue') {
      return { label: 'Start Order', color: '#007AFF' };
    }
    if (order.status === 'ready') {
      return { label: 'Mark Complete', color: '#34C759' };
    }
    if (order.status === 'cooking') {
      const allDone = order.items.every(item => item.status === 'done');
      if (allDone) {
        return { label: 'Mark Complete', color: '#34C759' };
      }
      return null;
    }
    return null;
  };

  const getStatusBadge = () => {
    if (order.priority === 'rush') {
      return { label: 'RUSH', color: '#FF3B30' };
    }
    if (order.status === 'queue') {
      return { label: 'New', color: '#007AFF' };
    }
    return null;
  };

  const actionButton = getActionButton();
  const statusBadge = getStatusBadge();

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card, 
          { 
            borderLeftColor: getBorderColor(),
            padding: responsiveStyles.cardPadding,
          }
        ]}
        onPress={() => onPress?.(order)}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.orderNumber, { fontSize: responsiveStyles.orderNumberSize }]}>
            Order #{order.orderNumber}
          </Text>
          <View style={styles.headerRight}>
            {statusBadge && (
              <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
                <Text style={[styles.statusBadgeText, { fontSize: responsiveStyles.statusBadgeSize }]}>
                  {statusBadge.label}
                </Text>
              </View>
            )}
            <View style={[styles.timeBadge, { backgroundColor: getTimeBadgeColor() }]}>
              <Text style={[styles.timeText, { fontSize: responsiveStyles.timeBadgeSize }]}>
                {formatTime(elapsedTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Type */}
        <Text style={[styles.orderType, { fontSize: responsiveStyles.orderTypeSize }]}>
          {getOrderTypeLabel()}
        </Text>

        {/* Items */}
        {!compact && (
          <View style={styles.itemsContainer}>
            {order.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, { paddingVertical: responsiveStyles.itemPadding }]}
                onPress={() => onItemToggle?.(order.id, item.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.itemName, { fontSize: responsiveStyles.itemNameSize }]}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={[
                  styles.itemStatus, 
                  { color: getItemStatusColor(item.status), fontSize: responsiveStyles.itemStatusSize }
                ]}>
                  {getItemStatusText(item.status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {order.notes && (
              <View style={styles.noteContainer}>
                <Text style={[styles.noteText, { fontSize: responsiveStyles.noteSize }]}>
                  Note: {order.notes}
                </Text>
              </View>
            )}
          </View>
          
          {showActions && actionButton && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: actionButton.color }]}
              onPress={() => onBump?.(order.id)}
            >
              <Text style={[styles.actionButtonText, { fontSize: responsiveStyles.actionButtonSize }]}>
                {actionButton.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a3142',
    borderRadius: 12,
    borderLeftWidth: 4,
    // padding set dynamically
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  orderNumber: {
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  timeText: {
    fontWeight: '600',
    color: '#fff',
  },
  orderType: {
    color: '#9ca3af',
    marginBottom: 12,
  },
  itemsContainer: {
    gap: 6,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3d4559',
    paddingHorizontal: 10,
    borderRadius: 6,
    flexWrap: 'wrap',
    gap: 4,
  },
  itemName: {
    color: '#fff',
    flex: 1,
    minWidth: 80,
  },
  itemStatus: {
    fontWeight: '500',
    flexShrink: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  footerLeft: {
    flex: 1,
    minWidth: 100,
  },
  noteContainer: {
    backgroundColor: '#3d4559',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  noteText: {
    color: '#9ca3af',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexShrink: 0,
  },
  actionButtonText: {
    fontWeight: '600',
    color: '#fff',
  },
});

export default KDSOrderCard;
