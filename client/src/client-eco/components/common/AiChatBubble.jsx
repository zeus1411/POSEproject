import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  getAiChatSession,
  mergeGuestChatSession,
  streamAiChat
} from '../../services/aiService';
import { useChatDock } from '../../context/ChatDockContext';

const ANON_STORAGE_KEY = 'ai_anon_id';
const CONVERSATION_STORAGE_KEY = 'ai_current_conversation_id';
const GUEST_QUESTION_LIMIT = 4;
const LOGIN_REQUIRED_MESSAGE = 'Bạn đã hết lượt nhắn miễn phí với chatbot. Vui lòng đăng nhập để tiếp tục cuộc hội thoại này.';

const getStoredAnonymousId = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ANON_STORAGE_KEY);
};

const getOrCreateAnonymousId = () => {
  if (typeof window === 'undefined') return null;
  const existing = getStoredAnonymousId();
  if (existing) return existing;

  const randomId = (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID())
    || `anon_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

  window.localStorage.setItem(ANON_STORAGE_KEY, randomId);
  return randomId;
};

const SUGGESTIONS = [
  'Sản phẩm nào đang có giảm giá hôm nay?',
  'Khuyến mãi coupon áp dụng gồm những gì?',
  'Tóm tắt 3 điểm chính trong tài liệu vừa upload.',
  'Sản phẩm nào giá dưới 200.000 và còn hàng?',
  'Cho mình biết quy trình bảo hành trong tài liệu.'
];

const cleanCustomerAiText = (value = '') => {
  return String(value)
    .replace(/\s*\[S\d+\]/g, '')
    .replace(/^\s*[*-]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const escapeRegExp = (value = '') => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getProductSuggestions = (sources = []) => {
  const seen = new Set();
  return sources
    .filter((source) => source?.itemType === 'product' && source?.itemId && source?.title)
    .filter((source) => {
      if (seen.has(source.itemId)) return false;
      seen.add(source.itemId);
      return true;
    })
    .slice(0, 8);
};

const renderProductLinkedText = (value, products, isStrong = false) => {
  if (!products.length || !value) {
    return isStrong ? <strong className="font-semibold text-gray-900">{value}</strong> : value;
  }

  const productMap = new Map(products.map((product) => [product.title, product]));
  const pattern = new RegExp(`(${products.map((product) => escapeRegExp(product.title)).join('|')})`, 'g');

  return String(value).split(pattern).map((part, index) => {
    const product = productMap.get(part);
    if (!product) {
      return isStrong
        ? <strong key={`${part}-${index}`} className="font-semibold text-gray-900">{part}</strong>
        : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
    }

    return (
      <Link
        key={`${product.itemId}-${index}`}
        to={product.uri || `/product/${product.itemId}`}
        className="font-semibold text-teal-700 hover:text-teal-900 hover:underline"
      >
        {part}
      </Link>
    );
  });
};

const renderFormattedText = (value = '', sources = []) => {
  const cleaned = cleanCustomerAiText(value);
  const products = getProductSuggestions(sources)
    .sort((a, b) => b.title.length - a.title.length);
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <React.Fragment key={`${part}-${index}`}>
          {renderProductLinkedText(part.slice(2, -2), products, true)}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment key={`${part}-${index}`}>
        {renderProductLinkedText(part, products)}
      </React.Fragment>
    );
  });
};

const mapConversationMessages = (conversation) => {
  return (conversation?.messages || []).map((message, index) => ({
    id: message.id || `${message.role}_${index}_${message.createdAt || Date.now()}`,
    role: message.role,
    content: message.content,
    mode: message.mode,
    sources: message.sources || [],
    retrievalStrategy: message.retrievalStrategy || '',
    sourceSummary: message.sourceSummary || ''
  }));
};

const countUserMessages = (items = []) => items.filter((message) => message.role === 'user').length;

const AiChatBubble = () => {
  const { user } = useSelector((state) => state.auth);
  const { registerPanel, unregisterPanel, getPanelLeftOffset, getBubbleBottomOffset, getPanelBottomOffset } = useChatDock();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [anonymousId, setAnonymousId] = useState(getStoredAnonymousId());
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState('');
  const [streamError, setStreamError] = useState('');
  const [loginRequired, setLoginRequired] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const previousUserRef = useRef(user);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isStreaming]);

  useEffect(() => {
    if (isOpen) {
      const used = window.sessionStorage.getItem('ai_chat_suggestions_used');
      if (!used) {
        const shuffled = [...SUGGESTIONS].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 4));
        setShowSuggestions(true);
      }
      registerPanel('ai');
    } else {
      unregisterPanel('ai');
    }

    return () => unregisterPanel('ai');
  }, [isOpen, registerPanel, unregisterPanel]);

  useEffect(() => {
    let cancelled = false;

    const clearCurrentConversation = ({ clearGuestSession = false } = {}) => {
      setMessages([]);
      setConversationId(null);
      setStreamError('');
      setStreamStatus('');
      setLoginRequired(false);
      window.localStorage.removeItem(CONVERSATION_STORAGE_KEY);
      if (clearGuestSession) {
        window.localStorage.removeItem(ANON_STORAGE_KEY);
        setAnonymousId(null);
      }
    };

    const loadConversation = async () => {
      const previousUser = previousUserRef.current;
      const didLogout = previousUser && !user;
      previousUserRef.current = user;

      if (didLogout) {
        clearCurrentConversation({ clearGuestSession: true });
        return;
      }

      const storedAnonymousId = getStoredAnonymousId();
      const storedConversationId = window.localStorage.getItem(CONVERSATION_STORAGE_KEY);
      let conversation = null;

      if (!user && !storedAnonymousId) {
        clearCurrentConversation();
        return;
      }

      try {
        if (user && storedAnonymousId) {
          try {
            conversation = await mergeGuestChatSession({
              guestSessionId: storedAnonymousId,
              conversationId: storedConversationId
            });
          } catch (error) {
            if (!storedConversationId) throw error;
            window.localStorage.removeItem(CONVERSATION_STORAGE_KEY);
            conversation = await mergeGuestChatSession({
              guestSessionId: storedAnonymousId
            });
          }
          window.localStorage.removeItem(ANON_STORAGE_KEY);
          setAnonymousId(null);
        }

        if (!conversation) {
          try {
            conversation = await getAiChatSession({
              guestSessionId: user ? null : storedAnonymousId,
              conversationId: user ? storedConversationId : null
            });
          } catch (error) {
            if (!storedConversationId) throw error;
            window.localStorage.removeItem(CONVERSATION_STORAGE_KEY);
            conversation = await getAiChatSession({
              guestSessionId: user ? null : storedAnonymousId
            });
          }
        }

        if (cancelled || !conversation) return;

        setConversationId(conversation.conversationId);
        window.localStorage.setItem(CONVERSATION_STORAGE_KEY, conversation.conversationId);
        if (!user && conversation.anonymousId) {
          setAnonymousId(conversation.anonymousId);
          window.localStorage.setItem(ANON_STORAGE_KEY, conversation.anonymousId);
        }
        setMessages(mapConversationMessages(conversation));
        setLoginRequired(false);
        setStreamError('');
      } catch (error) {
        if (!cancelled) {
          setStreamError(error?.message || 'Khong the tai lich su chat.');
        }
      }
    };

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const updateMessage = (id, updater) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updater(msg) } : msg))
    );
  };

  const markSuggestionsUsed = () => {
    setShowSuggestions(false);
    window.sessionStorage.setItem('ai_chat_suggestions_used', '1');
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    if (!user && countUserMessages(messages) >= GUEST_QUESTION_LIMIT) {
      setLoginRequired(true);
      setStreamError(LOGIN_REQUIRED_MESSAGE);
      return;
    }

    setStreamError('');
    setLoginRequired(false);
    setStreamStatus('');
    if (showSuggestions) {
      markSuggestionsUsed();
    }

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: trimmed
    };

    const assistantId = `assistant_${Date.now()}`;
    const assistantMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      sources: []
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsStreaming(true);

    const guestSessionId = user ? null : getOrCreateAnonymousId();
    if (!user) {
      setAnonymousId(guestSessionId);
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamAiChat({
        payload: user
          ? {
              conversationId,
              message: trimmed,
              mode: 'auto'
            }
          : {
              message: trimmed,
              mode: 'auto',
              guestSessionId
            },
        guestSessionId: user ? null : guestSessionId,
        signal: controller.signal,
        onMeta: (meta) => {
          if (meta?.conversationId) {
            setConversationId(meta.conversationId);
            window.localStorage.setItem(CONVERSATION_STORAGE_KEY, meta.conversationId);
          }

          if (!user && meta?.anonymousId) {
            setAnonymousId(meta.anonymousId);
            window.localStorage.setItem(ANON_STORAGE_KEY, meta.anonymousId);
          }

          updateMessage(assistantId, () => ({
            sources: meta?.sources || []
          }));
        },
        onStatus: (status) => {
          setStreamStatus(status?.stage || '');
        },
        onToken: (delta) => {
          if (!delta) return;
          updateMessage(assistantId, (msg) => ({
            content: `${msg.content}${delta}`
          }));
        },
        onDone: (done) => {
          if (done?.conversationId) {
            setConversationId(done.conversationId);
            window.localStorage.setItem(CONVERSATION_STORAGE_KEY, done.conversationId);
          }

          updateMessage(assistantId, (msg) => ({
            content: done?.message || msg.content,
            sources: done?.sources || msg.sources
          }));
        },
        onError: (error) => {
          setStreamError(error?.message || 'Chat failed.');
        }
      });
    } catch (error) {
      if (error?.name !== 'AbortError') {
        const message = error?.message || 'Chat failed.';
        if (!user && /login|dang nhap|đăng nhập/i.test(message)) {
          setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id && msg.id !== assistantId));
          setLoginRequired(true);
          setStreamError(LOGIN_REQUIRED_MESSAGE);
          return;
        }
        setStreamError(message);
      }
    } finally {
      setIsStreaming(false);
      setStreamStatus('');
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (user?.role === 'admin') {
    return null;
  }

  return (
    <>
      <button
        onClick={toggleChat}
        style={{
          left: '1.5rem',
          bottom: `${getBubbleBottomOffset('ai')}rem`
        }}
        className={`fixed z-50 w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'ring-4 ring-emerald-200' : ''
        }`}
      >
        <SparklesIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div
          className={`fixed z-50 w-96 bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[600px]'
          }`}
          style={{
            left: `${getPanelLeftOffset('ai')}rem`,
            bottom: `${getPanelBottomOffset()}rem`
          }}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Trợ lý AI</h3>
                <p className="text-xs text-emerald-100">
                  {isStreaming ? (streamStatus || 'Đang trả lời...') : 'Sẵn sàng hỗ trợ'}
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

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {showSuggestions && messages.length === 0 && (
                  <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Gợi Ý Nhanh</p>
                    <div className="flex flex-col gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setInput(suggestion);
                            markSuggestionsUsed();
                          }}
                          className="text-left text-sm text-gray-600 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-400 hover:text-gray-900"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                    <SparklesIcon className="w-16 h-16 text-gray-300" />
                    <p className="text-center">
                      Xin chào! Hãy hỏi bất kỳ thông tin nào về tài liệu hoặc sản phẩm.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isUser = msg.role === 'user';
                      const isFirstInGroup =
                        index === 0 || messages[index - 1].role !== msg.role;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`flex items-end space-x-2 max-w-[80%] ${
                              isUser ? 'flex-row-reverse space-x-reverse' : ''
                            }`}
                          >
                            {!isUser && isFirstInGroup && (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                AI
                              </div>
                            )}
                            {!isUser && !isFirstInGroup && (
                              <div className="w-8"></div>
                            )}
                            <div className="space-y-2">
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isUser
                                  ? 'bg-emerald-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                                }`}
                              >
                                <p className="text-sm break-words whitespace-pre-wrap">
                                  {msg.content
                                    ? renderFormattedText(msg.content, msg.sources)
                                    : (isStreaming && !isUser ? '...' : '')}
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

              <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
                {streamError && (
                  <div className="mb-2 text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                    <span>{streamError}</span>
                    {loginRequired && (
                      <Link to="/login" className="ml-2 font-semibold underline">
                        Dang nhap
                      </Link>
                    )}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isStreaming ? 'Đang trả lời...' : 'Nhập câu hỏi...'}
                    disabled={isStreaming}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                  {isStreaming && (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="bg-white border border-gray-200 text-gray-500 p-3 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AiChatBubble;
