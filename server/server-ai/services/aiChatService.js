import crypto from 'crypto';
import AiConversation from '../models/AiConversation.js';
import {
  BadRequestError,
  UnauthorizedError,
  UnauthenticatedError
} from '../../utils/errorHandler.js';
import { normalizeMode, ensureModeSupported, routeAiQuery } from '../orchestrators/aiOrchestrator.js';

const ANON_QUESTION_LIMIT = Number(process.env.AI_ANON_QUESTION_LIMIT || 4);

const createAnonymousId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString('hex');
};

const countUserMessages = (messages = []) => {
  return messages.filter((msg) => msg.role === 'user').length;
};

const getRecentChatHistory = (messages = [], limit = 6) => {
  return messages
    .slice(-limit)
    .map((message) => ({
      role: message.role,
      content: message.content,
      mode: message.mode,
      sources: message.sources || []
    }));
};

const getPreferredSources = (messages = []) => {
  const lastAssistantWithSources = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.sources?.length);

  return lastAssistantWithSources?.sources || [];
};

const serializeMessage = (message) => ({
  id: message._id?.toString(),
  role: message.role,
  content: message.content,
  mode: message.mode,
  retrievalStrategy: message.retrievalStrategy || '',
  sourceSummary: message.sourceSummary || '',
  sources: message.sources || [],
  createdAt: message.createdAt,
  updatedAt: message.updatedAt
});

const serializeConversation = (conversation, anonymousId = null) => {
  if (!conversation) {
    return null;
  }

  return {
    conversationId: conversation._id.toString(),
    userId: conversation.userId?.toString() || null,
    anonymousId: conversation.anonymousId || anonymousId || null,
    status: conversation.status,
    mode: conversation.mode,
    messages: (conversation.messages || []).map(serializeMessage),
    metadata: conversation.metadata || {},
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
};

const assertConversationAccess = ({ conversation, userId, anonymousId }) => {
  if (conversation.userId) {
    if (!userId || conversation.userId.toString() !== userId) {
      throw new UnauthorizedError('Conversation does not belong to user');
    }
    return;
  }

  if (conversation.anonymousId) {
    if (!anonymousId || conversation.anonymousId !== anonymousId) {
      throw new UnauthorizedError('Conversation does not belong to anonymous user');
    }
  }
};

const getCurrentConversation = async ({ conversationId, userId, anonymousId }) => {
  let conversation = null;

  if (conversationId) {
    conversation = await AiConversation.findById(conversationId);
    if (!conversation) {
      throw new BadRequestError('Conversation not found');
    }
    assertConversationAccess({ conversation, userId, anonymousId });
    return serializeConversation(conversation, anonymousId);
  }

  if (userId) {
    conversation = await AiConversation.findOne({
      userId,
      status: 'ACTIVE'
    }).sort({ lastMessageAt: -1, updatedAt: -1 });
    return serializeConversation(conversation);
  }

  if (anonymousId) {
    conversation = await AiConversation.findOne({
      anonymousId,
      userId: null,
      status: 'ACTIVE'
    }).sort({ lastMessageAt: -1, updatedAt: -1 });
    return serializeConversation(conversation, anonymousId);
  }

  return null;
};

const mergeGuestSession = async ({ guestSessionId, userId, conversationId }) => {
  if (!userId) {
    throw new UnauthenticatedError('Please login to continue chatting.');
  }

  if (!guestSessionId) {
    throw new BadRequestError('guestSessionId is required');
  }

  const query = {
    anonymousId: guestSessionId,
    status: 'ACTIVE'
  };

  if (conversationId) {
    query._id = conversationId;
  }

  let conversation = await AiConversation.findOne(query).sort({ lastMessageAt: -1, updatedAt: -1 });

  if (!conversation) {
    conversation = await AiConversation.findOne({
      userId,
      status: 'ACTIVE'
    }).sort({ lastMessageAt: -1, updatedAt: -1 });
    return serializeConversation(conversation);
  }

  if (conversation.userId && conversation.userId.toString() !== userId) {
    throw new UnauthorizedError('Conversation already belongs to another user');
  }

  conversation.userId = userId;
  conversation.anonymousId = null;
  await conversation.save();

  return serializeConversation(conversation);
};

const getOrCreateConversation = async ({ conversationId, userId, anonymousId, mode, message }) => {
  const normalizedMode = normalizeMode(mode, message);
  ensureModeSupported(normalizedMode);

  if (conversationId) {
    const existing = await AiConversation.findById(conversationId);
    if (!existing) {
      throw new BadRequestError('Conversation not found');
    }

    if (existing.userId) {
      if (!userId || existing.userId.toString() !== userId) {
        throw new UnauthorizedError('Conversation does not belong to user');
      }
    }

    if (!existing.userId && existing.anonymousId) {
      if (!anonymousId || existing.anonymousId !== anonymousId) {
        throw new UnauthorizedError('Conversation does not belong to anonymous user');
      }
    }

    if (userId && !existing.userId) {
      existing.userId = userId;
      existing.anonymousId = null;
      await existing.save();
    }

    return { conversation: existing, anonymousId: existing.anonymousId || anonymousId };
  }

  let finalAnonymousId = anonymousId;
  if (!userId && !finalAnonymousId) {
    finalAnonymousId = createAnonymousId();
  }

  const existing = !userId
    ? await AiConversation.findOne({
        anonymousId: finalAnonymousId,
        userId: null,
        status: 'ACTIVE'
      }).sort({ lastMessageAt: -1, updatedAt: -1 })
    : null;

  if (existing) {
    return { conversation: existing, anonymousId: existing.anonymousId || finalAnonymousId };
  }

  const conversation = await AiConversation.create({
    userId: userId || null,
    anonymousId: userId ? null : finalAnonymousId,
    mode: normalizedMode,
    metadata: {
      lastMode: normalizedMode,
      lastRetrievalStrategy: '',
      lastSourceSummary: ''
    }
  });

  return { conversation, anonymousId: finalAnonymousId };
};

const enforceAnonymousLimit = (conversation) => {
  const userMessageCount = countUserMessages(conversation.messages);
  if (userMessageCount >= ANON_QUESTION_LIMIT) {
    throw new UnauthenticatedError('Please login to continue chatting.');
  }
};

const handleAiChat = async ({
  conversationId,
  message,
  mode,
  userId,
  anonymousId,
  documentScope,
  onStart,
  onMeta,
  onStatus,
  onToken
}) => {
  if (!message || !String(message).trim()) {
    throw new BadRequestError('Message is required');
  }

  const normalizedMode = normalizeMode(mode, message);
  ensureModeSupported(normalizedMode);

  const { conversation, anonymousId: resolvedAnonymousId } = await getOrCreateConversation({
    conversationId,
    userId,
    anonymousId,
    mode: normalizedMode,
    message
  });

  if (!userId) {
    enforceAnonymousLimit(conversation);
  }

  const chatHistory = getRecentChatHistory(conversation.messages);
  const preferredSources = getPreferredSources(conversation.messages);

  conversation.addMessage({
    role: 'user',
    content: String(message).trim(),
    mode: normalizedMode,
    retrievalStrategy: '',
    sourceSummary: ''
  });

  const result = await routeAiQuery({
    mode: normalizedMode,
    message: String(message).trim(),
    conversationId: conversation._id.toString(),
    chatHistory,
    preferredSources,
    documentScope,
    onStart,
    onMeta,
    onStatus,
    onToken
  });

  conversation.addMessage({
    role: 'assistant',
    content: result.answer,
    mode: normalizedMode,
    retrievalStrategy: result.retrievalStrategy,
    sourceSummary: result.sourceSummary,
    sources: result.sources
  });

  await conversation.save();

  return {
    conversationId: conversation._id.toString(),
    anonymousId: resolvedAnonymousId || null,
    mode: normalizedMode,
    answer: result.answer,
    retrievalStrategy: result.retrievalStrategy,
    sourceSummary: result.sourceSummary,
    sources: result.sources,
    intent: result.intent || null
  };
};

export { handleAiChat, getCurrentConversation, mergeGuestSession };
