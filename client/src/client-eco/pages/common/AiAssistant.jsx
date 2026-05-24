import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ArrowPathIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { streamAiChat } from '../../services/aiService';

const ANON_STORAGE_KEY = 'ai_anon_id';

const getOrCreateAnonymousId = () => {
  if (typeof window === 'undefined') return null;
  const existing = window.localStorage.getItem(ANON_STORAGE_KEY);
  if (existing) return existing;

  const randomId = (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID())
    || `anon_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

  window.localStorage.setItem(ANON_STORAGE_KEY, randomId);
  return randomId;
};

const EXAMPLES = [
  'Tóm tắt 3 điểm chính trong tài liệu vừa upload.',
  'Sản phẩm nào đang có giảm giá hôm nay?',
  'Khuyến mãi coupon áp dụng gồm những gì?',
  'Cho mình biết quy trình bảo hành trong tài liệu.',
  'Sản phẩm nào giá dưới 200.000 và còn hàng?'
];

const cleanCustomerAiText = (value = '') => {
  return String(value)
    .replace(/\s*\[S\d+\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const AiAssistant = () => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [anonymousId, setAnonymousId] = useState(getOrCreateAnonymousId());
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [streamStatus, setStreamStatus] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const examples = useMemo(() => EXAMPLES, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const resetConversation = () => {
    setMessages([]);
    setConversationId(null);
    setStreamError('');
    setStreamStatus('');
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

    setStreamError('');
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

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamAiChat({
        payload: {
          conversationId,
          message: trimmed,
          mode: 'auto',
          anonymousId: user ? null : anonymousId
        },
        anonymousId: user ? null : anonymousId,
        signal: controller.signal,
        onMeta: (meta) => {
          if (meta?.conversationId) {
            setConversationId(meta.conversationId);
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
        setStreamError(error?.message || 'Chat failed.');
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
              Tro ly tri thuc cho AquaticPose
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
                  <span className="text-xs text-rose-600 font-semibold">{streamError}</span>
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
                      {cleanCustomerAiText(msg.content) || (msg.role === 'assistant' && isStreaming ? '...' : '')}
                    </p>
                  </div>

                  {msg.role === 'assistant' && (msg.sources?.length || msg.sourceSummary) && (
                    <div className="mt-3 text-xs text-slate-500">
                      {msg.sourceSummary && (
                        <p className="mb-1">{msg.sourceSummary}</p>
                      )}
                      {msg.sources?.length > 0 && (
                        <div className="grid gap-2">
                          {msg.sources.map((source, index) => (
                            <div
                              key={`${msg.id}-source-${index}`}
                              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2"
                            >
                              <div>
                                <p className="font-semibold text-slate-700">
                                  {source.citationId ? `[${source.citationId}] ` : ''}
                                  {source.title || source.uri || 'Nguon'}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {source.chunkId || source.itemId || source.itemType || ''}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-600">
                                {Number.isFinite(source.score)
                                  ? `Score ${source.score.toFixed(2)}`
                                  : 'Score N/A'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
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
