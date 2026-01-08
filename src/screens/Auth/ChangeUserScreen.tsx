import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Alert, 
  Animated, 
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Text, Button, Surface, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';

const { width } = Dimensions.get('window');

// Mock users for demonstration - these should come from API
const availableUsers: User[] = [
  { 
    id: '1', 
    name: 'Sarah Anderson', 
    email: 'sarah@restaurant.com',
    pin: '0000', 
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
    avatar: '👩‍💼',
    status: 'available'
  },
  { 
    id: '2', 
    name: 'Mike Johnson', 
    email: 'mike@restaurant.com',
    pin: '5678', 
    role: 'manager',
    isActive: true,
    createdAt: new Date('2024-01-02'),
    lastLogin: new Date(),
    avatar: '👨‍💼',
    status: 'available'
  },
  { 
    id: '3', 
    name: 'Emma Davis', 
    email: 'emma@restaurant.com',
    pin: '9999', 
    role: 'cashier',
    isActive: true,
    createdAt: new Date('2024-01-03'),
    lastLogin: new Date(),
    avatar: '👩‍💻',
    status: 'on-break'
  },
  { 
    id: '4', 
    name: 'James Wilson', 
    email: 'james@restaurant.com',
    pin: '1111', 
    role: 'server',
    isActive: true,
    createdAt: new Date('2024-01-04'),
    lastLogin: new Date(),
    avatar: '👨‍🍳',
    status: 'available'
  },
  { 
    id: '5', 
    name: 'Lisa Chen', 
    email: 'lisa@restaurant.com',
    pin: '2222', 
    role: 'server',
    isActive: true,
    createdAt: new Date('2024-01-05'),
    lastLogin: new Date(),
    avatar: '👩‍🎨',
    status: 'busy'
  },
  { 
    id: '4', 
    name: 'Juan Miguel', 
    email: 'juan.miguel@restaurant.com',
    pin: '1234', 
    role: 'cashier',
    isActive: true,
    createdAt: new Date('2024-10-05'),
    lastLogin: new Date(),
    avatar: '👨‍💼',
    status: 'available'
  },
];

const ChangeUserScreen: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleUserSelect = (user: User) => {
    if (selectedUser?.id === user.id) {
      // If already selected, proceed directly
      handleContinueWithUser(user);
      return;
    }

    setSelectedUser(user);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinueWithUser = (user?: User) => {
    const userToContinue = user || selectedUser;
    
    if (!userToContinue) {
      Alert.alert('Please Select', 'Choose an employee to continue');
      return;
    }

    // Navigate to PinLoginScreen with selected user
    (navigation as any).navigate('PinLogin', { 
      selectedUser: {
        id: userToContinue.id,
        name: userToContinue.name,
        role: userToContinue.role
      }
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: '#FF6B6B',
      manager: '#4ECDC4',
      cashier: '#45B7D1',
      server: '#96CEB4',
      chef: '#FECA57',
    };
    return colors[role as keyof typeof colors] || '#95A5A6';
  };

  const getRoleGradient = (role: string) => {
    const gradients = {
      admin: ['#FF6B6B', '#FF8E53'],
      manager: ['#4ECDC4', '#44A08D'],
      cashier: ['#45B7D1', '#6C5CE7'],
      server: ['#96CEB4', '#FECA57'],
      chef: ['#FECA57', '#FF9FF3'],
    };
    return gradients[role as keyof typeof gradients] || ['#95A5A6', '#7F8C8D'];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: '#2ECC71',
      busy: '#F39C12',
      'on-break': '#9B59B6',
      offline: '#95A5A6',
    };
    return colors[status as keyof typeof colors] || '#95A5A6';
  };

  const getStatusText = (status: string) => {
    const texts = {
      available: 'Available',
      busy: 'Busy',
      'on-break': 'On Break',
      offline: 'Offline',
    };
    return texts[status as keyof typeof texts] || 'Unknown';
  };

  const renderUserCard = ({ item, index }: { item: User; index: number }) => {
    const isSelected = selectedUser?.id === item.id;
    const isCurrent = currentUser?.id === item.id;
    const roleColors = getRoleGradient(item.role);

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
              { scale: isSelected ? scaleAnim : 1 },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleUserSelect(item)}
          activeOpacity={0.8}
          style={styles.userCardTouchable}
        >
          <Surface
            style={[
              styles.userCard,
              isSelected && styles.userCardSelected,
              isCurrent && styles.currentUserCard,
            ]}
            elevation={isSelected ? 5 : 2}
          >
            {/* Selection indicator */}
            {isSelected && (
              <View style={styles.selectionIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
              </View>
            )}

            {/* Current user badge */}
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>CURRENT</Text>
              </View>
            )}

            {/* Avatar with gradient background */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={roleColors as [string, string, ...string[]]}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarEmoji}>{item.avatar || '👤'}</Text>
              </LinearGradient>
              
              {/* Status indicator */}
              <View style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(item.status || 'available') }
              ]} />
            </View>

            {/* User info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              
              <View style={styles.roleContainer}>
                <View style={[
                  styles.roleBadge,
                  { backgroundColor: getRoleColor(item.role) + '20' }
                ]}>
                  <Text style={[
                    styles.roleText,
                    { color: getRoleColor(item.role) }
                  ]}>
                    {item.role.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(item.status || 'available') }
                ]} />
                <Text style={styles.statusText}>
                  {getStatusText(item.status || 'available')}
                </Text>
              </View>

              {/* Quick stats */}
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text style={styles.statText}>
                    {item.lastLogin ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="person-outline" size={12} color="#666" />
                  <Text style={styles.statText}>ID: {item.id}</Text>
                </View>
              </View>
            </View>

            {/* Action indicator */}
            <View style={styles.actionIndicator}>
              <Ionicons 
                name={isSelected ? "chevron-forward" : "chevron-forward-outline"} 
                size={20} 
                color={isSelected ? "#4ECDC4" : "#BDC3C7"} 
              />
            </View>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('Login')}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Select Employee</Text>
            
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerSubtitle}>
            Choose who is logging in to continue
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{availableUsers.length}</Text>
              <Text style={styles.statLabel}>Total Staff</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {availableUsers.filter(u => u.status === 'available').length}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {availableUsers.filter(u => u.status === 'on-break').length}
              </Text>
              <Text style={styles.statLabel}>On Break</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {renderHeader()}

      <View style={styles.content}>
        <FlatList
          data={availableUsers}
          renderItem={renderUserCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />

        {/* Continue section - visible when user is selected */}
        {selectedUser && (
          <View style={styles.continueSection}>
            <Text style={styles.continueLabel}>Selected:</Text>
            <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
            <TouchableOpacity
              onPress={() => handleContinueWithUser()}
              style={styles.continueButton}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                Continue to PIN Entry
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Floating action button */}
        {selectedUser && (
          <Animated.View
            style={[
              styles.fabContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleContinueWithUser()}
              style={styles.fab}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.fabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.fabContent}>
                  <Text style={styles.fabText}>Continue as</Text>
                  <Text style={styles.fabUserName}>{selectedUser.name}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 100,
    marginTop: 20,
  },
  continueSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  selectedUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    paddingHorizontal: 20,
  },
  userCardTouchable: {
    borderRadius: 16,
  },
  userCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    minHeight: 80,
  },
  userCardSelected: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
    backgroundColor: '#F0FFFE',
  },
  currentUserCard: {
    backgroundColor: '#E8F8F5',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  currentBadge: {
    position: 'absolute',
    top: -5,
    left: 12,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  roleContainer: {
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  quickStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 10,
    color: '#95A5A6',
    marginLeft: 3,
  },
  actionIndicator: {
    marginLeft: 12,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  fab: {
    borderRadius: 25,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 1001,
  },
  fabGradient: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fabUserName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
});

export default ChangeUserScreen;