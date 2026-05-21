import assert from 'node:assert/strict';
import { chunkText } from '../server-ai/utils/textUtils.js';
import {
  buildPromptHistory,
  buildRetrievalQuery,
  looksIncompleteAnswer,
  normalizeMode
} from '../server-ai/orchestrators/aiOrchestrator.js';
import { buildDocumentPrompt } from '../server-ai/services/documentPrompt.js';

const history = [
  {
    role: 'user',
    content: 'Ban hay cho toi biet nguyen nhan lam o nhiem nuoc be thuy sinh'
  },
  {
    role: 'assistant',
    content: 'Cac nguyen nhan gom bun, thuc an thua va chat thai.'
  }
];

assert.equal(normalizeMode('auto', 'San pham nao dang giam gia?'), 'catalog_qa');
assert.equal(normalizeMode('auto', 'Nguyen nhan lam ban ho ca la gi?'), 'document_rag');

const followUpQuery = buildRetrievalQuery({
  message: 'Hay tra loi dai hon va chi tiet hon',
  chatHistory: history
});
assert.match(followUpQuery, /nguyen nhan lam o nhiem/i);
assert.match(followUpQuery, /tra loi dai hon/i);

const firstTurnQuery = buildRetrievalQuery({
  message: 'Nguyen nhan lam ban ho ca la gi?',
  chatHistory: history
});
assert.equal(firstTurnQuery, 'Nguyen nhan lam ban ho ca la gi?');

const promptHistory = buildPromptHistory(history);
assert.match(promptHistory, /User:/);
assert.match(promptHistory, /Assistant:/);

const prompt = buildDocumentPrompt({
  question: 'Hay giai thich',
  context: '[1] Bun va thuc an thua lam nuoc ban.',
  chatHistory: promptHistory
});
assert.match(prompt, /Answer in clear Vietnamese/);
assert.match(prompt, /Recent chat history/);
assert.match(prompt, /Do not stop after an unfinished sentence/);
assert.equal(looksIncompleteAnswer('Bun: Duoc tao'), true);
assert.equal(
  looksIncompleteAnswer(
    'Bun, thuc an thua va chat thai ca la cac nguon lam nuoc be thuy sinh nhanh ban. Khi chung phan huy, chung tao ra hop chat huu co, lam tang doc to va khien he vi sinh trong be qua tai. Vi vay nguoi nuoi can hut can, cho an vua du va thay nuoc dinh ky.'
  ),
  false
);

const chunks = chunkText('a '.repeat(1200), 500, 100);
assert.ok(chunks.length > 1);
assert.ok(chunks.every((chunk) => chunk.length <= 500));

console.log('AI phase 5/6 verification passed.');
