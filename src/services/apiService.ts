// API Services for Efficiensa POS
// This file contains service functions for backend API integration

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Base API configuration
const API_BASE_URL = process.env.REACT_NATIVE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP Error: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Auth endpoints
  async login(pin: string): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Menu endpoints
  async getMenuItems(): Promise<ApiResponse> {
    return this.request('/menu/items');
  }

  async getCategories(): Promise<ApiResponse> {
    return this.request('/menu/categories');
  }

  // Order endpoints
  async createOrder(orderData: any): Promise<ApiResponse> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<ApiResponse> {
    return this.request('/orders');
  }

  async updateOrder(orderId: string, updateData: any): Promise<ApiResponse> {
    return this.request(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Table endpoints
  async getTables(): Promise<ApiResponse> {
    return this.request('/tables');
  }

  async updateTable(tableId: string, updateData: any): Promise<ApiResponse> {
    return this.request(`/tables/${tableId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // User management endpoints
  async getUsers(): Promise<ApiResponse> {
    return this.request('/users');
  }

  async createUser(userData: any): Promise<ApiResponse> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any): Promise<ApiResponse> {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Reports endpoints
  async getReports(period: string, type: string): Promise<ApiResponse> {
    return this.request(`/reports?period=${period}&type=${type}`);
  }

  async getDashboardStats(): Promise<ApiResponse> {
    return this.request('/reports/dashboard');
  }

  // Payment endpoints
  async processPayment(paymentData: any): Promise<ApiResponse> {
    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
}

export const apiService = new ApiService();
export default apiService;