import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setConnected, 
  addMessage, 
  updateChatInList, 
  setUnreadCount,
  markChatAsRead,
  setUserOnline,
  setUserOffline
} from '../redux/slices/chatSlice';
import PromotionToast from '../components/common/PromotionToast';
import { getUnviewedPromotions } from '../services/promotionService';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [promotionToast, setPromotionToast] = useState(null); // State cho promotion toast
  const [promotionQueue, setPromotionQueue] = useState([]); // Queue cho nhiều promotions
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false); // Track if socket has been initialized
  const hasLoadedUnviewedRef = useRef(false); // Track if đã load unviewed promotions

  useEffect(() => {
    // Get user ID (could be userId or _id depending on source)
    const userIdValue = user?.userId || user?._id;
    
    // Only connect if user is logged in
    if (!userIdValue) {
      // User logged out - disconnect socket
      if (socketRef.current) {
        console.log('🔌 User logged out, disconnecting socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
        isInitializedRef.current = false;
        hasLoadedUnviewedRef.current = false; // 🎁 Reset flag khi logout
      }
      setSocket(null);
      setIsConnected(false);
      setPromotionToast(null); // Clear toast hiện tại
      setPromotionQueue([]); // Clear queue
      dispatch(setConnected(false));
      return;
    }

    // If already initialized for this user, skip
    if (isInitializedRef.current && socketRef.current) {
      console.log('✅ Socket already initialized, reusing existing connection');
      return;
    }

    // 🎁 Reset flag khi user mới login
    hasLoadedUnviewedRef.current = false;

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ No token found in localStorage, cannot connect to socket');
      console.log('💡 Please login to enable chat functionality');
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');
    console.log('📍 Socket URL:', import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001');
    console.log('👤 User ID:', userIdValue);

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'] // Try websocket first, fallback to polling
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      console.log('🆔 Socket ID:', newSocket.id);
      setIsConnected(true);
      dispatch(setConnected(true));
      
      // 🎁 Load unviewed promotions SAU KHI socket connect (chỉ cho customers)
      if (user?.role !== 'admin' && !hasLoadedUnviewedRef.current) {
        console.log('🎁 Triggering loadUnviewedPromotions after socket connect...');
        setTimeout(() => {
          loadUnviewedPromotions();
        }, 500); // Delay 500ms để đảm bảo auth đã hoàn tất
        hasLoadedUnviewedRef.current = true;
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      dispatch(setConnected(false));
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsConnected(false);
      dispatch(setConnected(false));
    });

    // Chat events
    newSocket.on('chat:new-message', (data) => {
      console.log('📨 New message received:', data);
      console.log('📨 Message chatId:', data.message?.chatId);
      console.log('📨 Full message:', data.message);
      dispatch(addMessage(data.message));
      
      // Update chat in list
      if (data.chat) {
        dispatch(updateChatInList(data.chat));
      }
    });

    newSocket.on('chat:new-message-notification', (data) => {
      console.log('📬 New message notification:', data);
      dispatch(setUnreadCount(data.unreadCount));
      
      // AdminChatPanel component will handle refreshing the chat list
      // when it receives this event
    });

    newSocket.on('chat:messages-read', (data) => {
      console.log('Messages marked as read:', data);
      dispatch(markChatAsRead(data.chatId));
    });

    newSocket.on('chat:admin-assigned', (data) => {
      console.log('Admin assigned to chat:', data);
      // You can show a notification here
    });

    // Admin events
    newSocket.on('user:online', (data) => {
      console.log('User online:', data.userId);
      dispatch(setUserOnline(data.userId));
    });

    newSocket.on('user:offline', (data) => {
      console.log('User offline:', data.userId);
      dispatch(setUserOffline(data.userId));
    });

    newSocket.on('admin:chats-list', (data) => {
      console.log('Admin chats list received:', data);
      // Handled in admin component
    });

    // Error handling
    newSocket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });

    // 🎁 Promotion events - Luôn lắng nghe, nhưng chỉ hiển thị cho customers
    newSocket.on('promotion:created', (data) => {
      console.log('🎉 Promotion event received:', data.promotion);
      console.log('👤 Current user role:', user?.role);
      
      // Chỉ hiển thị toast cho customers (không phải admin)
      if (user?.role !== 'admin') {
        console.log('✅ Showing promotion toast to customer');
        setPromotionToast(data.promotion);
      } else {
        console.log('⏭️ Skipping promotion toast for admin');
      }
    });

    // Store socket reference
    socketRef.current = newSocket;
    setSocket(newSocket);
    isInitializedRef.current = true;

    console.log('✅ Socket initialization complete');

    // Cleanup - only runs when component unmounts or user changes
    return () => {
      console.log('🧹 Cleaning up socket effect...');
      // Don't disconnect here - let the unmount effect handle it
    };
  }, [user?.userId || user?._id, dispatch]); // Depend on userId or _id

  // Cleanup on actual component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 SocketProvider unmounting - disconnecting socket...');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        isInitializedRef.current = false;
      }
      hasLoadedUnviewedRef.current = false; // Reset khi unmount
    };
  }, []);

  // 🎁 Function: Load unviewed promotions từ backend
  const loadUnviewedPromotions = async () => {
    try {
      console.log('📥 Loading unviewed promotions...');
      console.log('👤 Current user:', user);
      console.log('🔐 Token exists:', !!localStorage.getItem('token'));
      
      const promotions = await getUnviewedPromotions();
      
      console.log('📦 API Response:', promotions);
      
      if (promotions && promotions.length > 0) {
        console.log(`✅ Found ${promotions.length} unviewed promotion(s):`, promotions);
        setPromotionQueue(promotions);
      } else {
        console.log('ℹ️ No unviewed promotions');
      }
    } catch (error) {
      console.error('❌ Error loading unviewed promotions:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
    }
  };

  // 🎁 Auto-display promotions từ queue
  useEffect(() => {
    if (promotionQueue.length > 0 && !promotionToast) {
      // Lấy promotion đầu tiên trong queue
      const nextPromotion = promotionQueue[0];
      setPromotionToast(nextPromotion);
      setPromotionQueue(prev => prev.slice(1)); // Remove từ queue
    }
  }, [promotionQueue, promotionToast]);

  const value = {
    socket,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
      
      {/* Promotion Toast - Hiển thị góc dưới trái */}
      {promotionToast && (
        <PromotionToast
          promotion={promotionToast}
          onClose={() => setPromotionToast(null)}
        />
      )}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
