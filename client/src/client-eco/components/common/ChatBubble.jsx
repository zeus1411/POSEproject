import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { getUserChat, markAsRead } from '../../redux/slices/chatSlice';
import { useSocket } from '../../context/SocketContext';
import { useChatDock } from '../../context/ChatDockContext';

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const { registerPanel, unregisterPanel, getPanelLeftOffset, getBubbleBottomOffset, getPanelBottomOffset } = useChatDock();
  const { user } = useSelector((state) => state.auth);
  const { currentChat, unreadCount, isLoading } = useSelector((state) => state.chat);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const hasJoinedChatRef = useRef(null); // Track if we've already joined this chat

  // Debug: Track component lifecycle
  useEffect(() => {
    console.log('💬 ChatBubble mounted');
    return () => {
      console.log('💬 ChatBubble unmounted');
    };
  }, []);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [currentChat?.messages, isOpen]);

  // Load chat when user opens it
  useEffect(() => {
    if (isOpen && user && !currentChat) {
      dispatch(getUserChat());
    }
  }, [isOpen, user, currentChat, dispatch]);

  // Join chat room when chat is loaded
  useEffect(() => {
    if (isOpen && currentChat && socket && isConnected) {
      // Only join if we haven't joined this chat yet
      if (hasJoinedChatRef.current !== currentChat._id) {
        console.log('🔗 Joining chat room:', currentChat._id);
        socket.emit('chat:join', { chatId: currentChat._id });
        
        // Mark as read
        dispatch(markAsRead(currentChat._id));
        socket.emit('chat:mark-read', { chatId: currentChat._id });
        
        // Remember that we've joined this chat
        hasJoinedChatRef.current = currentChat._id;
      }
    }
    
    // Reset when chat is closed
    if (!isOpen) {
      hasJoinedChatRef.current = null;
    }
  }, [isOpen, currentChat?._id, socket, isConnected, dispatch]); // Only depend on chat ID, not entire object

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && socket && currentChat) {
      setIsTyping(true);
      socket.emit('chat:typing', { chatId: currentChat._id, isTyping: true });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && currentChat) {
        socket.emit('chat:typing', { chatId: currentChat._id, isTyping: false });
      }
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !socket || !currentChat) return;

    // Send via socket
    socket.emit('chat:send-message', {
      chatId: currentChat._id,
      message: message.trim()
    });

    setMessage('');
    setIsTyping(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    if (isOpen) {
      registerPanel('support');
    } else {
      unregisterPanel('support');
    }

    return () => unregisterPanel('support');
  }, [isOpen, registerPanel, unregisterPanel]);

  // Don't show if user is not logged in
  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={toggleChat}
        style={{
          left: '1.5rem',
          bottom: `${getBubbleBottomOffset('support')}rem`
        }}
        className={`fixed z-50 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'ring-4 ring-blue-200' : ''
        }`}
      >
        <ChatBubbleLeftRightIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {!isConnected && (
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></span>
        )}
        {isConnected && (
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 w-96 bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[600px]'
          }`}
          style={{
            left: `${getPanelLeftOffset('support')}rem`,
            bottom: `${getPanelBottomOffset()}rem`
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                </div>
                {isConnected && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                )}
                {!isConnected && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-400 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">Hỗ trợ khách hàng</h3>
                <p className="text-xs text-blue-100">
                  {isConnected ? '✅ Đã kết nối' : '❌ Không kết nối'}
                  {currentChat ? ' | Chat: ✅' : ' | Chat: ❌'}
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

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : !currentChat ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Đang tải chat...</p>
                  </div>
                ) : currentChat.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300" />
                    <p className="text-center">
                      Xin chào! Chúng tôi có thể giúp gì cho bạn?
                    </p>
                  </div>
                ) : (
                  <>
                    {currentChat.messages.map((msg, index) => {
                      const isUser = msg.senderRole === 'user';
                      const isFirstInGroup = index === 0 || currentChat.messages[index - 1].senderRole !== msg.senderRole;
                      
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {!isUser && isFirstInGroup && (
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                A
                              </div>
                            )}
                            {!isUser && !isFirstInGroup && (
                              <div className="w-8"></div>
                            )}
                            <div>
                              {isFirstInGroup && !isUser && (
                                <p className="text-xs text-gray-500 mb-1 ml-2">
                                  {msg.senderId?.username || 'Admin'}
                                </p>
                              )}
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isUser
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                                }`}
                              >
                                <p className="text-sm break-words">{msg.message}</p>
                                <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
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

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
                {(!isConnected || !currentChat) && (
                  <div className="mb-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    {!isConnected && '⚠️ Đang kết nối lại...'}
                    {isConnected && !currentChat && '⏳ Đang tải chat...'}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder={!isConnected ? "Đang kết nối..." : !currentChat ? "Đang tải chat..." : "Nhập tin nhắn..."}
                    disabled={!isConnected || !currentChat}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || !isConnected || !currentChat}
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBubble;
