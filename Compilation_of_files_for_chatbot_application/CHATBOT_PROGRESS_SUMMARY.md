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

## 2) Hang muc da thuc hien

### Phase 1 - Foundation contract + mode router (HOAN TAT)
#### 2.1 Tao module AI chat (server-ai)
- ✅ Tao model `AiConversation` luu message + metadata mode/retrieval/source.
- ✅ Tao `aiOrchestrator` de route theo mode (document_rag / catalog_qa).
- ✅ Tao `aiChatService` de tao conversation, luu message, kiem tra limit anonymous.
- ✅ Tao controller SSE + JSON cho endpoint chat.
- ✅ Tao routes cho AI.

#### 2.2 Optional auth middleware
- ✅ Them `optionalAuthenticateUser` de ho tro anonymous (neu co token thi attach user).

#### 2.3 Mount routes
- ✅ Mount AI routes vao router chinh.

#### 2.4 Contract va streaming (Phase 1)
- ✅ Endpoint SSE: `POST /api/v1/ai/chat/stream`
- ✅ Endpoint JSON: `POST /api/v1/ai/chat`
- ✅ Payload: `conversationId`, `mode`, `message`, `anonymousId` (optional)
- ✅ SSE events: `meta`, `message`, `done`
- ✅ Router hoat dong, nhung chua goi LLM (stub response).

### Phase 2 - Document RAG hardening (DANG THUC HIEN - 90% HOAN TAT)
#### 2.5 Security & Ownership Fixes
- ✅ Fix ownership check khi access conversation: khong the truy cap conversation cua user/anonymous khac.
- ✅ Fix SSE error handling: tra ve dung status code (401/403/500 thay vi 400 mac dinh).
- ✅ Them streaming callback support trong `handleAiChat` va `routeAiQuery`.

#### 2.6 Document Ingestion Pipeline
- ✅ Tao `uploadAiDocument` middleware (multer disk storage, file type + size validation).
- ✅ Tao endpoint: `POST /api/v1/ai/documents/upload` (yeu cau auth).
- ✅ Tao `documentIngestService`: parse (officeparser), chunk, embed, upsert Qdrant.
- ✅ Tao `textUtils.js`: normalize + chunk text voi overlap.
- ✅ Tao `aiUpload.js`: local disk storage (defaults to `server/uploads/ai-docs`).
- ✅ Tao `aiDocumentController.js`: handle upload va ingest.
- ✅ Tao `aiDocumentRoutes.js`: mount document upload route.

#### 2.7 Vector DB & Embedding Integration
- ✅ Tao `geminiService.js`: GoogleGenerativeAI client, embedText + generateGeminiAnswer (streaming).
- ✅ Tao `qdrantService.js`: client, ensureDocsCollection, upsertDocumentChunks, searchDocumentChunks.
- ✅ Tao `documentRetrieveService.js`: retrieve tu Qdrant + map sources.
- ✅ Tao `documentPrompt.js`: build prompt cho Gemini (context + question).

#### 2.8 LLM Integration
- ✅ Implement document_rag flow trong `aiOrchestrator.js`:
  - Retrieve context tu Qdrant
  - Build prompt
  - Call Gemini voi streaming token callback
  - Return answer + sources + metadata

#### 2.9 Configuration & Dependencies
- ✅ Tao `server/server-ai/config/aiConfig.js`: centralized config for Gemini, Qdrant, chunking, file upload.
- ✅ Add dependencies vao `server/package.json`:
  - `@google/generative-ai` (Gemini API)
  - `@qdrant/js-client-rest` (Qdrant client)
  - `officeparser` (PDF/DOCX/PPTX/XLSX parsing)

#### 2.10 Environment Variables (PENDING - can cai dat)
- ⚠️ GEMINI_API_KEY: co trong `server/server-ai/.env` nhung can move sang `server/.env` (root) de load khi khoi dong.
- ⚠️ Can chay `npm install` trong `server/` de cai dependencies moi.
- ⚠️ Can start Qdrant Docker: `docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant`

## 3) Cac file da tao / cap nhat

### Phase 1 Files (tao moi)
- ✅ `server/server-ai/models/AiConversation.js`
- ✅ `server/server-ai/orchestrators/aiOrchestrator.js`
- ✅ `server/server-ai/services/aiChatService.js`
- ✅ `server/server-ai/controllers/aiChatController.js`
- ✅ `server/server-ai/routes/aiChatRoutes.js`
- ✅ `server/server-ai/routes/indexRoutes.js`

### Phase 1 Files (cap nhat)
- ✅ `server/middlewares/auth.js` (them `optionalAuthenticateUser`)
- ✅ `server/routes/indexRoutes.js` (mount AI routes)

### Phase 2 Files (tao moi)
#### Config
- ✅ `server/server-ai/config/aiConfig.js` (centralized env vars for AI, Qdrant, chunking)

#### Services
- ✅ `server/server-ai/services/geminiService.js` (Gemini API client, embed + generate streaming)
- ✅ `server/server-ai/services/qdrantService.js` (Qdrant client, collection management, search/upsert)
- ✅ `server/server-ai/services/documentRetrieveService.js` (retrieve context from Qdrant + map sources)
- ✅ `server/server-ai/services/documentIngestService.js` (parse, chunk, embed, upsert pipeline)
- ✅ `server/server-ai/services/documentPrompt.js` (build prompt for Gemini)

#### Utilities
- ✅ `server/server-ai/utils/textUtils.js` (normalize + chunk text with overlap)

#### Middleware
- ✅ `server/server-ai/middlewares/aiUpload.js` (multer disk storage for documents)

#### Controllers
- ✅ `server/server-ai/controllers/aiDocumentController.js` (handle document upload)

#### Routes
- ✅ `server/server-ai/routes/aiDocumentRoutes.js` (document upload endpoint)

### Phase 2 Files (cap nhat)
- ✅ `server/server-ai/orchestrators/aiOrchestrator.js` (implement document_rag flow with Gemini)
- ✅ `server/server-ai/services/aiChatService.js` (add ownership checks, streaming callbacks)
- ✅ `server/server-ai/controllers/aiChatController.js` (improve SSE error handling, streaming)
- ✅ `server/server-ai/routes/indexRoutes.js` (mount document routes)
- ✅ `server/package.json` (add @google/generative-ai, @qdrant/js-client-rest, officeparser)

## 4) Contract & Endpoint Updates

### Chat Endpoints (SSE + JSON)
POST `/api/v1/ai/chat/stream` (SSE)
POST `/api/v1/ai/chat` (JSON)

Headers: `x-anonymous-id` (optional)

Body:
```json
{
  "conversationId": "optional",
  "mode": "document_rag" | "catalog_qa",
  "message": "...",
  "anonymousId": "optional"
}
```

SSE Events:
- `meta`: { conversationId, anonymousId, mode, retrievalStrategy, sourceSummary, sources }
- `message`: { delta } (streamed tokens)
- `done`: { message, conversationId, mode, retrievalStrategy, sourceSummary, sources }
- `error`: { message, statusCode } (if error)

### Document Upload Endpoint (NEW - Phase 2)
POST `/api/v1/ai/documents/upload` (multipart form-data)

Headers: 
- Authorization: Bearer token (yeu cau login)

Body:
- form field `file`: PDF/DOCX/PPTX/XLSX file (max 25MB default)

Response:
```json
{
  "success": true,
  "data": {
    "docId": "uuid",
    "fileName": "...",
    "chunkCount": 10,
    "collection": "docs_collection",
    "embeddingModel": "text-embedding-004",
    "chunkSize": 1000,
    "chunkOverlap": 200
  }
}
```

### Anonymous User Limit
- Gioi han 4 cau (env: `AI_ANON_QUESTION_LIMIT`). Vuot gioi han se tra 401 + khong stream SSE.

## 5) Du dinh tiep theo (cac phase)

### Phase 2 - Document RAG hardening (90% HOAN TAT, DANG TEST)
✅ IMPLEMENTATION DONE:
- Validation upload PDF/DOCX/PPTX/XLSX + local disk storage.
- Chunking profile + embedding version (Gemini text-embedding-004).
- Tach namespace docs / filter `source_type=document` trong Qdrant.
- Guard retrieval: similarity threshold (0.2), top-k cap (5), fallback (empty context).
- LLM provider (Gemini gemini-1.5-flash-latest) + streaming via SSE.
- Citation sources: chunk ID, file name, similarity score.

⚠️ NEXT ACTIONS:
1. Copy `GEMINI_API_KEY` tu `server/server-ai/.env` vao `server/.env` (root) de load au tomatically.
2. Chay `npm install` trong `server/` de cai dependencies (@google/generative-ai, @qdrant/js-client-rest, officeparser).
3. Start Qdrant Docker: `docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant`
4. Start server: `npm run dev` trong `server/`.
5. TEST endpoints:
   - Upload document: `POST /api/v1/ai/documents/upload` (multipart, field=file)
   - Chat document_rag: `POST /api/v1/ai/chat/stream` (mode=document_rag, SSE)
   - Verify: response.sources co citation, SSE events `meta` -> `message` (tokens) -> `done`
6. Test anonymous limit: 4 questions, then 401.
7. Test ownership: conversation access control.

### Phase 3 - Catalog ingestion + retrieval (READY FOR START)
- ETL snapshot product/price/promotion/category -> Qdrant catalog_collection.
- Sync theo 2 cơ chế: cron 5-10 phút + trigger sau admin CRUD product/promotion.
- Format tra loi catalog ro rang (ten SP, gia hien tai, promo, dieu kien, hiệu lực).
- Route catalog_qa queries to catalog retrieval instead of document retrieval.

### Phase 4 - Frontend integration (AFTER PHASE 2 + 3 VERIFIED)
- Mode selector trong UI chat (dropdown: document_rag vs catalog_qa).
- Upload gating + display index/sync status.
- Render citation sources (file name, chunk preview, score).
- Real-time document upload progress.

### Phase 5 - Resilience + observability (AFTER PHASE 2-4)
- Cache theo mode (TTL ngắn cho catalog_qa, TTL dài cho document_rag).
- Graceful degradation khi Qdrant/LLM lỗi (fallback, retry logic).
- Trace/metrics: latency retrieval/gen, token usage, cache hit, source coverage.

### Phase 6 - Verification (FINAL)
- Unit test routing, isolation, retrieval guard.
- E2E: upload doc + query, update price + sync + query catalog, multi-user isolation.
- Regression: SSE streaming, conversation persistence, ownership checks.

## 6) Quyết định hien tai
- ✅ Qdrant: dung Docker local cho dev (docker run port 6333).
- ✅ LLM provider: Gemini free tier (gemini-1.5-flash-latest, text-embedding-004).
- ✅ Data model: AI conversation tach rieng khoi support chat (AiConversation model).
- ✅ Streaming: SSE (text/event-stream) voi callback-based token streaming.
- ✅ Document storage: local disk (`server/uploads/ai-docs/` by default).
- ✅ File parsing: officeparser (support PDF/DOCX/PPTX/XLSX).
- ✅ Ownership & Security: fixed access control, proper error status codes in SSE.

## 7) Environment Variables (can setup)

### REQUIRED (Gemini)
- `GEMINI_API_KEY` (currently in `server/server-ai/.env`, MOVE to `server/.env`)

### OPTIONAL (defaults already set)
- `GEMINI_MODEL` (default: `gemini-1.5-flash-latest`)
- `GEMINI_EMBED_MODEL` (default: `text-embedding-004`)
- `QDRANT_URL` (default: `http://localhost:6333`)
- `QDRANT_API_KEY` (default: empty, set if your Qdrant needs API key)
- `QDRANT_DOCS_COLLECTION` (default: `docs_collection`)
- `DOC_CHUNK_SIZE` (default: 1000)
- `DOC_CHUNK_OVERLAP` (default: 200)
- `DOC_TOP_K` (default: 5)
- `DOC_SCORE_THRESHOLD` (default: 0.2)
- `DOC_MIN_TEXT_LENGTH` (default: 30)
- `DOC_MAX_FILE_SIZE_MB` (default: 25)
- `AI_DOC_UPLOAD_DIR` (default: `server/uploads/ai-docs`)
- `AI_ANON_QUESTION_LIMIT` (default: 4)

## 8) Ghi chu
- ✅ Phase 1 COMPLETED: router active, SSE infrastructure in place.
- ✅ Phase 2 IMPLEMENTATION: 90% done, awaiting final env setup + testing.
- ⚠️ SECURITY: Gemini API key must be moved from per-folder `.env` to root `server/.env`. Current key in `server/server-ai/.env` should be rotated after moving to root.
- ⚠️ NEXT IMMEDIATE TASK: Copy env vars, run `npm install`, start Qdrant, test Phase 2 endpoints.
- 📋 Phase 3 (Catalog ingestion) will begin after Phase 2 testing is complete and verified to work end-to-end.
