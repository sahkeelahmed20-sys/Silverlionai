import { useState, useEffect, useCallback } from 'react';
import type { User, AuthState } from '@/types';

const STORAGE_KEY = 'silver_lion_auth';

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@silverlion.ai',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date(),
    isSubscribed: true,
    subscriptionTier: 'enterprise',
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Demo User',
    role: 'user',
    createdAt: new Date(),
    isSubscribed: true,
    subscriptionTier: 'pro',
  },
];

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({
          user: parsed.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (user && password === 'password') {
      const authData = { user, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    
    return false;
  }, []);

  const register = useCallback(async (email: string, name: string, _password: string): Promise<boolean> => {
    // Mock registration - in real app, this would call an API
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
      createdAt: new Date(),
      isSubscribed: false,
    };

    const authData = { user: newUser, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    setState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...updates };
      const authData = { user: updatedUser, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      
      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  // Get all registered users (for admin panel)
  const getAllUsers = useCallback((): User[] => {
    // In a real app, this would fetch from a database
    return MOCK_USERS;
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
    getAllUsers,
  };
}

export default useAuth;
