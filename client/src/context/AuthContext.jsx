import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser.user);
      // Check if user is admin (you might need to adjust this based on your user role structure)
      setIsAdmin(currentUser.user.role === 'admin');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setIsAdmin(data.user.role === 'admin');
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
