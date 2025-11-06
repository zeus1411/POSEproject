import { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../redux/slices/authSlice';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Compute isAdmin from user
  const isAdmin = user?.role === 'ADMIN';

  const login = async (credentials) => {
    // Login sẽ được xử lý bởi Redux thunk trong Login.jsx
    // Giữ hàm này để tương thích với code cũ
    const data = await authService.login(credentials);
    return data;
  };

  const register = async (userData) => {
    // Register sẽ được xử lý bởi Redux thunk trong Register.jsx
    // Giữ hàm này để tương thích với code cũ
    const data = await authService.register(userData);
    return data;
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const value = {
    user,
    isAdmin,
    isLoading: false, // Redux xử lý loading riêng
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;