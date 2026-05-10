import { StatusCodes } from 'http-status-codes';
import { handleAiChat } from '../services/aiChatService.js';

const writeSseEvent = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const extractAnonymousId = (req) => {
  return (
    req.headers['x-anonymous-id'] ||
    req.body?.anonymousId ||
    null
  );
};

export const streamAiChat = async (req, res, next) => {
  try {
    const { conversationId, message, mode } = req.body || {};
    const userId = req.user?.userId || null;
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
    };

    const onMeta = (meta) => {
      metaSent = true;
      startSse();
      writeSseEvent(res, 'meta', meta);
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
      onStart: startSse,
      onMeta,
      onToken
    });

    if (!metaSent) {
      startSse();
      writeSseEvent(res, 'meta', {
        conversationId: result.conversationId,
        anonymousId: result.anonymousId,
        mode: result.mode,
        retrievalStrategy: result.retrievalStrategy,
        sourceSummary: result.sourceSummary
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
      retrievalStrategy: result.retrievalStrategy,
      sourceSummary: result.sourceSummary,
      sources: result.sources
    });

    res.end();
  } catch (error) {
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
    const { conversationId, message, mode } = req.body || {};
    const userId = req.user?.userId || null;
    const anonymousId = extractAnonymousId(req);

    const result = await handleAiChat({
      conversationId,
      message,
      mode,
      userId,
      anonymousId
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
