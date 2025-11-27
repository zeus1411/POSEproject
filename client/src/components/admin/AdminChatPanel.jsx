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
  TrashIcon
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

  // Listen for new messages from users not in current chat list
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

    socket.on('chat:new-message-notification', handleNewMessageNotification);

    return () => {
      socket.off('chat:new-message-notification', handleNewMessageNotification);
    };
  }, [socket, user, dispatch]);

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

    socket.emit('chat:send-message', {
      chatId: selectedChat._id,
      message: message.trim()
    });

    setMessage('');
    setIsTyping(false);
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    
    // If chat is PENDING, assign admin automatically
    const chat = chats.find(c => c._id === chatId);
    if (chat && chat.status === 'PENDING' && !chat.adminId) {
      dispatch(assignAdmin(chatId));
      if (socket) {
        socket.emit('admin:assign-chat', { chatId });
      }
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

  // Filter chats by search query
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const username = chat.userId?.username?.toLowerCase() || '';
    const email = chat.userId?.email?.toLowerCase() || '';
    return username.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  // Calculate total unread
  const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount?.admin || 0), 0);

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
                  {chats.length} cuộc trò chuyện {totalUnread > 0 && `• ${totalUnread} chưa đọc`}
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
                <div className="p-4 border-b border-gray-200">
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
                      const unread = chat.unreadCount?.admin || 0;
                      const isActive = chat._id === selectedChatId;
                      
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
                                {chat.userId?.username?.charAt(0).toUpperCase() || 'U'}
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
                                  {chat.userId?.username || 'Unknown User'}
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
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {selectedChat.userId?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {selectedChat.userId?.username || 'Unknown User'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {selectedChat.userId?.email || ''}
                          </p>
                        </div>
                      </div>
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
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                          }}
                          placeholder="Nhập tin nhắn..."
                          disabled={!isConnected}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                        />
                        <button
                          type="submit"
                          disabled={!message.trim() || !isConnected}
                          className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-300 flex-shrink-0"
                        >
                          <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                      </div>
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
