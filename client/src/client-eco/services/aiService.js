import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const buildStreamUrl = () => `${API_BASE_URL.replace(/\/$/, '')}/ai/chat/stream`;

const streamAiChat = async ({
  payload,
  anonymousId,
  onMeta,
  onToken,
  onDone,
  onError,
  signal
}) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream'
  };

  if (anonymousId) {
    headers['x-anonymous-id'] = anonymousId;
  }

  const response = await fetch(buildStreamUrl(), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    credentials: 'include',
    signal
  });

  if (!response.ok) {
    let errorMessage = 'AI chat failed';
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.message || errorMessage;
    } catch (err) {
      // Ignore JSON parse errors and fall back to default message.
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error('Streaming response not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const emitEvent = (eventName, data) => {
    if (eventName === 'meta' && onMeta) {
      onMeta(data);
      return;
    }

    if (eventName === 'message' && onToken) {
      onToken(data?.delta || '');
      return;
    }

    if (eventName === 'done' && onDone) {
      onDone(data);
      return;
    }

    if (eventName === 'error' && onError) {
      onError(data);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE parsing: each event is separated by a blank line.
    while (buffer.includes('\n\n')) {
      const splitIndex = buffer.indexOf('\n\n');
      const rawEvent = buffer.slice(0, splitIndex).trim();
      buffer = buffer.slice(splitIndex + 2);

      if (!rawEvent) continue;

      let eventName = 'message';
      let dataPayload = '';

      rawEvent.split('\n').forEach((line) => {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
          return;
        }

        if (line.startsWith('data:')) {
          const chunk = line.slice(5).trim();
          dataPayload = dataPayload ? `${dataPayload}\n${chunk}` : chunk;
        }
      });

      if (!dataPayload) continue;

      try {
        const parsed = JSON.parse(dataPayload);
        emitEvent(eventName, parsed);
      } catch (err) {
        if (onError) {
          onError({ message: 'Invalid SSE payload' });
        }
      }
    }
  }
};

const uploadAiDocument = async ({ file, onProgress }) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/ai/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    }
  });

  return response.data?.data;
};

const getCatalogStatus = async () => {
  const response = await api.get('/ai/catalog/status');
  return response.data?.data;
};

const syncCatalog = async ({ reason = 'manual' } = {}) => {
  const response = await api.post('/ai/catalog/sync', { reason });
  return response.data?.data;
};

export { streamAiChat, uploadAiDocument, getCatalogStatus, syncCatalog };
