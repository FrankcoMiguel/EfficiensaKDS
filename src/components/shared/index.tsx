import React from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { Text, Card, Button, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// Loading Screen Component
export const LoadingScreen: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <SafeAreaView style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2196f3" />
    <Text variant="bodyLarge" style={styles.loadingText}>
      {message}
    </Text>
  </SafeAreaView>
);

// Empty State Component
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <View style={styles.emptyState}>
    <Icon name={icon} size={64} color="#ccc" />
    <Text variant="headlineSmall" style={styles.emptyTitle}>
      {title}
    </Text>
    <Text variant="bodyMedium" style={styles.emptyDescription}>
      {description}
    </Text>
    {actionLabel && onAction && (
      <Button mode="contained" onPress={onAction} style={styles.emptyAction}>
        {actionLabel}
      </Button>
    )}
  </View>
);

// Error State Component
interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description,
  onRetry,
}) => (
  <View style={styles.errorState}>
    <Icon name="alert-circle" size={64} color="#f44336" />
    <Text variant="headlineSmall" style={styles.errorTitle}>
      {title}
    </Text>
    <Text variant="bodyMedium" style={styles.errorDescription}>
      {description}
    </Text>
    {onRetry && (
      <Button mode="contained" onPress={onRetry} style={styles.errorAction}>
        Try Again
      </Button>
    )}
  </View>
);

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  onPress,
}) => (
  <Card style={[styles.statCard, isTablet && styles.statCardTablet]} onPress={onPress}>
    <Card.Content style={styles.statCardContent}>
      <Icon name={icon} size={32} color={color} />
      <View style={styles.statTextContainer}>
        <Text variant="headlineMedium" style={[styles.statValue, { color }]}>
          {value}
        </Text>
        <Text variant="bodyMedium" style={styles.statTitle}>
          {title}
        </Text>
      </View>
    </Card.Content>
  </Card>
);

// Quick Action Button Component
interface QuickActionProps {
  title: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}

export const QuickActionButton: React.FC<QuickActionProps> = ({
  title,
  icon,
  onPress,
  disabled = false,
}) => (
  <Surface style={styles.quickAction}>
    <Button
      mode="text"
      onPress={onPress}
      disabled={disabled}
      style={styles.quickActionButton}
      contentStyle={styles.quickActionContent}
    >
      <Icon name={icon} size={24} color={disabled ? "#ccc" : "#2196f3"} />
      <Text variant="bodyMedium" style={[
        styles.quickActionText,
        { color: disabled ? "#ccc" : "#333" }
      ]}>
        {title}
      </Text>
    </Button>
  </Surface>
);

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  color?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, color }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'available':
        return '#4caf50';
      case 'pending':
      case 'preparing':
      case 'occupied':
        return '#ff9800';
      case 'cancelled':
      case 'inactive':
      case 'unavailable':
        return '#f44336';
      case 'ready':
        return '#2196f3';
      default:
        return color || '#666';
    }
  };

  return (
    <View style={[
      styles.statusBadge,
      { backgroundColor: getStatusColor(status) + '20' }
    ]}>
      <Text style={[
        styles.statusBadgeText,
        { color: getStatusColor(status) }
      ]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

// Section Header Component
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
}) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text variant="titleLarge" style={styles.sectionTitle}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodyMedium" style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      )}
    </View>
    {actionLabel && onAction && (
      <Button mode="text" onPress={onAction}>
        {actionLabel}
      </Button>
    )}
  </View>
);

// Confirmation Dialog Hook (for use with Portal)
export const useConfirmDialog = () => {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showDialog = (dialogConfig: typeof config) => {
    setConfig(dialogConfig);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setConfig(null);
  };

  const handleConfirm = () => {
    config?.onConfirm();
    hideDialog();
  };

  const handleCancel = () => {
    config?.onCancel?.();
    hideDialog();
  };

  return {
    visible,
    config,
    showDialog,
    hideDialog,
    handleConfirm,
    handleCancel,
  };
};

const styles = StyleSheet.create({
  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  emptyDescription: {
    marginTop: 8,
    textAlign: 'center',
    color: '#999',
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 24,
  },

  // Error State
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    marginTop: 16,
    textAlign: 'center',
    color: '#f44336',
  },
  errorDescription: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  errorAction: {
    marginTop: 24,
  },

  // Stat Card
  statCard: {
    margin: 8,
    borderRadius: 12,
    elevation: 2,
    flex: 1,
    minWidth: isTablet ? 200 : 150,
  },
  statCardTablet: {
    maxWidth: '23%',
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statTitle: {
    color: '#666',
    marginTop: 4,
  },

  // Quick Action
  quickAction: {
    margin: 8,
    borderRadius: 12,
    elevation: 2,
    flex: 1,
    minWidth: isTablet ? 150 : 120,
  },
  quickActionButton: {
    justifyContent: 'center',
  },
  quickActionContent: {
    flexDirection: 'column',
    paddingVertical: 16,
  },
  quickActionText: {
    marginTop: 8,
    textAlign: 'center',
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: '#666',
    marginTop: 4,
  },
});

export default {
  LoadingScreen,
  EmptyState,
  ErrorState,
  StatCard,
  QuickActionButton,
  StatusBadge,
  SectionHeader,
  useConfirmDialog,
};