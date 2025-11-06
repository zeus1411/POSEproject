import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // HÀM ASYNC → phải await
        const data = await authService.getCurrentUser();
        // Backend thường trả { success, user } hoặc { success, data: { user } }
        // Dựa vào authController của bạn, giả sử là { success, user }
        if (data && data.user) {
          setUser(data.user);
          // role trên backend: 'USER' | 'ADMIN'
          setIsAdmin(data.user.role === 'ADMIN');
        }
      } catch (error) {
        // 401 khi chưa đăng nhập là bình thường → bỏ qua
        console.log('Không đăng nhập hoặc token hết hạn:', error?.response?.status);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data && data.user) {
      setUser(data.user);
      setIsAdmin(data.user.role === 'ADMIN');
    }
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

  // Chỉ render children sau khi check xong auth để tránh flicker
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
