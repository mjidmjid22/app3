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
    // Try admin login first if input contains @
    if (loginInput.includes('@')) {
      try {
        const admin = await AdminService.login(loginInput, password);
        setUser(admin);
        return true;
      } catch (adminError: any) {
      console.error('Admin login error:', adminError.response ? adminError.response.data : adminError.message);
      return false;
      }
    } else {
      // Try user login (workers) - use ID card number directly
      try {
        const user = await UsersService.login(loginInput, password);
        setUser(user);
        return true;
      } catch (userError: any) {
      console.error('User login error:', userError.response ? userError.response.data : userError.message);
      return false;
      }
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
