import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
  Modal,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Device {
  id: string;
  name: string;
  type: 'kds-monitor' | 'expo-display' | 'order-display' | 'bump-bar' | 'touch-screen' | 'external-monitor';
  category: string;
  status: 'connected' | 'disconnected' | 'error';
  ipAddress?: string;
  port?: string;
  resolution?: string;
  assignedScreen?: string;
}

const DEVICE_TYPES = [
  { key: 'kds-monitor', name: 'KDS Monitor', type: 'kds-monitor' as const, icon: 'tv-outline', category: 'Kitchen Display' },
  { key: 'expo-display', name: 'Expo Display', type: 'expo-display' as const, icon: 'easel-outline', category: 'Expeditor Station' },
  { key: 'order-display', name: 'Order Display', type: 'order-display' as const, icon: 'tablet-landscape-outline', category: 'Line Cook Station' },
  { key: 'bump-bar', name: 'Bump Bar', type: 'bump-bar' as const, icon: 'keypad-outline', category: 'Input Device' },
  { key: 'touch-screen', name: 'Touch Screen', type: 'touch-screen' as const, icon: 'finger-print-outline', category: 'Interactive Display' },
  { key: 'external-monitor', name: 'External Monitor', type: 'external-monitor' as const, icon: 'desktop-outline', category: 'Secondary Display' },
];

const SCREEN_ASSIGNMENTS = [
  { id: 'queue', name: 'Orders Queue' },
  { id: 'cooking', name: 'Cooking / In Progress' },
  { id: 'expo', name: 'Ready / Expo' },
  { id: 'delayed', name: 'Delayed / Attention' },
  { id: 'history', name: 'Completed / History' },
  { id: 'all', name: 'All Screens (Rotation)' },
];

const RESOLUTION_OPTIONS = [
  '1920x1080 (Full HD)',
  '1366x768 (HD)',
  '1280x1024 (SXGA)',
  '1024x768 (XGA)',
  '2560x1440 (QHD)',
  '3840x2160 (4K UHD)',
];

const ACTION_WIDTH = 60;

// Responsive layout helper
const getResponsiveLayout = (screenWidth: number) => {
  const isSmall = screenWidth < 400;
  const isMedium = screenWidth >= 400 && screenWidth < 768;
  const isLarge = screenWidth >= 768;
  const isXLarge = screenWidth >= 1024;
  
  return {
    isSmall,
    isMedium,
    isLarge,
    isXLarge,
    // Device type grid columns
    deviceTypeColumns: isXLarge ? 6 : isLarge ? 4 : 3,
    deviceTypeCardWidth: isXLarge ? '15%' : isLarge ? '23%' : '30%',
    // Device list columns for large screens
    deviceListColumns: isXLarge ? 3 : isLarge ? 2 : 1,
    // Modal content max width
    modalMaxWidth: isLarge ? 600 : '100%',
    // Font sizes
    headerTitleSize: isSmall ? 18 : 20,
    deviceNameSize: isSmall ? 14 : 16,
    deviceCategorySize: isSmall ? 12 : 13,
    // Padding
    contentPadding: isSmall ? 12 : 16,
    cardPadding: isSmall ? 12 : 16,
    // Icon sizes
    deviceIconSize: isSmall ? 24 : 28,
    deviceIconContainerSize: isSmall ? 44 : 50,
  };
};

interface SwipeableDeviceCardProps {
  device: Device;
  onEdit: () => void;
  onRefresh: () => void;
  onDelete: () => void;
  getDeviceIcon: (type: Device['type']) => string;
  getStatusColor: (status: Device['status']) => string;
  responsive: ReturnType<typeof getResponsiveLayout>;
}

const SwipeableDeviceCard: React.FC<SwipeableDeviceCardProps> = ({
  device,
  onEdit,
  onRefresh,
  onDelete,
  getDeviceIcon,
  getStatusColor,
  responsive,
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.refreshAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onRefresh();
          }}
        >
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={[styles.deviceCard, { padding: responsive.cardPadding }]}
        onPress={onEdit}
        activeOpacity={0.7}
      >
        <View style={[
          styles.deviceIconContainer, 
          { 
            width: responsive.deviceIconContainerSize, 
            height: responsive.deviceIconContainerSize 
          }
        ]}>
          <Ionicons name={getDeviceIcon(device.type) as any} size={responsive.deviceIconSize} color="#4F7DF3" />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={[styles.deviceName, { fontSize: responsive.deviceNameSize }]}>{device.name}</Text>
          <Text style={[styles.deviceCategory, { fontSize: responsive.deviceCategorySize }]}>{device.category}</Text>
          {device.assignedScreen && (
            <Text style={styles.deviceAssignment}>
              → {SCREEN_ASSIGNMENTS.find(s => s.id === device.assignedScreen)?.name || device.assignedScreen}
            </Text>
          )}
          {device.ipAddress && (
            <Text style={styles.deviceAddress}>
              {device.ipAddress}{device.port ? `:${device.port}` : ''}
            </Text>
          )}
        </View>
        <View style={styles.deviceStatusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(device.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(device.status) }]}>
            {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const DeviceManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const responsive = useMemo(() => getResponsiveLayout(screenWidth), [screenWidth]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  
  const [selectedDeviceType, setSelectedDeviceType] = useState<typeof DEVICE_TYPES[0] | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [deviceIP, setDeviceIP] = useState('');
  const [devicePort, setDevicePort] = useState('');
  const [deviceResolution, setDeviceResolution] = useState('');
  const [assignedScreen, setAssignedScreen] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const savedDevices = await AsyncStorage.getItem('configuredDevices');
      if (savedDevices) {
        setDevices(JSON.parse(savedDevices));
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDevices = async (deviceList: Device[]) => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem('configuredDevices', JSON.stringify(deviceList));
      setDevices(deviceList);
    } catch (error) {
      console.error('Error saving devices:', error);
      Alert.alert('Error', 'Failed to save device configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'kds-monitor': return 'tv-outline';
      case 'expo-display': return 'easel-outline';
      case 'order-display': return 'tablet-landscape-outline';
      case 'bump-bar': return 'keypad-outline';
      case 'touch-screen': return 'finger-print-outline';
      case 'external-monitor': return 'desktop-outline';
      default: return 'hardware-chip-outline';
    }
  };

  const handleAddDevice = () => {
    setSelectedDeviceType(null);
    setDeviceName('');
    setDeviceIP('');
    setDevicePort('');
    setDeviceResolution('1920x1080 (Full HD)');
    setAssignedScreen('all');
    setShowAddModal(true);
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setDeviceName(device.name);
    setDeviceIP(device.ipAddress || '');
    setDevicePort(device.port || '');
    setDeviceResolution(device.resolution || '1920x1080 (Full HD)');
    setAssignedScreen(device.assignedScreen || 'all');
    setShowEditModal(true);
  };

  const handleSaveNewDevice = () => {
    if (!selectedDeviceType) {
      Alert.alert('Error', 'Please select a device type');
      return;
    }
    if (!deviceName.trim()) {
      Alert.alert('Error', 'Please enter a device name');
      return;
    }

    const newDevice: Device = {
      id: `device-${Date.now()}`,
      name: deviceName.trim(),
      type: selectedDeviceType.type,
      category: selectedDeviceType.category,
      status: 'disconnected',
      ipAddress: deviceIP.trim() || undefined,
      port: devicePort.trim() || undefined,
      resolution: deviceResolution || undefined,
      assignedScreen: assignedScreen || undefined,
    };

    saveDevices([...devices, newDevice]);
    setShowAddModal(false);
    Alert.alert('Success', `${deviceName} has been added`);
  };

  const handleUpdateDevice = () => {
    if (!editingDevice || !deviceName.trim()) return;

    const updatedDevices = devices.map(d => 
      d.id === editingDevice.id 
        ? { ...d, name: deviceName.trim(), ipAddress: deviceIP.trim() || undefined, port: devicePort.trim() || undefined, resolution: deviceResolution || undefined, assignedScreen: assignedScreen || undefined }
        : d
    );
    saveDevices(updatedDevices);
    setShowEditModal(false);
    setEditingDevice(null);
  };

  const handleDeleteDevice = (device: Device) => {
    Alert.alert('Delete Device', `Remove "${device.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => saveDevices(devices.filter(d => d.id !== device.id)) },
    ]);
  };

  const handleTestConnection = (device: Device) => {
    setTimeout(() => {
      const success = Math.random() > 0.3;
      saveDevices(devices.map(d => d.id === device.id ? { ...d, status: success ? 'connected' as const : 'error' as const } : d));
      Alert.alert(success ? 'Success' : 'Failed', success ? `Connected to ${device.name}` : `Could not connect to ${device.name}`);
    }, 1500);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F7DF3" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: responsive.headerTitleSize }]}>Device Management</Text>
        {isSaving && <ActivityIndicator size="small" color="#4F7DF3" />}
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          { padding: responsive.contentPadding },
          responsive.isLarge && styles.contentLarge
        ]}
        showsVerticalScrollIndicator={false}
      >
        {devices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="hardware-chip-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Devices Configured</Text>
            <Text style={styles.emptyText}>Add your first device to get started.</Text>
          </View>
        ) : (
          <View style={[
            styles.deviceList,
            responsive.isLarge && styles.deviceListGrid
          ]}>
            {devices.map((device) => (
              <View 
                key={device.id} 
                style={responsive.isLarge ? { width: responsive.isXLarge ? '32%' : '48%' } : undefined}
              >
                <SwipeableDeviceCard
                  device={device}
                  onEdit={() => handleEditDevice(device)}
                  onRefresh={() => handleTestConnection(device)}
                  onDelete={() => handleDeleteDevice(device)}
                  getDeviceIcon={getDeviceIcon}
                  getStatusColor={getStatusColor}
                  responsive={responsive}
                />
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Set Up Device</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
            <Text style={styles.modalTitle}>Set Up Device</Text>
            <TouchableOpacity onPress={handleSaveNewDevice}><Text style={[styles.saveBtn, !selectedDeviceType && styles.saveBtnDisabled]}>Save</Text></TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={responsive.isLarge && styles.modalContentLarge}
          >
            <View style={responsive.isLarge ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : undefined}>
              <Text style={styles.sectionLabel}>Select Device Type</Text>
              <View style={styles.deviceTypeGrid}>
                {DEVICE_TYPES.map((type) => (
                  <TouchableOpacity 
                    key={type.key} 
                    style={[
                      styles.deviceTypeCard, 
                      { width: responsive.isXLarge ? '15%' : responsive.isLarge ? '22%' : '30%' },
                      selectedDeviceType?.key === type.key && styles.deviceTypeCardSelected
                    ]}
                    onPress={() => { setSelectedDeviceType(type); setDeviceName(type.name); setDevicePort('8080'); }}
                  >
                    <Ionicons name={type.icon as any} size={responsive.isSmall ? 28 : 32} color={selectedDeviceType?.key === type.key ? '#4F7DF3' : '#666'} />
                    <Text style={[styles.deviceTypeName, selectedDeviceType?.key === type.key && styles.deviceTypeNameSelected]}>{type.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            {selectedDeviceType && (
              <>
                <Text style={styles.sectionLabel}>Device Details</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput style={styles.input} value={deviceName} onChangeText={setDeviceName} placeholder="Device name" placeholderTextColor="#999" />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Assigned Screen</Text>
                  <View style={styles.optionsGrid}>
                    {SCREEN_ASSIGNMENTS.map((screen) => (
                      <TouchableOpacity 
                        key={screen.id} 
                        style={[styles.optionButton, assignedScreen === screen.id && styles.optionButtonSelected]}
                        onPress={() => setAssignedScreen(screen.id)}
                      >
                        <Text style={[styles.optionButtonText, assignedScreen === screen.id && styles.optionButtonTextSelected]}>
                          {screen.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Resolution</Text>
                  <View style={styles.optionsGrid}>
                    {RESOLUTION_OPTIONS.map((res) => (
                      <TouchableOpacity 
                        key={res} 
                        style={[styles.optionButton, deviceResolution === res && styles.optionButtonSelected]}
                        onPress={() => setDeviceResolution(res)}
                      >
                        <Text style={[styles.optionButtonText, deviceResolution === res && styles.optionButtonTextSelected]}>
                          {res}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {selectedDeviceType.type !== 'bump-bar' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>IP Address (Optional)</Text>
                      <TextInput style={styles.input} value={deviceIP} onChangeText={setDeviceIP} placeholder="192.168.1.100" placeholderTextColor="#999" keyboardType="numeric" />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Port (Optional)</Text>
                      <TextInput style={styles.input} value={devicePort} onChangeText={setDevicePort} placeholder="8080" placeholderTextColor="#999" keyboardType="numeric" />
                    </View>
                  </>
                )}
              </>
            )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEditModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Device</Text>
            <TouchableOpacity onPress={handleUpdateDevice}><Text style={styles.saveBtn}>Save</Text></TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={responsive.isLarge && styles.modalContentLarge}
          >
            <View style={responsive.isLarge ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : undefined}>
            {editingDevice && (
              <>
                <View style={styles.editDeviceHeader}>
                  <View style={styles.editDeviceIcon}><Ionicons name={getDeviceIcon(editingDevice.type) as any} size={40} color="#4F7DF3" /></View>
                  <Text style={styles.editDeviceType}>{editingDevice.category}</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput style={styles.input} value={deviceName} onChangeText={setDeviceName} placeholder="Device name" placeholderTextColor="#999" />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Assigned Screen</Text>
                  <View style={styles.optionsGrid}>
                    {SCREEN_ASSIGNMENTS.map((screen) => (
                      <TouchableOpacity 
                        key={screen.id} 
                        style={[styles.optionButton, assignedScreen === screen.id && styles.optionButtonSelected]}
                        onPress={() => setAssignedScreen(screen.id)}
                      >
                        <Text style={[styles.optionButtonText, assignedScreen === screen.id && styles.optionButtonTextSelected]}>
                          {screen.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Resolution</Text>
                  <View style={styles.optionsGrid}>
                    {RESOLUTION_OPTIONS.map((res) => (
                      <TouchableOpacity 
                        key={res} 
                        style={[styles.optionButton, deviceResolution === res && styles.optionButtonSelected]}
                        onPress={() => setDeviceResolution(res)}
                      >
                        <Text style={[styles.optionButtonText, deviceResolution === res && styles.optionButtonTextSelected]}>
                          {res}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {editingDevice.type !== 'bump-bar' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>IP Address (Optional)</Text>
                      <TextInput style={styles.input} value={deviceIP} onChangeText={setDeviceIP} placeholder="192.168.1.100" placeholderTextColor="#999" keyboardType="numeric" />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Port (Optional)</Text>
                      <TextInput style={styles.input} value={devicePort} onChangeText={setDevicePort} placeholder="8080" placeholderTextColor="#999" keyboardType="numeric" />
                    </View>
                  </>
                )}
              </>
            )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', gap: 12 },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, fontWeight: '600', color: '#333' },
  content: { flex: 1, backgroundColor: '#f8f9fa' },
  contentLarge: { maxWidth: 1200, alignSelf: 'center', width: '100%' },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#666', textAlign: 'center' },
  deviceList: { gap: 12 },
  deviceListGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  actionsContainer: { flexDirection: 'row', height: '100%' },
  swipeAction: { width: ACTION_WIDTH, justifyContent: 'center', alignItems: 'center' },
  refreshAction: { backgroundColor: '#4F7DF3' },
  deleteAction: { backgroundColor: '#F44336' },
  deviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  deviceIconContainer: { borderRadius: 12, backgroundColor: '#E8EFFF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  deviceInfo: { flex: 1, minWidth: 0 },
  deviceName: { fontWeight: '600', color: '#333' },
  deviceCategory: { color: '#666', marginTop: 2 },
  deviceAssignment: { fontSize: 12, color: '#4F7DF3', marginTop: 2, fontWeight: '500' },
  deviceAddress: { fontSize: 12, color: '#999', marginTop: 2 },
  deviceStatusContainer: { alignItems: 'center', marginLeft: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  statusText: { fontSize: 10, fontWeight: '500' },
  footer: { padding: 16, paddingBottom: 32, backgroundColor: '#f8f9fa' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4F7DF3', paddingVertical: 16, borderRadius: 12, gap: 8, maxWidth: 400, alignSelf: 'center', width: '100%' },
  addButtonText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  modalContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  saveBtn: { fontSize: 16, fontWeight: '600', color: '#4F7DF3' },
  saveBtnDisabled: { color: '#ccc' },
  modalContent: { flex: 1, padding: 16 },
  modalContentLarge: { paddingHorizontal: 40 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 12, marginTop: 8 },
  deviceTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, justifyContent: 'flex-start' },
  deviceTypeCard: { aspectRatio: 1, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', padding: 8, minWidth: 90 },
  deviceTypeCardSelected: { borderColor: '#4F7DF3', backgroundColor: '#E8EFFF' },
  deviceTypeName: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 8 },
  deviceTypeNameSelected: { color: '#4F7DF3', fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0', color: '#333' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  optionButtonSelected: { backgroundColor: '#4F7DF3', borderColor: '#4F7DF3' },
  optionButtonText: { fontSize: 13, color: '#666' },
  optionButtonTextSelected: { color: '#fff', fontWeight: '500' },
  editDeviceHeader: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  editDeviceIcon: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#E8EFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  editDeviceType: { fontSize: 16, color: '#666' },
});

export default DeviceManagementScreen;
