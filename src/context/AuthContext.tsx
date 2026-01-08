import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// Admin PIN for accessing dashboard
const ADMIN_PIN = '0000';

interface AuthContextType {
  user: User;
  isLoading: boolean;
  isAdmin: boolean;
  loginAsAdmin: (pin: string) => Promise<boolean>;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default public user (kiosk customer)
const publicUser: User = {
  id: 'public',
  name: 'Customer',
  role: 'public',
};

// Admin user
const adminUser: User = {
  id: 'admin',
  name: 'Admin',
  role: 'admin',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(publicUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiosk always starts as public user, no stored session needed
    setIsLoading(false);
  }, []);

  // Login as admin with PIN
  const loginAsAdmin = async (pin: string): Promise<boolean> => {
    if (pin === ADMIN_PIN) {
      setUser(adminUser);
      return true;
    }
    return false;
  };

  // Logout admin, revert to public user
  const logoutAdmin = () => {
    setUser(publicUser);
  };

  const isAdmin = user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        loginAsAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};