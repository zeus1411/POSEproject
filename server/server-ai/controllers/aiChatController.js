import { StatusCodes } from 'http-status-codes';
import {
  getCurrentConversation,
  handleAiChat,
  mergeGuestSession
} from '../services/aiChatService.js';

const writeSseEvent = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const extractAnonymousId = (req) => {
  return (
    req.headers['x-guest-session-id'] ||
    req.headers['x-anonymous-id'] ||
    req.body?.guestSessionId ||
    req.body?.anonymousId ||
    null
  );
};

export const streamAiChat = async (req, res, next) => {
  let heartbeatTimer = null;
  try {
    const { conversationId: requestedConversationId, message, mode, documentScope } = req.body || {};
    const userId = req.user?.userId || null;
    const conversationId = userId ? requestedConversationId : null;
    const anonymousId = extractAnonymousId(req);
    let sseStarted = false;
    let metaSent = false;
    let tokenSent = false;

    const startSse = () => {
      if (sseStarted) return;
      sseStarted = true;
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      if (res.flushHeaders) {
        res.flushHeaders();
      }

      heartbeatTimer = setInterval(() => {
        writeSseEvent(res, 'heartbeat', { ts: Date.now() });
      }, 15000);
    };

    const onMeta = (meta) => {
      metaSent = true;
      startSse();
      writeSseEvent(res, 'meta', meta);
    };

    const onStatus = (status) => {
      startSse();
      writeSseEvent(res, 'status', status);
    };

    const onToken = (delta) => {
      if (!delta) return;
      tokenSent = true;
      startSse();
      writeSseEvent(res, 'message', { delta });
    };

    const result = await handleAiChat({
      conversationId,
      message,
      mode,
      userId,
      anonymousId,
      documentScope,
      onStart: startSse,
      onMeta,
      onStatus,
      onToken
    });

    if (!metaSent) {
      startSse();
      writeSseEvent(res, 'meta', {
        conversationId: result.conversationId,
        anonymousId: result.anonymousId,
        mode: result.mode,
        intent: result.intent,
        retrievalStrategy: result.retrievalStrategy,
        sourceSummary: result.sourceSummary,
        sources: result.sources
      });
    }

    if (!tokenSent) {
      startSse();
      writeSseEvent(res, 'message', { delta: result.answer });
    }

    startSse();
    writeSseEvent(res, 'done', {
      message: result.answer,
      conversationId: result.conversationId,
      anonymousId: result.anonymousId,
      mode: result.mode,
      intent: result.intent,
      retrievalStrategy: result.retrievalStrategy,
      sourceSummary: result.sourceSummary,
      sources: result.sources
    });

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    res.end();
  } catch (error) {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }

    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    if (!res.headersSent) {
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Chat failed'
      });
    }

    writeSseEvent(res, 'error', {
      message: error.message || 'Chat failed',
      statusCode
    });
    res.end();
  }
};

export const chatOnce = async (req, res, next) => {
  try {
    const { conversationId: requestedConversationId, message, mode, documentScope } = req.body || {};
    const userId = req.user?.userId || null;
    const conversationId = userId ? requestedConversationId : null;
    const anonymousId = extractAnonymousId(req);

    const result = await handleAiChat({
      conversationId,
      message,
      mode,
      userId,
      anonymousId,
      documentScope
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getChatSession = async (req, res, next) => {
  try {
    const userId = req.user?.userId || null;
    const anonymousId = extractAnonymousId(req);
    const conversationId = userId ? (req.query?.conversationId || null) : null;

    const conversation = await getCurrentConversation({
      conversationId,
      userId,
      anonymousId
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const mergeGuestChatSession = async (req, res, next) => {
  try {
    const userId = req.user?.userId || null;
    const { guestSessionId, conversationId } = req.body || {};

    const conversation = await mergeGuestSession({
      guestSessionId,
      userId,
      conversationId
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};
