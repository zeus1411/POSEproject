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

### Phase 2 - Document RAG hardening (IMPLEMENTATION HOAN TAT, DANG TEST)
#### 2.5 Security & Ownership Fixes
- ✅ Fix ownership check khi access conversation: khong the truy cap conversation cua user/anonymous khac.
- ✅ Fix SSE error handling: tra ve dung status code (401/403/500 thay vi 400 mac dinh).
- ✅ Them streaming callback support trong `handleAiChat` va `routeAiQuery`.
- ✅ SSE meta luon tra ve `sources` de dam bao citation day du.

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

#### 2.10 Environment Variables & Runtime Setup (UPDATED)
- ✅ GEMINI_API_KEY: da move sang `server/.env` (root).
- ⚠️ Can chay `npm install` trong `server/` de cai dependencies moi (neu chua).
- ⚠️ Can start Qdrant Docker: `docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant`

### Phase 3 - Catalog ingestion + retrieval (IMPLEMENTATION HOAN TAT)
#### 3.1 Catalog ingestion + Qdrant collection
- ✅ Tao `catalogIngestService`: snapshot Product/Category/Promotion -> Qdrant `catalog_collection`.
- ✅ Recreate collection moi lan sync de tranh stale data.
- ✅ Scheduler sync theo interval (mac dinh 10 phut) + debounce.
- ✅ Trigger sync sau CRUD admin: product/category/promotion.

#### 3.2 Catalog retrieval + chat mode
- ✅ Tao `catalogRetrieveService` + `catalogPrompt`.
- ✅ Route `catalog_qa` qua Qdrant retrieval + Gemini.
- ✅ Admin endpoints: `POST /api/v1/ai/catalog/sync`, `GET /api/v1/ai/catalog/status`.

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
- ✅ `server/server-ai/controllers/aiChatController.js` (improve SSE error handling, streaming, meta includes sources)
- ✅ `server/server-ai/routes/indexRoutes.js` (mount document routes)
- ✅ `server/package.json` (add @google/generative-ai, @qdrant/js-client-rest, officeparser)

### Phase 3 Files (tao moi)
- ✅ `server/server-ai/services/catalogIngestService.js`
- ✅ `server/server-ai/services/catalogRetrieveService.js`
- ✅ `server/server-ai/services/catalogPrompt.js`
- ✅ `server/server-ai/controllers/aiCatalogController.js`
- ✅ `server/server-ai/routes/aiCatalogRoutes.js`

### Phase 3 Files (cap nhat)
- ✅ `server/server-ai/orchestrators/aiOrchestrator.js` (catalog_qa flow + Gemini)
- ✅ `server/server-ai/services/qdrantService.js` (catalog collection + search/upsert)
- ✅ `server/server-ai/config/aiConfig.js` (catalog env vars)
- ✅ `server/server-ai/routes/indexRoutes.js` (mount catalog routes)
- ✅ `server/index.js` (start catalog sync scheduler)
- ✅ `server/server-ecommerce/controllers/productController.js` (trigger catalog sync)
- ✅ `server/server-ecommerce/controllers/categoryController.js` (trigger catalog sync)
- ✅ `server/server-ecommerce/controllers/promotionController.js` (trigger catalog sync)

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

### Catalog Sync Endpoints (NEW - Phase 3, Admin only)
POST `/api/v1/ai/catalog/sync`
GET `/api/v1/ai/catalog/status`

Headers:
- Authorization: Bearer token (admin)

Response (sync):
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "reason": "manual",
    "counts": {
      "products": 100,
      "promotions": 5
    }
  }
}
```

### Anonymous User Limit
- Gioi han 4 cau (env: `AI_ANON_QUESTION_LIMIT`). Vuot gioi han se tra 401 + khong stream SSE.

## 5) Du dinh tiep theo (cac phase)

### Phase 2 - Document RAG hardening (IMPLEMENTATION HOAN TAT, DANG TEST)
✅ IMPLEMENTATION DONE:
- Validation upload PDF/DOCX/PPTX/XLSX + local disk storage.
- Chunking profile + embedding version (Gemini text-embedding-004).
- Tach namespace docs / filter `source_type=document` trong Qdrant.
- Guard retrieval: similarity threshold (0.2), top-k cap (5), fallback (empty context).
- LLM provider (Gemini gemini-1.5-flash-latest) + streaming via SSE.
- Citation sources: chunk ID, file name, similarity score.
- SSE meta luon co `sources`.

⚠️ NEXT ACTIONS:
1. Chay `npm install` trong `server/` de cai dependencies (neu chua).
2. Start Qdrant Docker: `docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant`
3. Start server: `npm run dev` trong `server/`.
4. TEST endpoints:
  - Upload document: `POST /api/v1/ai/documents/upload` (multipart, field=file)
  - Chat document_rag: `POST /api/v1/ai/chat/stream` (mode=document_rag, SSE)
  - Verify: response.sources co citation, SSE events `meta` -> `message` (tokens) -> `done`
5. Test anonymous limit: 4 questions, then 401.
6. Test ownership: conversation access control.

### Phase 3 - Catalog ingestion + retrieval (IMPLEMENTATION HOAN TAT, DANG TEST)
✅ IMPLEMENTATION DONE:
- ETL snapshot product/price/promotion/category -> Qdrant catalog_collection.
- Recreate collection moi lan sync de tranh stale data.
- Sync theo 2 cơ chế: interval scheduler + trigger sau admin CRUD product/category/promotion.
- Route `catalog_qa` queries to catalog retrieval (Qdrant) + Gemini.
- Admin endpoints sync/status cho catalog.

⚠️ NEXT ACTIONS:
1. Goi `POST /api/v1/ai/catalog/sync` bang admin de tao snapshot ban dau.
2. Test `catalog_qa` qua `POST /api/v1/ai/chat/stream` (mode=catalog_qa).
3. Update 1 product/promotion, kiem tra `GET /api/v1/ai/catalog/status` de xac nhan sync.
4. (Optional) Dieu chinh `CATALOG_SYNC_INTERVAL_MINUTES` va `CATALOG_SYNC_DEBOUNCE_MS` neu can.

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

## 7) Environment Variables (Required vs Optional)

### REQUIRED (de khoi dong server)
- `MONGODB_URI`
- `PORT`
- `STRIPE_SECRET_KEY`
- `CLIENT_URL`
- `JWT_SECRET`
- `DATABASE_NAME`

### REQUIRED (de dung AI features: Document RAG + Catalog QA)
- `GEMINI_API_KEY` (da move sang `server/.env`)

### OPTIONAL (defaults already set)
- `GEMINI_MODEL` (default: `gemini-1.5-flash-latest`)
- `GEMINI_EMBED_MODEL` (default: `text-embedding-004`)
- `QDRANT_URL` (default: `http://localhost:6333`)
- `QDRANT_API_KEY` (default: empty, set if your Qdrant needs API key)
- `QDRANT_DOCS_COLLECTION` (default: `docs_collection`)
- `QDRANT_CATALOG_COLLECTION` (default: `catalog_collection`)
- `DOC_CHUNK_SIZE` (default: 1000)
- `DOC_CHUNK_OVERLAP` (default: 200)
- `DOC_TOP_K` (default: 5)
- `DOC_SCORE_THRESHOLD` (default: 0.2)
- `DOC_MIN_TEXT_LENGTH` (default: 30)
- `DOC_MAX_FILE_SIZE_MB` (default: 25)
- `AI_DOC_UPLOAD_DIR` (default: `server/uploads/ai-docs`)
- `AI_ANON_QUESTION_LIMIT` (default: 4)
- `CATALOG_TOP_K` (default: 5)
- `CATALOG_SCORE_THRESHOLD` (default: 0.2)
- `CATALOG_SYNC_INTERVAL_MINUTES` (default: 10, set 0 de tat scheduler)
- `CATALOG_SYNC_DEBOUNCE_MS` (default: 30000)

## 8) Lenh can chay (Required vs Optional)

### REQUIRED (chay trong thu muc `server/`)
- `npm install` (1 lan hoac khi cap nhat dependency)
- `docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant` (neu chua co Qdrant)
- `npm run dev`

### OPTIONAL (de test nhanh)
- `curl -X POST http://localhost:PORT/api/v1/ai/catalog/sync -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"reason\":\"manual\"}"`
- `curl -X GET http://localhost:PORT/api/v1/ai/catalog/status -H "Authorization: Bearer <token>"`
- `curl -X POST http://localhost:PORT/api/v1/ai/documents/upload -H "Authorization: Bearer <token>" -F "file=@/path/to/file.pdf"`
- `curl -N -X POST http://localhost:PORT/api/v1/ai/chat/stream -H "Content-Type: application/json" -d "{\"mode\":\"document_rag\",\"message\":\"...\"}"`

## 9) Ghi chu
- ✅ Phase 1 COMPLETED: router active, SSE infrastructure in place.
- ✅ Phase 2 IMPLEMENTATION: hoan tat, dang test end-to-end.
- ✅ Phase 3 IMPLEMENTATION: hoan tat (catalog ingestion + retrieval + sync).
- ⚠️ SECURITY: GEMINI_API_KEY da move sang `server/.env`; neu key cu con ton tai thi nen rotate.
- ⚠️ NEXT IMMEDIATE TASK: npm install (neu chua), start Qdrant, sync catalog, test endpoints document_rag + catalog_qa.
