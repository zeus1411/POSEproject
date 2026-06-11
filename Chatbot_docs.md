# Tai lieu giai thich module server-ai Chatbot

## 1. Tong quan module `server/server-ai`

Folder `server/server-ai` la phan backend phuc vu cho chatbot AI cua he thong. Module nay xu ly 3 nhom chuc nang chinh:

1. Chat voi AI:
   - Cho phep user da dang nhap va guest chua dang nhap dat cau hoi.
   - Luu lich su hoi dap vao MongoDB bang model `AiConversation`.
   - Gioi han guest chua dang nhap mac dinh 4 cau hoi.
   - Ho tro merge phien chat guest vao tai khoan sau khi dang nhap.

2. RAG voi tai lieu:
   - Admin upload file PDF, DOCX, PPTX, XLSX.
   - Server doc text tu file, chia thanh nhieu chunk nho.
   - Moi chunk duoc tao embedding bang Gemini.
   - Embedding duoc luu vao Qdrant de chatbot co the tim lai noi dung lien quan khi user hoi.

3. RAG voi catalog san pham:
   - Lay du lieu product, category, promotion tu database ecommerce.
   - Bien moi san pham/khuyen mai thanh text.
   - Tao embedding va luu vao Qdrant.
   - Khi user hoi ve san pham, gia, khuyen mai, chatbot truy xuat catalog de tra loi.

Kien truc tong quat:

```txt
Client
  -> routes
  -> controllers
  -> services
  -> orchestrator
  -> retrieve service
  -> Qdrant + Gemini
  -> luu conversation
  -> tra response ve client
```

## 2. Cau truc file quan trong

### `routes/indexRoutes.js`

File nay gom cac route AI lai duoi prefix `/ai`.

```js
router.use('/ai', aiChatRoutes);
router.use('/ai', aiDocumentRoutes);
router.use('/ai', aiCatalogRoutes);
```

Neu file route cha cua server mount `indexRoutes` vao app, thi cac endpoint thuc te se co dang:

- `/ai/chat`
- `/ai/chat/stream`
- `/ai/chat/session`
- `/ai/chat/merge-guest-session`
- `/ai/documents/upload`
- `/ai/documents`
- `/ai/catalog/sync`
- `/ai/catalog/status`

## 3. Model luu conversation: `models/AiConversation.js`

Model `AiConversation` la noi luu lich su chat.

### `ALLOWED_AI_MODES`

```js
const ALLOWED_AI_MODES = ['document_rag', 'catalog_qa'];
```

Chatbot hien co 2 che do:

- `document_rag`: hoi dap dua tren tai lieu upload.
- `catalog_qa`: hoi dap dua tren catalog san pham/khuyen mai.

### `aiMessageSchema`

Moi message trong conversation co cac truong chinh:

- `role`: `user`, `assistant`, hoac `system`.
- `content`: noi dung tin nhan.
- `mode`: che do AI luc message duoc tao.
- `retrievalStrategy`: cach truy xuat du lieu, vi du `document_rag:qdrant_cosine`.
- `sourceSummary`: tom tat so nguon tim duoc.
- `sources`: danh sach nguon lien quan, co the la document chunk hoac catalog item.

### `aiConversationSchema`

Moi conversation co cac truong:

- `userId`: neu user da dang nhap.
- `anonymousId`: neu la guest chua dang nhap.
- `status`: `ACTIVE` hoac `ARCHIVED`.
- `mode`: mode gan nhat.
- `messages`: mang cac message.
- `lastMessageAt`: thoi diem message cuoi.
- `metadata`: luu mode, retrieval strategy, source summary gan nhat.

### `addMessage(message)`

Ham instance method nay them message vao conversation va cap nhat thong tin gan nhat.

```txt
conversation.addMessage(...)
  -> push message vao messages
  -> cap nhat lastMessageAt
  -> cap nhat mode
  -> cap nhat metadata neu co retrievalStrategy/sourceSummary
```

## 4. Chat routes: `routes/aiChatRoutes.js`

### `POST /ai/chat/stream`

```js
router.post('/chat/stream', optionalAuthenticateUser, streamAiChat);
```

Dung de chat AI dang streaming bang SSE. Client nhan tung phan cau tra loi theo event.

Middleware `optionalAuthenticateUser` nghia la:

- Co token hop le thi gan `req.user`.
- Khong co token van cho qua nhu guest.

### `POST /ai/chat`

```js
router.post('/chat', optionalAuthenticateUser, chatOnce);
```

Dung de chat AI dang JSON binh thuong, khong stream.

### `GET /ai/chat/session`

```js
router.get('/chat/session', optionalAuthenticateUser, getChatSession);
```

Dung de lay conversation hien tai cua user/guest.

### `POST /ai/chat/merge-guest-session`

```js
router.post('/chat/merge-guest-session', authenticateUser, mergeGuestChatSession);
```

Dung sau khi guest dang nhap. Endpoint nay gan conversation guest vao tai khoan user.

Khac voi `optionalAuthenticateUser`, endpoint nay dung `authenticateUser`, nen bat buoc phai dang nhap.

## 5. Chat controller: `controllers/aiChatController.js`

Controller co nhiem vu nhan request, lay du lieu can thiet, goi service, roi tra response.

### `writeSseEvent(res, event, data)`

Dung cho streaming SSE.

```js
res.write(`event: ${event}\n`);
res.write(`data: ${JSON.stringify(data)}\n\n`);
```

Moi event gui ve client co dang:

```txt
event: message
data: {"delta":"noi dung"}
```

### `extractAnonymousId(req)`

Lay ID cua guest tu nhieu vi tri:

```js
req.headers['x-guest-session-id']
req.headers['x-anonymous-id']
req.body?.guestSessionId
req.body?.anonymousId
```

Muc dich: giup server biet guest nao dang chat. Neu co nhieu guest cung luc, moi guest phai co `anonymousId` rieng de khong bi nham conversation.

### `streamAiChat(req, res, next)`

Dung cho endpoint `POST /ai/chat/stream`.

Flow:

```txt
Client gui message
  -> lay message, mode, documentScope, conversationId
  -> lay userId neu da login
  -> neu user chua login thi bo qua conversationId client gui len
  -> lay anonymousId
  -> setup SSE callbacks
  -> goi handleAiChat(...)
  -> trong luc AI xu ly, gui event status/meta/message
  -> gui event done
  -> dong response
```

Cac event SSE:

- `heartbeat`: giu ket noi khong bi timeout.
- `status`: bao giai doan dang xu ly, vi du `analyzing`, `retrieving`, `generating`.
- `meta`: thong tin conversation, mode, intent, source.
- `message`: tung phan cau tra loi AI.
- `done`: ket qua cuoi cung.
- `error`: loi neu co.

### `chatOnce(req, res, next)`

Dung cho endpoint `POST /ai/chat`.

Flow:

```txt
Client gui message
  -> lay userId/anonymousId
  -> goi handleAiChat(...)
  -> tra JSON result
```

Khac voi `streamAiChat`: ham nay khong gui tung token, ma doi AI tra loi xong moi response.

### `getChatSession(req, res, next)`

Dung cho endpoint `GET /ai/chat/session`.

Flow:

```txt
Client goi lay session
  -> neu da login lay userId
  -> lay anonymousId neu la guest
  -> neu da login co the lay conversationId tu query
  -> goi getCurrentConversation(...)
  -> tra conversation ve client
```

Muc dich: frontend co the hien thi lai lich su chat hien tai khi user mo chatbot.

### `mergeGuestChatSession(req, res, next)`

Dung cho endpoint `POST /ai/chat/merge-guest-session`.

Flow:

```txt
Guest vua dang nhap
  -> frontend gui guestSessionId va optional conversationId
  -> middleware authenticateUser gan req.user
  -> controller lay userId
  -> goi mergeGuestSession(...)
  -> tra conversation da merge
```

Muc dich: giu lai lich su chat cua guest sau khi dang nhap.

## 6. Chat service: `services/aiChatService.js`

Day la file quan trong nhat cua flow chat. No quan ly conversation, gioi han guest, merge session va goi orchestrator.

### `ANON_QUESTION_LIMIT`

```js
const ANON_QUESTION_LIMIT = Number(process.env.AI_ANON_QUESTION_LIMIT || 4);
```

Gioi han so cau hoi cua guest. Neu khong cau hinh env thi mac dinh la 4.

### `createAnonymousId()`

Tao ID ngau nhien cho guest neu client chua co anonymous ID.

Uu tien `crypto.randomUUID()`, neu khong co thi dung `crypto.randomBytes`.

### `countUserMessages(messages)`

Dem so message co `role === 'user'`.

Dung de biet guest da hoi bao nhieu cau.

### `getRecentChatHistory(messages, limit = 6)`

Lay toi da 6 message gan nhat de dua vao prompt.

Muc dich: giup AI hieu cau hoi tiep noi, vi du user hoi "noi ro hon y tren".

### `getPreferredSources(messages)`

Tim message gan nhat cua assistant co `sources`.

Muc dich: neu user hoi tiep ve cung tai lieu/san pham, retrieval se uu tien nguon da dung truoc do.

### `serializeMessage(message)`

Format message truoc khi tra ve client.

Chuyen `_id` thanh `id`, gan default rong cho `retrievalStrategy`, `sourceSummary`, `sources`.

### `serializeConversation(conversation, anonymousId)`

Format conversation truoc khi tra ve client.

Neu conversation null thi tra `null`.

### `assertConversationAccess({ conversation, userId, anonymousId })`

Kiem tra quyen doc conversation.

Neu conversation co `userId`, user hien tai phai dung la chu conversation.

Neu conversation co `anonymousId`, anonymousId hien tai phai khop.

Muc dich: tranh user A doc conversation cua user B, hoac guest A doc conversation cua guest B.

### `getCurrentConversation({ conversationId, userId, anonymousId })`

Lay conversation hien tai.

Flow:

```txt
Neu co conversationId:
  -> findById(conversationId)
  -> khong thay thi bao loi
  -> check quyen bang assertConversationAccess
  -> tra conversation

Neu co userId:
  -> tim conversation ACTIVE moi nhat cua user
  -> tra conversation

Neu co anonymousId:
  -> tim conversation ACTIVE moi nhat cua guest
  -> tra conversation

Neu khong co gi:
  -> tra null
```

### `mergeGuestSession({ guestSessionId, userId, conversationId })`

Gan conversation guest vao user sau khi dang nhap.

Flow:

```txt
Neu khong co userId:
  -> bao loi "Please login to continue chatting."

Neu khong co guestSessionId:
  -> bao loi "guestSessionId is required"

Tao query:
  anonymousId = guestSessionId
  status = ACTIVE

Neu co conversationId:
  -> them _id vao query

Tim conversation guest moi nhat

Neu khong tim thay:
  -> tim conversation ACTIVE moi nhat cua user
  -> tra ve conversation cua user neu co

Neu conversation da co userId khac:
  -> bao loi unauthorized

Neu hop le:
  -> conversation.userId = userId
  -> conversation.anonymousId = null
  -> save
  -> tra conversation
```

Sau merge:

```txt
Truoc:
  userId = null
  anonymousId = guest-123

Sau:
  userId = user-001
  anonymousId = null
```

### `getOrCreateConversation({ conversationId, userId, anonymousId, mode, message })`

Dam bao moi lan chat luon co conversation hop le.

Flow:

```txt
Chuan hoa mode
Kiem tra mode co duoc ho tro khong

Neu co conversationId:
  -> tim conversation theo ID
  -> khong thay thi bao loi
  -> neu conversation thuoc user thi userId phai khop
  -> neu conversation thuoc guest thi anonymousId phai khop
  -> neu user da login nhung conversation dang la guest:
       gan conversation vao user
       xoa anonymousId
       save
  -> tra conversation

Neu khong co conversationId:
  -> neu la guest va chua co anonymousId thi tao anonymousId moi
  -> neu la guest thi tim conversation ACTIVE moi nhat cua guest
  -> neu tim thay thi tra conversation do
  -> neu khong tim thay thi tao conversation moi
```

Luu y: user da dang nhap nhung khong gui `conversationId` se tao conversation moi, vi code chi tim conversation cu cho guest trong ham nay. Viec lay conversation user hien tai nam o `getCurrentConversation`.

### `enforceAnonymousLimit(conversation)`

Kiem tra guest da hoi du so cau chua.

```txt
Dem so message role=user
Neu >= ANON_QUESTION_LIMIT
  -> bao loi yeu cau dang nhap
```

Voi limit 4, guest duoc hoi 4 cau dau. Cau thu 5 se bi chan.

### `handleAiChat(...)`

Day la ham trung tam cua moi request chat.

Flow chi tiet:

```txt
1. Kiem tra message khong duoc rong.
2. Chuan hoa mode bang normalizeMode.
3. Kiem tra mode hop le bang ensureModeSupported.
4. Lay hoac tao conversation bang getOrCreateConversation.
5. Neu la guest, kiem tra gioi han cau hoi.
6. Lay chatHistory gan nhat.
7. Lay preferredSources tu cau tra loi truoc.
8. Them message cua user vao conversation.
9. Goi routeAiQuery de AI xu ly cau hoi.
10. Them cau tra loi assistant vao conversation.
11. Save conversation vao MongoDB.
12. Tra ket qua ve controller.
```

`routeAiQuery` se quyet dinh cau hoi di theo nhanh nao:

- Tra loi truc tiep neu la cau chao/cam on.
- Tim trong tai lieu neu mode `document_rag`.
- Tim trong catalog neu mode `catalog_qa`.

## 7. Orchestrator: `orchestrators/aiOrchestrator.js`

Orchestrator la bo dieu phoi AI. No khong luu database conversation, ma quyet dinh:

- Cau hoi thuoc mode nao.
- Co can search Qdrant khong.
- Search o document hay catalog.
- Build prompt nao.
- Goi Gemini de sinh cau tra loi.

### `normalizeText(value)`

Chuan hoa text:

- lowercase
- bo dau tieng Viet
- gom khoang trang

Dung de detect keyword de hon.

### `detectModeFromMessage(message)`

Tu dong chon mode dua tren keyword.

Neu message co keyword lien quan catalog nhu `san pham`, `gia`, `khuyen mai`, `coupon`, `stock`, `mua`, ... thi chon `catalog_qa`.

Nguoc lai mac dinh `document_rag`.

### `normalizeMode(mode, message)`

Neu client khong gui mode hoac gui `auto`, server tu detect mode tu message.

Neu client gui mode cu the, server lower-case va trim.

### `ensureModeSupported(mode)`

Kiem tra mode co nam trong `ALLOWED_AI_MODES` khong.

Neu mode khong phai `document_rag` hoac `catalog_qa`, bao loi.

### `isFollowUpMessage(message)`

Detect cau hoi tiep noi, vi du:

- "noi tiep"
- "chi tiet hon"
- "cau tren"
- "san pham do"
- "tai lieu do"

### `buildRetrievalQuery({ message, chatHistory })`

Neu cau hoi khong phai follow-up, query search chinh la message hien tai.

Neu la follow-up, query search se ghep them 2 message gan nhat trong history de Qdrant co du ngu canh.

### `buildPromptHistory(chatHistory)`

Lay 4 message gan nhat va format thanh:

```txt
User: ...
Assistant: ...
```

Phan nay dua vao prompt de AI hieu ngu canh hoi dap.

### `detectAiIntent(message)` va `buildBehaviorAnswer(message)`

Hai ham nay nam trong `services/intentRouter.js`.

`detectAiIntent` phan loai:

- `behavior`: cau chao, cam on, tam biet, hoi bot la ai.
- `knowledge_query`: cau hoi can tim du lieu.
- `ambiguous`: khong ro nhung van search de tranh bo sot.

Neu la `behavior` va `shouldSearch = false`, chatbot tra loi truc tiep bang `buildBehaviorAnswer`, khong goi Qdrant, khong goi Gemini.

### `looksIncompleteAnswer(answer)`

Kiem tra cau tra loi Gemini co ve bi cut, qua ngan, rong, hoac ket thuc dang do khong.

### `generateAnswerWithRecovery({ prompt, onToken })`

Goi Gemini tao cau tra loi.

Neu cau tra loi co ve chua hoan thanh, ham se retry mot lan nua khong streaming voi prompt yeu cau viet lai day du.

### `routeAiQuery(...)`

Day la ham dieu phoi chinh.

Flow:

```txt
1. Chuan hoa mode.
2. Tao retrievalQuery.
3. Tao promptHistory.
4. Detect intent.
5. Neu la behavior:
     -> tra loi truc tiep, khong search.
6. Neu mode = document_rag:
     -> retrieveDocumentContext(...)
     -> neu khong co context thi tra cau bao khong tim thay thong tin
     -> buildDocumentPrompt(...)
     -> generateAnswerWithRecovery(...)
     -> tra answer + sources
7. Neu mode = catalog_qa:
     -> retrieveCatalogContext(...)
     -> neu khong co context thi tra cau bao khong tim thay catalog
     -> buildCatalogPrompt(...)
     -> generateAnswerWithRecovery(...)
     -> tra answer + sources
```

## 8. Gemini service: `services/geminiService.js`

File nay boc logic goi Google Gemini.

### `getGenAi()`

Tao client Gemini.

Neu thieu `GEMINI_API_KEY`, bao loi.

### `getChatModel()`

Lay model sinh cau tra loi, mac dinh tu config:

```txt
GEMINI_MODEL = gemini-2.5-flash
```

Co cau hinh:

- `temperature: 0.2`: tra loi on dinh, it sang tao qua muc.
- `maxOutputTokens`: gioi han output.

### `embedText(input)`

Tao embedding vector cho text.

Co cache toi da 500 item de tranh goi Gemini lap lai qua nhieu.

Neu model embedding bi loi "not found", co fallback ve `gemini-embedding-001`.

### `generateGeminiAnswer({ prompt, onToken })`

Neu co `onToken`, ham dung streaming:

```txt
Gemini generateContentStream
  -> moi chunk text goi onToken(text)
  -> gom fullText
  -> tra fullText
```

Neu khong co `onToken`, ham goi non-stream:

```txt
Gemini generateContent
  -> lay response.text()
  -> tra text
```

### Xu ly rate limit

Service co cac ham:

- `isRateLimitError`
- `extractRetryDelayMs`
- `getRetryDelayMs`
- `embedWithRetry`
- `toAiProviderError`

Muc dich: neu Gemini bao quota/rate limit, server retry embedding theo backoff va tra loi loi 429 ro rang.

## 9. Qdrant service: `services/qdrantService.js`

Qdrant la vector database dung de luu embedding va search ngu canh lien quan.

### `getClient()`

Tao Qdrant client bang:

- `QDRANT_URL`
- `QDRANT_API_KEY`

### `ensureDocsCollection(vectorSize)`

Dam bao collection document ton tai.

Neu chua co thi tao collection voi distance `Cosine`.

Neu da co thi kiem tra vector size co khop voi embedding model hien tai khong.

### `ensureCatalogCollection(vectorSize)`

Tuong tu `ensureDocsCollection`, nhung cho catalog collection.

### `upsertDocumentChunks(points)`

Luu/cap nhat cac chunk document vao Qdrant.

### `upsertCatalogItems(points)`

Luu/cap nhat product/promotion vao Qdrant.

### `searchDocumentChunks(vector, options)`

Search document chunks theo vector.

Co filter:

- `source_type = document`
- optional `fileNames`
- optional `docIds`
- optional `fileHashes`

Dung trong flow `document_rag`.

### `searchCatalogItems(vector, options)`

Search catalog item theo vector.

Filter:

- `source_type` la `catalog_product` hoac `catalog_promotion`

Dung trong flow `catalog_qa`.

### `deleteDocumentChunksByFilePath(filePath)`

Xoa vector document theo file path khi admin xoa file.

### `deleteDocumentChunksByFileHash(fileHash)`

Xoa vector document cu trung file hash truoc khi ingest lai file.

### `scrollCatalogPoints()`

Lay danh sach point catalog hien co trong Qdrant, chi lay `id` va `contentHash`.

Muc dich: sync catalog theo kieu incremental, chi embed lai item moi/thay doi.

### `deleteCatalogItemsByIds(ids)`

Xoa cac point catalog khong con ton tai trong database ecommerce.

## 10. Document routes/controller/service

### Routes: `routes/aiDocumentRoutes.js`

Tat ca endpoint document chi danh cho admin:

```js
authenticateUser
authorizeRoles('admin')
```

Endpoint:

- `POST /ai/documents/upload`: upload file va index vao Qdrant.
- `GET /ai/documents`: list file da upload.
- `DELETE /ai/documents/:fileName`: xoa file va vector tuong ung.

### Middleware upload: `middlewares/aiUpload.js`

Dung `multer` luu file vao `DOC_UPLOAD_DIR`.

Ham quan trong:

- `ensureUploadDir()`: tao folder upload neu chua co.
- `safeFileName(originalName)`: lam sach ten file de tranh ky tu nguy hiem.
- `fileFilter(req, file, cb)`: chi cho phep `.pdf`, `.docx`, `.pptx`, `.xlsx`.

### Controller: `aiDocumentController.js`

#### `resolveUploadPath(fileName)`

Lam sach file name va dam bao duong dan nam trong `DOC_UPLOAD_DIR`.

Muc dich bao mat: tranh path traversal, vi du `../../secret.env`.

#### `listDocuments(req, res, next)`

Doc folder upload va tra danh sach file:

- `fileName`
- `relativePath`
- `sizeBytes`
- `uploadedAt`
- `lastModifiedAt`

#### `uploadDocument(req, res, next)`

Flow:

```txt
Kiem tra co req.file khong
  -> goi ingestDocument({ file, userId })
  -> tra ket qua docId, fileHash, chunkCount...
```

#### `deleteDocument(req, res, next)`

Flow:

```txt
Lay fileName tu params
  -> resolveUploadPath
  -> kiem tra file ton tai
  -> deleteDocumentChunksByFilePath(relativePath)
  -> fs.unlink xoa file vat ly
  -> tra ket qua xoa
```

### Service ingest document: `documentIngestService.js`

#### `validateDocumentFile(file)`

Kiem tra:

- File co ton tai.
- Kich thuoc khong vuot `DOC_MAX_FILE_SIZE_BYTES`.
- Extension hop le.
- MIME type hop le.

#### `extractTextFromFile(filePath)`

Dung `officeparser` de trich text tu PDF/DOCX/PPTX/XLSX.

#### `buildPayload(...)`

Tao payload luu vao Qdrant cho moi chunk.

Payload gom:

- `docId`
- `fileHash`
- `chunkId`
- `chunkIndex`
- `source_type: document`
- `fileName`
- `filePath`
- `mimeType`
- `text`
- `embeddingModel`
- `uploadedBy`
- `uploadedAt`

#### `ingestDocument({ file, userId })`

Flow day du:

```txt
1. Tao docId.
2. Doc file buffer de tinh fileHash SHA-256.
3. Validate file.
4. Extract raw text tu file.
5. Normalize text.
6. Neu text qua ngan thi bao loi.
7. Chunk text theo DOC_CHUNK_SIZE va DOC_CHUNK_OVERLAP.
8. Neu qua nhieu chunk thi bao loi.
9. Embed chunk dau tien de biet vector size.
10. Dam bao Qdrant docs collection ton tai.
11. Xoa chunk cu co cung fileHash de tranh trung lap.
12. Embed tung chunk con lai.
13. Upsert vao Qdrant theo batch.
14. Tra ket qua ingest.
```

Neu loi trong qua trinh ingest, file upload se bi xoa bang `safeUnlink`.

### Service retrieve document: `documentRetrieveService.js`

#### `retrieveDocumentContext({ query, preferredSources, documentScope })`

Flow:

```txt
1. Embed query thanh vector.
2. Xac dinh scope:
   - Neu co documentScope thi dung documentScope.
   - Neu khong, suy ra tu preferredSources.
3. Search Qdrant document chunks.
4. Uu tien source gan day neu user dang hoi tiep.
5. Rerank bang lexical overlap.
6. Lay top K.
7. Gan citationId S1, S2...
8. Build contextText dua vao prompt.
9. Tra contextText va sources.
```

## 11. Catalog routes/controller/service

### Routes: `routes/aiCatalogRoutes.js`

Chi admin moi duoc goi:

- `POST /ai/catalog/sync`: dong bo catalog vao Qdrant.
- `GET /ai/catalog/status`: xem trang thai sync.

### Controller: `aiCatalogController.js`

#### `syncCatalog(req, res, next)`

Lay `reason` tu body, mac dinh `manual`, roi goi:

```js
syncCatalogIndex({ reason })
```

#### `getCatalogStatus(req, res, next)`

Tra trang thai sync hien tai tu `getCatalogSyncStatus()`.

### Service ingest catalog: `catalogIngestService.js`

Service nay bien product/promotion trong MongoDB thanh vector trong Qdrant.

#### `buildProductText({ product, categoryPath })`

Tao text mo ta san pham de embedding.

Noi dung gom:

- Ten san pham.
- SKU.
- Category.
- Gia.
- Gia goc.
- Discount.
- Ton kho.
- Sold count.
- View count.
- Rating.
- Featured/new/status.
- Tags/specs/description.

#### `buildPromotionText(promotion)`

Tao text mo ta coupon/khuyen mai.

Noi dung gom:

- Ten promotion.
- Code.
- Loai discount.
- Gia tri discount.
- Dieu kien don toi thieu/so luong toi thieu.
- Gioi han giam toi da.
- First order only.
- Ngay bat dau/ket thuc.
- Trang thai active.

#### `buildCatalogItems()`

Flow:

```txt
1. Lay categories.
2. Lay products ACTIVE.
3. Lay promotions coupon dang active va trong thoi gian hieu luc.
4. Build category map.
5. Bien moi product thanh item co:
   - id deterministic
   - text
   - contentHash
   - payload
6. Bien moi promotion thanh item tuong tu.
7. Tra items va counts.
```

#### `createPointId(key)`

Tao ID Qdrant on dinh theo key, vi du `product:<id>`.

Muc dich: cung mot product luon co cung point id, giup sync incremental.

#### `computeContentHash(text)`

Tinh SHA-256 cua text.

Neu text khong doi, khong can embed lai.

#### `reconcileCatalogPoints(items)`

Dong bo incremental voi Qdrant.

Flow:

```txt
1. Scroll Qdrant lay point hien co.
2. So sanh current items voi existing points.
3. Item moi hoac contentHash thay doi -> toUpsert.
4. Point khong con trong database -> toDelete.
5. Chi embed cac item trong toUpsert.
6. Upsert batch vao Qdrant.
7. Xoa point cu trong toDelete.
8. Tra so luong upserted/deleted/unchanged.
```

#### `syncCatalogIndex({ reason })`

Ham sync chinh.

Co bien trang thai:

- `syncRunning`: dang sync.
- `syncPending`: co request sync moi trong luc dang sync.
- `lastSyncAt`
- `lastSyncResult`
- `lastSyncError`
- `lastSyncReason`

Flow:

```txt
Neu dang sync:
  -> danh dau syncPending
  -> tra status queued

Neu khong:
  -> buildCatalogItems
  -> reconcileCatalogPoints
  -> luu lastSyncResult
  -> neu trong luc sync co pending, chay lai mot lan nua
```

#### `requestCatalogSync({ reason, delayMs })`

Dung cho auto sync co debounce.

Neu auto sync tat thi tra `disabled`.

Neu da co timer thi tra `scheduled`.

Neu chua co timer, setTimeout de goi `syncCatalogIndex`.

#### `startCatalogSyncScheduler()`

Neu auto sync bat va interval > 0, tao interval dinh ky sync catalog.

#### `getCatalogSyncStatus()`

Tra trang thai sync hien tai cho admin xem.

### Service retrieve catalog: `catalogRetrieveService.js`

#### `detectProductSearchTerms(query)`

Detect cac nhom tu khoa ve san pham:

- cay thuy sinh
- loc
- phu kien
- den
- phan nen
- thuc an
- ca
- tep

Ham nay giup search truc tiep trong MongoDB, khong chi dua vao vector search.

#### `isTopSellerQuery(query)`

Detect cau hoi dang hoi san pham ban chay/top/pho bien.

#### `isSuggestionQuery(query)`

Detect cau hoi dang muon goi y/de xuat/tu van/tim san pham.

#### `findDirectCatalogProducts({ query, limit })`

Tim product truc tiep trong MongoDB dua tren keyword/category.

Flow:

```txt
1. Detect terms tu query.
2. Tim category phu hop.
3. Tao dieu kien $or cho category/name/tags/description/sku.
4. Sort theo ban chay neu la top seller.
5. Loc san pham con hang.
6. Tra match dang giong Qdrant match.
```

Muc dich: neu vector search fail hoac search san pham can logic truc tiep, chatbot van co ket qua tot.

#### `retrieveCatalogContext({ query })`

Flow:

```txt
1. Tim directMatches tu MongoDB.
2. Embed query.
3. Search Qdrant catalog.
4. Rerank vector matches bang lexical overlap.
5. Gop directMatches va vector matches.
6. Loai trung itemId.
7. Lay top K.
8. Gan citationId.
9. Build contextText.
10. Tra contextText va sources.
```

Neu vector search loi nhung directMatches co ket qua, service van tiep tuc dung directMatches.

## 12. Prompt builders

### `documentPrompt.js`

`buildDocumentPrompt({ question, context, chatHistory })` tao prompt cho mode document.

Nguyen tac:

- Tra loi bang tieng Viet.
- Chi dung context duoc cung cap.
- Dung chat history chi de hieu cau hoi tiep noi.
- Neu context khong du, noi ro khong co du thong tin.
- Khong hien citation ky thuat nhu `[S1]`, chunk ID, score.
- Format de doc, dung heading/bold/numbered sections.

### `catalogPrompt.js`

`buildCatalogPrompt({ question, context, chatHistory })` tao prompt cho mode catalog.

Nguyen tac:

- Tra loi bang tieng Viet.
- Chi dung context catalog.
- Neu co the, neu ten san pham, gia, khuyen mai.
- Khong hien ID ky thuat.
- Khi liet ke san pham, dung format:

```txt
1. **Product name**
Gia: **price**
```

Muc dich: frontend co the bat product name de lam clickable.

## 13. Utility files

### `utils/textUtils.js`

#### `normalizeText(input)`

Gom whitespace va trim.

#### `chunkText(input, chunkSize, overlap)`

Chia text dai thanh cac chunk co overlap.

Muc dich: document dai khong dua het vao prompt, ma cat thanh nhieu doan nho de embedding/search.

### `utils/ragUtils.js`

#### `normalizeRagText(value)`

Chuan hoa text de so khop lexical.

#### `tokenize(value)`

Tach text thanh token, bo stop words co ban.

#### `attachCitationIds(sources)`

Gan citation ID `S1`, `S2`, ...

Citation dung noi bo de map source, prompt yeu cau khong hien trong final answer.

#### `rerankMatchesByLexicalOverlap({ matches, query, preferredSources })`

Sap xep lai ket qua vector search bang cach cong diem neu:

- Text cua match co nhieu token trung voi query.
- Match nam trong preferredSources cua conversation truoc.

Muc dich: ket qua search phu hop hon voi cau hoi thuc te.

## 14. Flow endpoint chi tiet

### Flow 1: Guest chat bang JSON `POST /ai/chat`

```txt
Client
  -> POST /ai/chat
  -> optionalAuthenticateUser
  -> chatOnce
  -> extractAnonymousId
  -> handleAiChat
  -> getOrCreateConversation
       -> neu guest chua co anonymousId thi tao moi
       -> tim conversation ACTIVE cua anonymousId
       -> neu khong co thi tao conversation moi
  -> enforceAnonymousLimit
  -> add user message
  -> routeAiQuery
       -> detect intent
       -> detect mode
       -> retrieve context tu document/catalog neu can
       -> build prompt
       -> generateGeminiAnswer
  -> add assistant message
  -> save conversation
  -> response JSON
```

Ket qua tra ve gom:

- `conversationId`
- `anonymousId`
- `mode`
- `answer`
- `retrievalStrategy`
- `sourceSummary`
- `sources`
- `intent`

### Flow 2: Guest chat bang streaming `POST /ai/chat/stream`

```txt
Client
  -> POST /ai/chat/stream
  -> optionalAuthenticateUser
  -> streamAiChat
  -> setup SSE
  -> handleAiChat voi callbacks onStatus/onMeta/onToken
  -> routeAiQuery gui status retrieving/generating
  -> Gemini stream tung token
  -> server write event message
  -> done
```

Client se nhan event lien tuc thay vi doi full answer.

### Flow 3: Guest bi gioi han 4 cau

```txt
Guest hoi cau 1 -> OK
Guest hoi cau 2 -> OK
Guest hoi cau 3 -> OK
Guest hoi cau 4 -> OK
Guest hoi cau 5 -> enforceAnonymousLimit throw UnauthenticatedError
```

Ly do: truoc khi them message moi, service dem so message `role=user` da co trong conversation. Neu da >= 4 thi bat dang nhap.

### Flow 4: Merge guest session sau khi dang nhap

```txt
Guest da chat voi anonymousId = guest-123
User dang nhap
Frontend goi POST /ai/chat/merge-guest-session
Body: { guestSessionId: "guest-123" }
  -> authenticateUser
  -> mergeGuestChatSession
  -> mergeGuestSession
  -> tim conversation co anonymousId = guest-123 va ACTIVE
  -> gan userId vao conversation
  -> xoa anonymousId
  -> save
  -> tra conversation da merge
```

Muc dich: user khong bi mat lich su chat sau khi dang nhap.

### Flow 5: Lay lai session `GET /ai/chat/session`

```txt
Client
  -> GET /ai/chat/session
  -> optionalAuthenticateUser
  -> getChatSession
  -> getCurrentConversation
       -> neu co conversationId thi lay dung conversation do
       -> neu login thi lay conversation ACTIVE moi nhat cua user
       -> neu guest thi lay conversation ACTIVE moi nhat cua anonymousId
  -> tra conversation
```

Muc dich: khi user mo lai chatbot, frontend co lich su chat de render.

### Flow 6: Admin upload tai lieu

```txt
Admin
  -> POST /ai/documents/upload
  -> authenticateUser
  -> authorizeRoles('admin')
  -> uploadAiDocument.single('file')
  -> uploadDocument
  -> ingestDocument
       -> validate file
       -> extract text
       -> normalize text
       -> chunk text
       -> embed chunks bang Gemini
       -> ensure Qdrant docs collection
       -> upsert chunks vao Qdrant
  -> tra docId/fileHash/chunkCount
```

Muc dich: dua tai lieu vao vector database de chatbot tra loi dua tren tai lieu.

### Flow 7: User hoi ve tai lieu `document_rag`

```txt
User hoi
  -> handleAiChat
  -> routeAiQuery mode document_rag
  -> retrieveDocumentContext
       -> embed query
       -> search Qdrant docs collection
       -> rerank
       -> build contextText
  -> buildDocumentPrompt
  -> generate Gemini answer
  -> luu assistant message + sources
  -> tra cau tra loi
```

Muc dich: chatbot khong tu bia, ma dua vao noi dung tai lieu da upload.

### Flow 8: Admin sync catalog

```txt
Admin
  -> POST /ai/catalog/sync
  -> authenticateUser
  -> authorizeRoles('admin')
  -> syncCatalog
  -> syncCatalogIndex
       -> buildCatalogItems tu Product/Category/Promotion
       -> scrollCatalogPoints tu Qdrant
       -> so sanh contentHash
       -> embed item moi/thay doi
       -> upsert vao Qdrant
       -> delete item khong con ton tai
  -> tra status/counts/changes
```

Muc dich: cap nhat vector database catalog de chatbot biet san pham, gia, coupon moi nhat.

### Flow 9: User hoi ve san pham/catalog `catalog_qa`

```txt
User hoi "co san pham nao ban chay?"
  -> normalizeMode detect catalog_qa
  -> routeAiQuery
  -> retrieveCatalogContext
       -> findDirectCatalogProducts trong MongoDB
       -> embed query
       -> search Qdrant catalog
       -> rerank
       -> gop direct + vector matches
       -> build contextText
  -> buildCatalogPrompt
  -> generate Gemini answer
  -> luu answer va sources
  -> tra response
```

Muc dich: chatbot tro thanh tro ly ban hang, co the goi y san pham, noi gia, ton kho, coupon.

## 15. Muc dich nghiep vu cua module chatbot

Module nay phuc vu cac muc dich:

1. Ho tro khach hang tu dong:
   - Tra loi cau hoi ve san pham.
   - Goi y san pham phu hop.
   - Noi gia, ton kho, khuyen mai neu co du lieu.

2. Hoi dap tren tai lieu noi bo:
   - Admin upload tai lieu.
   - Chatbot tra loi dua tren tai lieu thay vi tra loi chung chung.

3. Tang ty le dang nhap:
   - Guest duoc chat thu 4 cau.
   - Sau do yeu cau dang nhap de tiep tuc.
   - Khi dang nhap, lich su chat guest duoc merge vao tai khoan.

4. Giu ngu canh hoi dap:
   - Conversation luu messages.
   - AI co chatHistory de hieu cau hoi tiep noi.
   - Sources duoc luu de uu tien tai lieu/san pham dang noi den.

5. Tach bach va de bao tri:
   - Route chi khai bao endpoint.
   - Controller chi nhan request/tra response.
   - Service xu ly nghiep vu.
   - Orchestrator dieu phoi AI.
   - Retrieve service chuyen tim context.
   - Gemini/Qdrant service boc API ben ngoai.

## 16. Tom tat de bao cao ngan gon

Neu can trinh bay ngan gon, co the noi:

```txt
server-ai la module chatbot AI cua he thong. Module nay cho phep user hoac guest chat voi bot, luu lich su hoi dap vao MongoDB, gioi han guest 4 cau hoi va ho tro merge lich su guest vao user sau khi dang nhap.

Khi user dat cau hoi, controller goi aiChatService. Service lay hoac tao conversation, kiem tra quyen truy cap, them message user, sau do goi aiOrchestrator. Orchestrator phan loai cau hoi: neu la cau chao/cam on thi tra loi truc tiep; neu la cau hoi tai lieu thi search Qdrant document collection; neu la cau hoi san pham thi search catalog bang MongoDB va Qdrant. Sau khi co context, server build prompt va goi Gemini de sinh cau tra loi. Cau tra loi va sources duoc luu lai vao conversation.

Phan document cho phep admin upload file, server trich text, chia chunk, tao embedding va luu vao Qdrant. Phan catalog cho phep admin sync san pham/khuyen mai tu database ecommerce sang Qdrant de chatbot co the tu van ban hang bang du lieu moi nhat.
```
