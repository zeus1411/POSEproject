import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  MinusIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ClockIcon,
  TrashIcon,
  UserIcon,
  ArrowPathIcon,
  FunnelIcon,
  ExclamationCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { getAdminChats, assignAdmin, markAsRead, deleteChat } from '../../redux/slices/chatSlice';
import { useSocket } from '../../context/SocketContext';
import Swal from 'sweetalert2';

const AdminChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { chatId, x, y }
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, UNASSIGNED, ASSIGNED, RESOLVED
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignmentHistory, setShowAssignmentHistory] = useState(false);
  
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const { user } = useSelector((state) => state.auth);
  const { chats, unreadCount, isLoading } = useSelector((state) => state.chat);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const hasJoinedChatRef = useRef(null); // Track if we've already joined this chat
  const contextMenuRef = useRef(null);

  // Get selected chat
  const selectedChat = chats.find(c => c._id === selectedChatId);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
    }
  }, [selectedChat?.messages]);

  // Load chats when admin opens panel
  useEffect(() => {
    if (isOpen && user && user.role === 'admin') {
      dispatch(getAdminChats());
      
      // Request chats via socket
      if (socket && isConnected) {
        socket.emit('admin:get-chats');
      }
    }
  }, [isOpen, user, dispatch, socket, isConnected]);

  // Listen for new messages and assignment events
  useEffect(() => {
    if (!socket || !user || user.role !== 'admin') return;

    const handleNewMessageNotification = (data) => {
      console.log('📬 Admin got notification:', data);
      
      // If this is a new chat from a new user, open the panel
      if (data.isNewChat) {
        console.log('🆕 New user chat detected - opening panel');
        setIsOpen(true);
        setIsMinimized(false);
      }
      
      // Reload chat list to include new chat
      dispatch(getAdminChats());
    };

    const handleNewMessage = (data) => {
      console.log('💬 New message in chat:', data);
      
      // Nếu tin nhắn mới trong chat đang mở và admin đang xem → tự động mark as read
      if (data.message.chatId === selectedChatId) {
        console.log('✅ Auto mark as read - admin is viewing this chat');
        dispatch(markAsRead(data.message.chatId));
        socket.emit('chat:mark-read', { chatId: data.message.chatId });
      }
      
      // Reload chat list để cập nhật unread count
      dispatch(getAdminChats());
    };

    const handleChatAssigned = (data) => {
      console.log('✅ Chat assigned:', data);
      dispatch(getAdminChats());
    };

    const handleChatTakenOver = (data) => {
      console.log('🔄 Chat taken over:', data);
      dispatch(getAdminChats());
      
      // Show notification
      if (data.newAssignedTo !== user._id) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Chat đã được tiếp quản',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    };

    const handleChatUnassigned = (data) => {
      console.log('↩️ Chat unassigned:', data);
      dispatch(getAdminChats());
    };

    const handleChatUpdated = (data) => {
      console.log('🔄 Chat updated:', data);
      dispatch(getAdminChats());
    };

    socket.on('chat:new-message-notification', handleNewMessageNotification);
    socket.on('chat:new-message', handleNewMessage);
    socket.on('admin:chat-assigned', handleChatAssigned);
    socket.on('admin:chat-taken-over', handleChatTakenOver);
    socket.on('admin:chat-unassigned', handleChatUnassigned);
    socket.on('chat:updated', handleChatUpdated);

    return () => {
      socket.off('chat:new-message-notification', handleNewMessageNotification);
      socket.off('chat:new-message', handleNewMessage);
      socket.off('admin:chat-assigned', handleChatAssigned);
      socket.off('admin:chat-taken-over', handleChatTakenOver);
      socket.off('admin:chat-unassigned', handleChatUnassigned);
      socket.off('chat:updated', handleChatUpdated);
    };
  }, [socket, user, dispatch, selectedChatId]);

  // Listen for admin chats list
  useEffect(() => {
    if (socket) {
      const handleChatsList = (data) => {
        // Update local state if needed
        console.log('Received chats list:', data.chats);
      };

      socket.on('admin:chats-list', handleChatsList);

      return () => {
        socket.off('admin:chats-list', handleChatsList);
      };
    }
  }, [socket]);

  // Join chat room when chat is selected
  useEffect(() => {
    if (selectedChat && socket && isConnected) {
      // Only join if we haven't joined this chat yet
      if (hasJoinedChatRef.current !== selectedChat._id) {
        console.log('🔗 Admin joining chat room:', selectedChat._id);
        socket.emit('chat:join', { chatId: selectedChat._id });
        
        // Mark as read
        dispatch(markAsRead(selectedChat._id));
        socket.emit('chat:mark-read', { chatId: selectedChat._id });
        
        // Remember that we've joined this chat
        hasJoinedChatRef.current = selectedChat._id;
      }
    }
    
    // Reset when no chat is selected
    if (!selectedChat) {
      hasJoinedChatRef.current = null;
    }
  }, [selectedChat?._id, socket, isConnected, dispatch]); // Only depend on chat ID, not entire object

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && socket && selectedChat) {
      setIsTyping(true);
      socket.emit('chat:typing', { chatId: selectedChat._id, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && selectedChat) {
        socket.emit('chat:typing', { chatId: selectedChat._id, isTyping: false });
      }
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !socket || !selectedChat) return;

    // Kiểm tra quyền nhắn tin
    const assignedAdmin = selectedChat.assignedTo || selectedChat.adminId;
    const isMyChat = assignedAdmin?._id === user?._id;
    const isUnassigned = selectedChat.status === 'UNASSIGNED';

    if (!isUnassigned && !isMyChat) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể nhắn tin!',
        html: `User này đang được xử lý bởi <strong>${assignedAdmin?.username || 'admin khác'}</strong>.<br/>Vui lòng chọn user khác hoặc nhấn "Tiếp quản" để tiếp nhận.`,
        confirmButtonColor: '#7C3AED'
      });
      return;
    }

    socket.emit('chat:send-message', {
      chatId: selectedChat._id,
      message: message.trim()
    });

    // Mark as read sau khi gửi tin nhắn (clear unread badge)
    dispatch(markAsRead(selectedChat._id));
    socket.emit('chat:mark-read', { chatId: selectedChat._id });

    // Reload chat list để cập nhật UI
    setTimeout(() => {
      dispatch(getAdminChats());
    }, 500);

    setMessage('');
    setIsTyping(false);
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    
    // If chat is UNASSIGNED, assign admin automatically
    const chat = chats.find(c => c._id === chatId);
    if (chat && chat.status === 'UNASSIGNED' && !chat.assignedTo && !chat.adminId) {
      dispatch(assignAdmin(chatId));
      if (socket) {
        socket.emit('admin:assign-chat', { chatId });
      }
    }
  };

  const handleTakeOverChat = async (chatId) => {
    try {
      const result = await Swal.fire({
        title: 'Tiếp quản chat?',
        text: 'Bạn muốn tiếp quản cuộc trò chuyện này từ admin khác?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#7C3AED',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Tiếp quản',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        if (socket) {
          socket.emit('admin:takeover-chat', { chatId });
        }
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Đã tiếp quản chat!',
          showConfirmButton: false,
          timer: 2000
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tiếp quản chat. Vui lòng thử lại.',
      });
    }
  };

  const handleUnassignChat = async (chatId) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có thực sự muốn trả chat?',
        text: 'Chat sẽ được trả về danh sách chung để admin khác có thể xử lý.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#7C3AED',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Trả về',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        if (socket) {
          socket.emit('admin:unassign-chat', { chatId });
        }
        
        // Clear selection if this was selected
        if (selectedChatId === chatId) {
          setSelectedChatId(null);
        }
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Đã trả chat về pool!',
          showConfirmButton: false,
          timer: 2000
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể trả chat về pool. Vui lòng thử lại.',
      });
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Handle right click on chat item
  const handleContextMenu = (e, chatId) => {
    e.preventDefault();
    setContextMenu({
      chatId,
      x: e.clientX,
      y: e.clientY
    });
  };

  // Handle delete chat
  const handleDeleteChat = async () => {
    if (!contextMenu) return;
    
    const chatToDelete = chats.find(c => c._id === contextMenu.chatId);
    const username = chatToDelete?.userId?.username || 'người dùng này';
    const chatId = contextMenu.chatId;
    
    // Close context menu immediately
    setContextMenu(null);
    
    // Show SweetAlert2 confirmation
    const result = await Swal.fire({
      title: 'Xóa đoạn chat?',
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-3">Bạn có chắc chắn muốn xóa đoạn chat với:</p>
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                ${username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="font-semibold text-gray-900">${username}</p>
                <p class="text-xs text-gray-500">Tất cả tin nhắn sẽ bị xóa vĩnh viễn</p>
              </div>
            </div>
          </div>
          <p class="text-sm text-red-600 font-medium">⚠️ Hành động này không thể hoàn tác!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: '<i class="fas fa-trash"></i> Xóa đoạn chat',
      cancelButtonText: 'Hủy bỏ',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'font-semibold px-6 py-2.5 rounded-lg',
        cancelButton: 'font-semibold px-6 py-2.5 rounded-lg'
      }
    });
    
    if (result.isConfirmed) {
      try {
        // Show loading
        Swal.fire({
          title: 'Đang xóa...',
          html: 'Vui lòng đợi trong giây lát',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        await dispatch(deleteChat(chatId)).unwrap();
        
        // If deleted chat was selected, clear selection
        if (selectedChatId === chatId) {
          setSelectedChatId(null);
        }
        
        // Notify via socket
        if (socket) {
          socket.emit('chat:deleted', { chatId });
        }
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: `Đã xóa đoạn chat với ${username} thành công`,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-2xl'
          }
        });
      } catch (error) {
        // Show error message
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'Không thể xóa đoạn chat. Vui lòng thử lại.',
          confirmButtonColor: '#3B82F6',
          customClass: {
            popup: 'rounded-2xl'
          }
        });
      }
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Filter chats by search query and status
  const filteredChats = chats.filter(chat => {
    // Search filter
    if (searchQuery) {
      const username = (chat.userId?.username || chat.customerId?.username || '').toLowerCase();
      const email = (chat.userId?.email || chat.customerId?.email || '').toLowerCase();
      if (!username.includes(searchQuery.toLowerCase()) && !email.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'UNASSIGNED' && chat.status !== 'UNASSIGNED') return false;
      if (statusFilter === 'ASSIGNED' && chat.status !== 'ASSIGNED') return false;
      if (statusFilter === 'RESOLVED' && chat.status !== 'RESOLVED') return false;
    }

    return true;
  });

  // Calculate total unread (use admins for new model, admin for old model)
  const totalUnread = chats.reduce((sum, chat) => {
    const unread = chat.unreadCount?.admins || chat.unreadCount?.admin || 0;
    return sum + unread;
  }, 0);

  // Count by status
  const unassignedCount = chats.filter(c => c.status === 'UNASSIGNED').length;
  const assignedCount = chats.filter(c => c.status === 'ASSIGNED').length;
  const myChatsCount = chats.filter(c => 
    (c.assignedTo?._id || c.adminId?._id) === user?._id
  ).length;

  // Don't show if user is not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <ChatBubbleLeftRightIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
          {isConnected && (
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl flex transition-all duration-300 ${
          isMinimized ? 'w-96 h-16' : 'w-[800px] h-[600px]'
        }`}>
          {/* Header */}
          <div className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between absolute top-0 left-0 right-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-purple-600" />
                </div>
                {isConnected && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">Chat Hỗ trợ - Admin</h3>
                <p className="text-xs text-purple-100">
                  {unassignedCount} chưa nhận • {myChatsCount} của tôi {totalUnread > 0 && `• ${totalUnread} chưa đọc`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <MinusIcon className="w-5 h-5" />
              </button>
              <button
                onClick={toggleChat}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="flex w-full mt-16">
              {/* Chat List Sidebar */}
              <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                {/* Search */}
                <div className="p-4 border-b border-gray-200 space-y-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm người dùng..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-white rounded-lg p-1">
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        statusFilter === 'ALL' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Tất cả ({chats.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('UNASSIGNED')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        statusFilter === 'UNASSIGNED' 
                          ? 'bg-orange-500 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Chưa nhận ({unassignedCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('ASSIGNED')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        statusFilter === 'ASSIGNED' 
                          ? 'bg-green-500 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Đang xử lý ({assignedCount})
                    </button>
                  </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mb-2" />
                      <p className="text-center">Không có cuộc trò chuyện nào</p>
                    </div>
                  ) : (
                    filteredChats.map((chat) => {
                      const lastMessage = chat.messages[chat.messages.length - 1];
                      const unread = chat.unreadCount?.admins || chat.unreadCount?.admin || 0;
                      const isActive = chat._id === selectedChatId;
                      const assignedAdmin = chat.assignedTo || chat.adminId;
                      const isMyChat = assignedAdmin?._id === user?._id;
                      const isUnassigned = chat.status === 'UNASSIGNED';
                      
                      return (
                        <button
                          key={chat._id}
                          onClick={() => handleSelectChat(chat._id)}
                          onContextMenu={(e) => handleContextMenu(e, chat._id)}
                          className={`w-full p-4 border-b border-gray-200 hover:bg-white transition-colors text-left relative ${
                            isActive ? 'bg-white border-l-4 border-l-purple-600' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                {(chat.userId?.username || chat.customerId?.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              {unread > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                  {unread}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {chat.userId?.username || chat.customerId?.username || 'Unknown User'}
                                </h4>
                                {lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(lastMessage.createdAt).toLocaleTimeString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                              
                              {/* Assignment Status */}
                              {isUnassigned ? (
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    <ExclamationCircleIcon className="w-3 h-3 mr-1" />
                                    Chờ xử lý
                                  </span>
                                </div>
                              ) : isMyChat ? (
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <UserIcon className="w-3 h-3 mr-1" />
                                    Đang xử lý
                                  </span>
                                </div>
                              ) : assignedAdmin ? (
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <UserIcon className="w-3 h-3 mr-1" />
                                    {assignedAdmin.username} đang xử lý
                                  </span>
                                </div>
                              ) : null}
                              
                              {lastMessage && (
                                <p className={`text-sm truncate ${
                                  unread > 0 ? 'font-bold text-gray-900' : 'text-gray-600'
                                }`}>
                                  {lastMessage.senderRole === 'admin' ? 'Bạn: ' : ''}
                                  {lastMessage.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {(selectedChat.userId?.username || selectedChat.customerId?.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {selectedChat.userId?.username || selectedChat.customerId?.username || 'Unknown User'}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {selectedChat.userId?.email || selectedChat.customerId?.email || ''}
                            </p>
                          </div>
                        </div>

                        {/* Assignment Actions */}
                        <div className="flex items-center gap-2">
                          {(() => {
                            const assignedAdmin = selectedChat.assignedTo || selectedChat.adminId;
                            const isMyChat = assignedAdmin?._id === user?._id;
                            const isUnassigned = selectedChat.status === 'UNASSIGNED';

                            if (isUnassigned) {
                              return (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                                  Chưa có admin xử lý
                                </span>
                              );
                            } else if (isMyChat) {
                              return (
                                <>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckIcon className="w-4 h-4 mr-1" />
                                    Bạn đang xử lý
                                  </span>
                                  <button
                                    onClick={() => handleUnassignChat(selectedChat._id)}
                                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                  >
                                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1" />
                                    Trả chat
                                  </button>
                                </>
                              );
                            } else if (assignedAdmin) {
                              return (
                                <>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <UserIcon className="w-4 h-4 mr-1" />
                                    {assignedAdmin.username}
                                  </span>
                                  <button
                                    onClick={() => handleTakeOverChat(selectedChat._id)}
                                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                                  >
                                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                                    Tiếp quản
                                  </button>
                                </>
                              );
                            }
                          })()}
                        </div>
                      </div>

                      {/* Assignment History Toggle */}
                      {selectedChat.assignmentHistory && selectedChat.assignmentHistory.length > 0 && (
                        <button
                          onClick={() => setShowAssignmentHistory(!showAssignmentHistory)}
                          className="mt-2 text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          <ClockIcon className="w-3 h-3" />
                          {showAssignmentHistory ? 'Ẩn' : 'Xem'} lịch sử tiếp quản ({selectedChat.assignmentHistory.length})
                          <ChevronDownIcon className={`w-3 h-3 transition-transform ${showAssignmentHistory ? 'rotate-180' : ''}`} />
                        </button>
                      )}

                      {/* Assignment History */}
                      {showAssignmentHistory && selectedChat.assignmentHistory && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2 max-h-32 overflow-y-auto">
                          {selectedChat.assignmentHistory.map((history, index) => (
                            <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                              <UserIcon className="w-3 h-3 text-gray-400" />
                              <span className="font-medium">{history.adminId?.username || 'Unknown'}</span>
                              <span>•</span>
                              <span>{new Date(history.assignedAt).toLocaleString('vi-VN')}</span>
                              {history.unassignedAt && (
                                <>
                                  <span>→</span>
                                  <span>{new Date(history.unassignedAt).toLocaleString('vi-VN')}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                      {selectedChat.messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                          <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300" />
                          <p className="text-center">Chưa có tin nhắn nào</p>
                        </div>
                      ) : (
                        <>
                          {selectedChat.messages.map((msg, index) => {
                            const isAdmin = msg.senderRole === 'admin';
                            const isFirstInGroup = index === 0 || selectedChat.messages[index - 1].senderRole !== msg.senderRole;
                            
                            return (
                              <div
                                key={msg._id}
                                className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`flex items-end space-x-2 max-w-[70%] ${isAdmin ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  {!isAdmin && isFirstInGroup && (
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                      {selectedChat.userId?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                  )}
                                  {!isAdmin && !isFirstInGroup && (
                                    <div className="w-8"></div>
                                  )}
                                  <div>
                                    <div
                                      className={`px-4 py-2 rounded-2xl ${
                                        isAdmin
                                          ? 'bg-purple-600 text-white rounded-br-sm'
                                          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                                      }`}
                                    >
                                      <p className="text-sm break-words">{msg.message}</p>
                                      <p className={`text-xs mt-1 ${isAdmin ? 'text-purple-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200">
                      {(() => {
                        const assignedAdmin = selectedChat.assignedTo || selectedChat.adminId;
                        const isMyChat = assignedAdmin?._id === user?._id;
                        const isUnassigned = selectedChat.status === 'UNASSIGNED';
                        const canSendMessage = isUnassigned || isMyChat;

                        return (
                          <>
                            {/* Warning Banner khi admin khác đang xử lý */}
                            {!canSendMessage && assignedAdmin && (
                              <div className="px-4 pt-3 pb-2">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
                                  <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-yellow-800">
                                      User đang được xử lý bởi <span className="font-bold">{assignedAdmin.username}</span>
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                      Bạn không thể nhắn tin. Vui lòng nhấn "Tiếp quản" ở trên để tiếp nhận cuộc trò chuyện này.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Input Area */}
                            <div className="p-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={message}
                                  onChange={(e) => {
                                    setMessage(e.target.value);
                                    handleTyping();
                                  }}
                                  placeholder={canSendMessage ? "Nhập tin nhắn..." : "Không thể nhắn tin - User đang được xử lý bởi admin khác"}
                                  disabled={!isConnected || !canSendMessage}
                                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500"
                                />
                                <button
                                  type="submit"
                                  disabled={!message.trim() || !isConnected || !canSendMessage}
                                  className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-300 flex-shrink-0"
                                  title={canSendMessage ? "Gửi tin nhắn" : "Không thể gửi - User đang được xử lý"}
                                >
                                  <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                    <ChatBubbleLeftRightIcon className="w-20 h-20 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
                    <p className="text-sm text-gray-400">để bắt đầu nhắn tin với khách hàng</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999
          }}
          className="bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
        >
          <button
            onClick={handleDeleteChat}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Xóa đoạn chat</span>
          </button>
        </div>
      )}
    </>
  );
};

export default AdminChatPanel;
