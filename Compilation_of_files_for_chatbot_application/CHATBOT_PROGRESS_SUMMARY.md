# Chatbot Progress Summary

## 1) Context va thong tin trao doi
- Muc tieu: build chatbot monolithic theo plan (Document RAG + Catalog QA) tren backend hien tai.
- Vector DB: se dung Qdrant; uu tien docker local de dev, sau do moi can nhac Qdrant Cloud.
- Lam theo phase, bat dau Phase 1.
- Backend stack: Node/Express trong server hien tai.
- Model chat: tao model moi cho AI chat (khong tai su dung support chat hien co).
- Auth: ho tro anonymous + bat buoc dang nhap; anonymous gioi han 3-4 cau (da set default 4).
- Streaming: su dung SSE (text/event-stream).
- Provider LLM: ban se dung Gemini (tra phi); se tiep tuc khi co API key.

## 2) Hang muc da thuc hien (Phase 1)
### 2.1 Tao module AI chat (server-ai)
- Tao model `AiConversation` luu message + metadata mode/retrieval/source.
- Tao `aiOrchestrator` de route theo mode (document_rag / catalog_qa).
- Tao `aiChatService` de tao conversation, luu message, kiem tra limit anonymous.
- Tao controller SSE + JSON cho endpoint chat.
- Tao routes cho AI.

### 2.2 Optional auth middleware
- Them `optionalAuthenticateUser` de ho tro anonymous (neu co token thi attach user).

### 2.3 Mount routes
- Mount AI routes vao router chinh.

### 2.4 Contract va streaming (Phase 1 stub)
- Endpoint SSE: `POST /api/v1/ai/chat/stream`
- Endpoint JSON: `POST /api/v1/ai/chat`
- Payload: `conversationId`, `mode`, `message`, `anonymousId` (optional)
- SSE events: `meta`, `message`, `done`
- Phase 1 hien tai chi tra ve stub (router active), chua goi LLM.

## 3) Cac file da tao / cap nhat
### Tao moi
- `server/server-ai/models/AiConversation.js`
- `server/server-ai/orchestrators/aiOrchestrator.js`
- `server/server-ai/services/aiChatService.js`
- `server/server-ai/controllers/aiChatController.js`
- `server/server-ai/routes/aiChatRoutes.js`
- `server/server-ai/routes/indexRoutes.js`

### Cap nhat
- `server/middlewares/auth.js` (them `optionalAuthenticateUser`)
- `server/routes/indexRoutes.js` (mount AI routes)

## 4) Mo ta ngan gon ve contract (Phase 1)
### Request (SSE)
POST `/api/v1/ai/chat/stream`
Headers: `x-anonymous-id` (optional)
Body:
```
{
  "conversationId": "optional",
  "mode": "document_rag" | "catalog_qa",
  "message": "...",
  "anonymousId": "optional"
}
```

### SSE events
- `meta`: { conversationId, anonymousId, mode, retrievalStrategy, sourceSummary }
- `message`: { delta }
- `done`: { message, conversationId, mode, retrievalStrategy, sourceSummary, sources }

### Anonymous limit
- Gioi han 4 cau (env: `AI_ANON_QUESTION_LIMIT`). Vuot gioi han se tra 401.

## 5) Du dinh tiep theo (cac phase)
### Phase 2 - Document RAG hardening
- Validation upload PDF/DOCX/PPTX/XLSX.
- Chunking profile + embedding version.
- Tach namespace docs / filter `source_type=document`.
- Guard retrieval: similarity threshold, top-k cap, fallback.
- Tich hop LLM provider (Gemini) + streaming.

### Phase 3 - Catalog ingestion + retrieval
- ETL snapshot product/price/promotion/category -> Qdrant catalog.
- Sync theo cron va trigger sau admin CRUD.
- Format tra loi catalog ro rang (ten, gia, promo, dieu kien).

### Phase 4 - Frontend integration
- Mode selector trong UI chat.
- Upload gating + hien trang thai index/sync.
- Render citation sources.

### Phase 5 - Resilience + observability
- Cache theo mode (TTL khac nhau).
- Graceful degradation khi Qdrant/LLM loi.
- Trace/metrics: latency, token usage, cache hit.

### Phase 6 - Verification
- Unit test routing, isolation, retrieval.
- E2E upload doc + query, update price + sync.
- Regression streaming + persistence.

## 6) Quyết định hien tai
- Qdrant: dung Docker local cho dev, sau do moi can nhac cloud.
- LLM provider: Gemini (se tiep tuc khi co API key).
- Data model: AI conversation tach rieng khoi support chat.
- Streaming: SSE.

## 7) Ghi chu
- Chua tich hop Qdrant, embedding, ingestion.
- Chua tich hop LLM provider (Gemini) (cho den khi co API key).
- Khong thay doi frontend hoac luong chat support hien co.
