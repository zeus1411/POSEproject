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
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false); // Track if socket has been initialized

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
      }
      setSocket(null);
      setIsConnected(false);
      dispatch(setConnected(false));
      return;
    }

    // If already initialized for this user, skip
    if (isInitializedRef.current && socketRef.current) {
      console.log('✅ Socket already initialized, reusing existing connection');
      return;
    }

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
    };
  }, []);

  const value = {
    socket,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
