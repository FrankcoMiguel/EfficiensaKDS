import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface KioskFooterProps {
  showBadges?: boolean;
}

const KioskFooter: React.FC<KioskFooterProps> = ({ showBadges = true }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  const handleFooterTap = () => {
    // Reset timer on each tap
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= 5) {
      // Navigate to Admin Dashboard
      setTapCount(0);
      (navigation as any).navigate('AdminDashboard');
    } else {
      // Reset tap count after 2 seconds of inactivity
      tapTimer.current = setTimeout(() => {
        setTapCount(0);
      }, 2000);
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={handleFooterTap}
      style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}
    >
      {/* {showBadges && (
        <View style={styles.footerContent}>
          <View style={styles.footerBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#34C759" />
            <Text style={styles.footerBadgeText}>Secure Payment</Text>
          </View>
          <View style={styles.footerBadge}>
            <Ionicons name="timer" size={16} color="#2B9EDE" />
            <Text style={styles.footerBadgeText}>Fast Service</Text>
          </View>
          <View style={styles.footerBadge}>
            <Ionicons name="receipt" size={16} color="#FF9500" />
            <Text style={styles.footerBadgeText}>Digital Receipt</Text>
          </View>
        </View>
      )} */}
      <Text style={styles.footerPowered}>Powered by Efficiensa</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#fff',
    paddingTop: 14,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 26,
    marginBottom: 10,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerBadgeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  footerPowered: {
    textAlign: 'center',
    fontSize: 12,
    color: '#a0aec0',
    marginBottom: 4,
  },
});

export default KioskFooter;
