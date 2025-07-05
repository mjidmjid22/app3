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
        try {
          const admin = await AdminService.login(loginInput, password);
          setUser(admin);
          return true;
        } catch (adminError: any) {
          // Only use fallback if it's a connection error, not invalid credentials
          if (adminError.code === 'ECONNREFUSED' || adminError.code === 'NETWORK_ERROR') {
            // Fallback admin accounts when API is not available
          const fallbackAdmins = [
            {
              _id: 'admin1',
              email: 'admin@mantaevert.com',
              password: 'admin123',
              name: 'System Administrator',
              role: 'Admin' as const,
              dateCreated: new Date(),
              lastLogin: new Date()
            },
            {
              _id: 'admin2',
              email: 'manager@mantaevert.com',
              password: 'manager123',
              name: 'Manager',
              role: 'Admin' as const,
              dateCreated: new Date(),
              lastLogin: new Date()
            }
          ];
          
          const matchingAdmin = fallbackAdmins.find(
            admin => admin.email === loginInput && admin.password === password
          );
          
          if (matchingAdmin) {
            const { password: _, ...adminWithoutPassword } = matchingAdmin;
            setUser(adminWithoutPassword);
            return true;
          }
          } else {
            // If it's invalid credentials, don't try fallback
            return false;
          }
        }
      }
      
      // Try user login (workers) - use ID card number directly
      try {
        const user = await UsersService.login(loginInput, password);
        setUser(user);
        return true;
      } catch (userError: any) {
        // Only use fallback if it's a connection error, not invalid credentials
        if (userError.code === 'ECONNREFUSED' || userError.code === 'NETWORK_ERROR') {
          // Fallback worker accounts when API is not available
        const fallbackWorkers = [
          {
            _id: 'worker1',
            idCardNumber: '12345',
            name: 'John Worker',
            role: 'Worker' as const,
            employeeId: 'EMP001',
            status: 'Active' as const,
            department: 'Construction',
            dateCreated: new Date(),
            dailyRate: 120,
            lastLogin: new Date()
          },
          {
            _id: 'worker2',
            idCardNumber: '67890',
            name: 'Jane Supervisor',
            role: 'Supervisor' as const,
            employeeId: 'EMP002',
            status: 'Active' as const,
            department: 'Management',
            dateCreated: new Date(),
            dailyRate: 150,
            lastLogin: new Date()
          }
        ];
        
        const matchingWorker = fallbackWorkers.find(
          worker => worker.idCardNumber === loginInput || 
                   (loginInput.includes('@') && loginInput.startsWith(worker.idCardNumber))
        );
        
        if (matchingWorker && (password === matchingWorker.idCardNumber || password === 'worker123')) {
          setUser(matchingWorker);
          return true;
        }
        } else {
          // If it's invalid credentials, don't try fallback
          return false;
        }
      }
      
      console.error('Login failed - no matching accounts found');
      return false;
    } catch (error: any) {
      console.error('Login failed', error.response?.data || error.message);
      return false;
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
