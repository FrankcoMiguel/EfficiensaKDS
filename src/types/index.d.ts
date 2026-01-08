// Navigation stack types
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

// Auth service types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthService {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

// Generic API response type (for future use)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
