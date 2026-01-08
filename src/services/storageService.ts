import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER: '@efficiensa_pos:user',
  SETTINGS: '@efficiensa_pos:settings',
  CART: '@efficiensa_pos:cart',
  OFFLINE_ORDERS: '@efficiensa_pos:offline_orders',
  LAST_SYNC: '@efficiensa_pos:last_sync',
} as const;

export interface AppSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  autoLogoutMinutes: number;
  language: string;
  receiptPrinterEnabled: boolean;
  kitchenDisplayEnabled: boolean;
}

class StorageService {
  // Generic storage methods
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // User-specific methods
  async saveUser(user: any): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER, user);
  }

  async getUser(): Promise<any> {
    return this.getItem(STORAGE_KEYS.USER);
  }

  async removeUser(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.USER);
  }

  // Settings methods
  async saveSettings(settings: AppSettings): Promise<void> {
    return this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  async getSettings(): Promise<AppSettings | null> {
    const defaultSettings: AppSettings = {
      darkMode: false,
      soundEnabled: true,
      autoLogoutMinutes: 30,
      language: 'en',
      receiptPrinterEnabled: false,
      kitchenDisplayEnabled: false,
    };

    const stored = await this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
    return stored ? { ...defaultSettings, ...stored } : defaultSettings;
  }

  // Cart methods
  async saveCart(cartItems: any[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.CART, cartItems);
  }

  async getCart(): Promise<any[]> {
    const cart = await this.getItem<any[]>(STORAGE_KEYS.CART);
    return cart || [];
  }

  async clearCart(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.CART);
  }

  // Offline orders (for when network is unavailable)
  async saveOfflineOrder(order: any): Promise<void> {
    const offlineOrders = await this.getOfflineOrders();
    offlineOrders.push({ ...order, timestamp: new Date().toISOString() });
    return this.setItem(STORAGE_KEYS.OFFLINE_ORDERS, offlineOrders);
  }

  async getOfflineOrders(): Promise<any[]> {
    const orders = await this.getItem<any[]>(STORAGE_KEYS.OFFLINE_ORDERS);
    return orders || [];
  }

  async clearOfflineOrders(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.OFFLINE_ORDERS);
  }

  async removeOfflineOrder(orderId: string): Promise<void> {
    const orders = await this.getOfflineOrders();
    const filteredOrders = orders.filter(order => order.id !== orderId);
    return this.setItem(STORAGE_KEYS.OFFLINE_ORDERS, filteredOrders);
  }

  // Sync tracking
  async saveLastSyncTime(timestamp: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  async getLastSyncTime(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.LAST_SYNC);
  }

  // Utility methods
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async getStorageSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
}

export const storageService = new StorageService();
export default storageService;