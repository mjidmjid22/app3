import React, { createContext, useState, useEffect, useContext } from 'react';
import { UsersService, User } from '../services/users.service';
import { AdminService, Admin } from '../services/admin.service';

interface AuthState {
  user: User | Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, '_id'>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export { AuthContext };
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd check for a stored token here
    setIsLoading(false);
  }, []);

  const login = async (loginInput: string, password: string): Promise<boolean> => {
    try {
      // Try admin login first if input contains @
      if (loginInput.includes('@')) {
        const admin = await AdminService.login(loginInput, password);
        setUser(admin);
        return true;
      } else {
        // Try user login (workers) - use ID card number directly
        const user = await UsersService.login(loginInput, password);
        setUser(user);
        return true;
      }
    } catch (error: any) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      // You can throw the error to let the LoginScreen handle it
      throw new Error(error.response?.data || error.message || 'Login failed');
    }
  };

  const register = async (userData: Omit<User, '_id'>): Promise<boolean> => {
    try {
      const newUser = await UsersService.addUser(userData);
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
