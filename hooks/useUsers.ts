import { useState, useEffect } from 'react';
import { User, UsersService } from '../services/users.service';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await UsersService.getUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const addUser = async (userData: Omit<User, '_id'>) => {
    try {
      const newUser = await UsersService.addUser(userData);
      setUsers(prevUsers => [...prevUsers, newUser]);
    } catch (err) {
      setError(err as Error);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await UsersService.updateUser(userId, updates);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, ...updates } : user
        )
      );
    } catch (err) {
      setError(err as Error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await UsersService.deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    } catch (err) {
      setError(err as Error);
    }
  };

  return { users, loading, error, addUser, updateUser, deleteUser };
};
