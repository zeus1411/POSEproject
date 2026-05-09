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
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (res.flushHeaders) {
      res.flushHeaders();
    }

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

    writeSseEvent(res, 'meta', {
      conversationId: result.conversationId,
      anonymousId: result.anonymousId,
      mode: result.mode,
      retrievalStrategy: result.retrievalStrategy,
      sourceSummary: result.sourceSummary
    });

    writeSseEvent(res, 'message', {
      delta: result.answer
    });

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
    if (!res.headersSent) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Chat failed'
      });
    }

    writeSseEvent(res, 'error', {
      message: error.message || 'Chat failed'
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
