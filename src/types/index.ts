export interface Modifier {
  id: string;
  name: string;
  price: number;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  modifiers?: Modifier[];
}

export interface CartItem {
  item: Item;
  quantity: number;
  modifiers?: Modifier[];
}

export interface Category {
  id: string;
  name: string;
}

export type PaymentMethod = 'Cash' | 'Card' | 'MobileWallet';

export type UserRole = 'public' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Table {
  id: string;
  name: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  order?: Order;
}

// KDS Order Statuses
export type KDSOrderStatus = 
  | 'queue'      // New incoming orders waiting to be started
  | 'cooking'    // Orders currently being prepared
  | 'ready'      // Orders finished, waiting for pickup or service
  | 'delayed'    // Orders needing immediate action
  | 'completed'; // Recently completed orders

// KDS Order Item Status
export type KDSItemStatus = 'pending' | 'in-progress' | 'done';

export interface KDSOrderItem {
  id: string;
  name: string;
  quantity: number;
  modifiers?: string[];
  notes?: string;
  status: KDSItemStatus;
  station?: string; // Which kitchen station handles this item
}

export interface KDSOrder {
  id: string;
  orderNumber: string;
  tableId?: string;
  tableName?: string;
  orderType: 'dine-in' | 'takeout' | 'delivery';
  items: KDSOrderItem[];
  status: KDSOrderStatus;
  priority: 'normal' | 'rush' | 'vip';
  createdAt: Date;
  startedAt?: Date;
  readyAt?: Date;
  completedAt?: Date;
  estimatedTime?: number; // in minutes
  elapsedTime?: number; // in seconds
  source?: string; // POS, Online, Kiosk, etc.
  server?: string;
  notes?: string;
}

// Kitchen Station Types
export type KitchenStation = 
  | 'grill'
  | 'fry'
  | 'prep'
  | 'salad'
  | 'drinks'
  | 'dessert'
  | 'expo';

export interface KDSSettings {
  stationId: string;
  stationName: string;
  stationType: KitchenStation;
  alertThresholdWarning: number; // seconds before yellow alert
  alertThresholdCritical: number; // seconds before red alert
  autoRecall: boolean;
  soundEnabled: boolean;
  showAllItems: boolean; // or only items for this station
}

// Legacy Order type for backward compatibility
export interface Order {
  id: string;
  tableId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

