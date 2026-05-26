import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chunkText } from '../server-ai/utils/textUtils.js';
import {
  buildPromptHistory,
  buildRetrievalQuery,
  looksIncompleteAnswer,
  normalizeMode
} from '../server-ai/orchestrators/aiOrchestrator.js';
import { buildDocumentPrompt } from '../server-ai/services/documentPrompt.js';
import { detectAiIntent } from '../server-ai/services/intentRouter.js';
import { attachCitationIds, rerankMatchesByLexicalOverlap } from '../server-ai/utils/ragUtils.js';

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
assert.equal(detectAiIntent('Xin chao').intent, 'behavior');
assert.equal(detectAiIntent('ban khoe khong ?').intent, 'behavior');
assert.equal(detectAiIntent('shop oi').intent, 'behavior');
assert.equal(detectAiIntent('Nguyen nhan lam o nhiem nuoc la gi?').intent, 'knowledge_query');

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
assert.match(prompt, /Do not show technical citation markers/);
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

const citedSources = attachCitationIds([{ title: 'doc.pdf' }, { title: 'catalog item' }]);
assert.equal(citedSources[0].citationId, 'S1');
assert.equal(citedSources[1].citationId, 'S2');

const reranked = rerankMatchesByLexicalOverlap({
  query: 'nguyen nhan o nhiem nuoc',
  matches: [
    { score: 0.7, payload: { text: 'cay thuy sinh can anh sang' } },
    { score: 0.6, payload: { text: 'nguyen nhan o nhiem nuoc gom bun va chat thai' } }
  ]
});
assert.match(reranked[0].payload.text, /o nhiem nuoc/);

const evalCases = JSON.parse(
  fs.readFileSync(new URL('../server-ai/evaluation/ai-eval-cases.json', import.meta.url), 'utf8')
);
assert.ok(evalCases.length >= 4);
assert.ok(evalCases.every((item) => item.id && item.message && item.expectedIntent));

console.log('AI phase 5/6 verification passed.');
