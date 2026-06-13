import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowPathIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import {
  getAiChatSession,
  mergeGuestChatSession,
  streamAiChat
} from '../../services/aiService';

const ANON_STORAGE_KEY = 'ai_anon_id';
const CONVERSATION_STORAGE_KEY = 'ai_current_conversation_id';
const GUEST_QUESTION_LIMIT = 4;
const MAX_LINKABLE_PRODUCTS = 10;
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

const EXAMPLES = [
  'Tôi cần mua bình CO2, cửa hàng có sản phẩm nào phù hợp không?',
  'Cho tôi xem 4 sản phẩm về tép còn hàng.',
  'Có mã giảm giá nào có thể dùng khi thanh toán không?',
  'Sản phẩm nào giá dưới 200.000 và còn hàng?',
  'Tôi cần mua cây Bucep Phantom, shop có sản phẩm này không?'
];

const cleanCustomerAiText = (value = '') => {
  return String(value)
    .replace(/\s*\[S\d+\]/g, '')
    .replace(/^\s*[*-]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const renderFormattedText = (value = '') => {
  const cleaned = cleanCustomerAiText(value);
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
};

const formatVnd = (value) => {
  const number = Number(value) || 0;
  if (!number) return 'Liên hệ';
  return `${new Intl.NumberFormat('vi-VN').format(number)}đ`;
};

const formatProductPrice = (source) => {
  const min = Number(source?.minPrice || source?.price || 0);
  const max = Number(source?.maxPrice || source?.price || 0);
  if (!min && !max) return 'Liên hệ';
  if (min && max && min !== max) {
    return `${formatVnd(min)} - ${formatVnd(max)}`;
  }
  return formatVnd(min || max);
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
    .slice(0, MAX_LINKABLE_PRODUCTS);
};

const escapeRegExp = (value = '') => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const renderInlineProductText = (value = '', sources = []) => {
  const cleaned = cleanCustomerAiText(value);
  const products = getProductSuggestions(sources)
    .sort((a, b) => b.title.length - a.title.length);
  const boldParts = cleaned.split(/(\*\*[^*]+\*\*)/g);

  const renderLinkedParts = (text, isStrong = false) => {
    if (!products.length || !text) {
      return isStrong ? <strong className="font-semibold text-slate-950">{text}</strong> : text;
    }

    const productMap = new Map(products.map((product) => [product.title, product]));
    const pattern = new RegExp(`(${products.map((product) => escapeRegExp(product.title)).join('|')})`, 'g');

    return String(text).split(pattern).map((part, index) => {
      const product = productMap.get(part);
      if (!product) {
        return isStrong
          ? <strong key={`${part}-${index}`} className="font-semibold text-slate-950">{part}</strong>
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

  return boldParts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <React.Fragment key={`${part}-${index}`}>
          {renderLinkedParts(part.slice(2, -2), true)}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment key={`${part}-${index}`}>
        {renderLinkedParts(part)}
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

const AiAssistant = () => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [anonymousId, setAnonymousId] = useState(getStoredAnonymousId());
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [streamStatus, setStreamStatus] = useState('');
  const [loginRequired, setLoginRequired] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const previousUserRef = useRef(user);

  const examples = useMemo(() => EXAMPLES, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

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

  const resetConversation = () => {
    setMessages([]);
    setConversationId(null);
    setStreamError('');
    setStreamStatus('');
    setLoginRequired(false);
    window.localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    if (!user) {
      window.localStorage.removeItem(ANON_STORAGE_KEY);
      setAnonymousId(null);
    }
  };

  const updateMessage = (id, updater) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updater(msg) } : msg))
    );
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
      mode: 'auto',
      sources: [],
      retrievalStrategy: '',
      sourceSummary: ''
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
            sources: meta?.sources || [],
            retrievalStrategy: meta?.retrievalStrategy || '',
            sourceSummary: meta?.sourceSummary || ''
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
            sources: done?.sources || [],
            retrievalStrategy: done?.retrievalStrategy || '',
            sourceSummary: done?.sourceSummary || ''
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

  const handleExampleClick = (example) => {
    setInput(example);
    inputRef.current?.focus();
  };

  const canSend = Boolean(input.trim()) && !isStreaming;

  return (
    <div className="ai-assistant min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">AI Workspace</p>
            <h1 className="ai-title text-4xl md:text-5xl font-semibold mt-3">
              Trợ lý ảo thông minh
            </h1>
            <p className="text-slate-600 mt-4 max-w-2xl">
              Dat cau hoi, he thong tu dong chon nguon phu hop de tra loi.
              Ket qua se kem nguon tham khao de ban kiem chung. Ho tro chat an danh (gioi han 4 cau hoi).
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <section className="ai-card flex flex-col min-h-[620px]">
            <div className="border-b border-slate-200/70 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Hoi dap truc tiep</p>
                <p className="text-xs text-slate-500">
                  Che do: <span className="font-semibold">tu dong</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetConversation}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-slate-400"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Cuoc tro chuyen moi
                </button>
                {streamError && (
                  <span className="text-xs text-rose-600 font-semibold">
                    {streamError}
                    {loginRequired && (
                      <Link to="/login" className="ml-2 underline">
                        Dang nhap
                      </Link>
                    )}
                  </span>
                )}
                {!streamError && streamStatus && (
                  <span className="text-xs text-slate-500 font-semibold">{streamStatus}</span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 ai-scroll">
              {messages.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-slate-500 text-sm">
                  Chua co tin nhan nao. Chon mot goi y o ben phai de bat dau.
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  <div
                    className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-br-md'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {msg.content
                        ? renderInlineProductText(msg.content, msg.sources)
                        : (msg.role === 'assistant' && isStreaming ? '...' : '')}
                    </p>
                  </div>
                  {false && msg.role === 'assistant' && getProductSuggestions(msg.sources).length > 0 && (
                    <div className="hidden">
                      <p className="mb-2 text-xs text-slate-500">
                        Bạn có thể chọn vào tên sản phẩm để xem chi tiết sản phẩm.
                      </p>
                      <div className="grid gap-2">
                        {getProductSuggestions(msg.sources).map((source) => (
                          <div
                            key={source.itemId}
                            className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50/70 px-3 py-2"
                          >
                            <Link
                              to={source.uri || `/product/${source.itemId}`}
                              className="text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                            >
                              {source.title}
                            </Link>
                            <span className="whitespace-nowrap text-xs font-semibold text-slate-700">
                              {formatProductPrice(source)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-slate-200/70 px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={2}
                  placeholder={
                    isStreaming
                      ? 'Dang nhan phan hoi...'
                      : 'Nhap cau hoi va nhan Enter'
                  }
                  className="flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  disabled={isStreaming}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSend(event);
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!canSend}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Gui
                  </button>
                  {isStreaming && (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="inline-flex items-center gap-2 px-3 py-3 rounded-full border border-slate-200 text-slate-600 text-sm"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Dung
                    </button>
                  )}
                </div>
              </div>
            </form>
          </section>

          <aside className="flex flex-col gap-5">
            <div className="ai-card p-5">
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <LightBulbIcon className="w-4 h-4" />
                Goi y nhanh
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="text-left text-sm text-slate-600 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-400 hover:text-slate-900"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="ai-card p-5">
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                Luu y
              </p>
              <ul className="mt-3 text-xs text-slate-500 space-y-2">
                <li>Tra loi dua tren nguon da duoc truy xuat.</li>
                <li>Neu thieu nguon, tro ly se thong bao chua du du lieu.</li>
                <li>Catalog QA chi dung du lieu san pham hien tai.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
