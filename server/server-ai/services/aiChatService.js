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

const getOrCreateConversation = async ({ conversationId, userId, anonymousId, mode }) => {
  const normalizedMode = normalizeMode(mode);
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
  onStart,
  onMeta,
  onToken
}) => {
  if (!message || !String(message).trim()) {
    throw new BadRequestError('Message is required');
  }

  const normalizedMode = normalizeMode(mode);
  ensureModeSupported(normalizedMode);

  const { conversation, anonymousId: resolvedAnonymousId } = await getOrCreateConversation({
    conversationId,
    userId,
    anonymousId,
    mode: normalizedMode
  });

  if (!userId) {
    enforceAnonymousLimit(conversation);
  }

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
    onStart,
    onMeta,
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
    sources: result.sources
  };
};

export { handleAiChat };
