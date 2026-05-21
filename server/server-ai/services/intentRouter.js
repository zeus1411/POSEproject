const BEHAVIOR_PATTERNS = [
  /^(hi|hello|hey|xin chao|chao|chao ban|alo|hello bot)$/i,
  /^(cam on|thanks|thank you|ok|oke|duoc roi|tot|hay qua)$/i,
  /^(bye|goodbye|tam biet|hen gap lai)$/i,
  /(ban la ai|bot la ai|ban lam duoc gi|huong dan su dung|cach dung)/
];

const KNOWLEDGE_HINTS = [
  'tai lieu',
  'pdf',
  'file',
  'chinh sach',
  'quy trinh',
  'nguyen nhan',
  'vi sao',
  'tai sao',
  'nhu the nao',
  'la gi',
  'bao nhieu',
  'san pham',
  'gia',
  'khuyen mai',
  'coupon',
  'giam gia',
  'bao hanh',
  'doi tra',
  'van chuyen',
  'ho ca',
  'be thuy sinh',
  'o nhiem',
  'nuoc'
];

const normalizeIntentText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\p{L}\p{N}\s?]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const detectAiIntent = (message) => {
  const normalized = normalizeIntentText(message);
  if (!normalized) {
    return {
      intent: 'ambiguous',
      shouldSearch: true,
      reason: 'empty_or_blank'
    };
  }

  const isBehavior = BEHAVIOR_PATTERNS.some((pattern) => pattern.test(normalized));
  if (isBehavior && normalized.length <= 80) {
    return {
      intent: 'behavior',
      shouldSearch: false,
      reason: 'behavior_pattern'
    };
  }

  const hasKnowledgeHint = KNOWLEDGE_HINTS.some((hint) => normalized.includes(hint));
  if (hasKnowledgeHint || normalized.endsWith('?')) {
    return {
      intent: 'knowledge_query',
      shouldSearch: true,
      reason: hasKnowledgeHint ? 'knowledge_hint' : 'question_mark'
    };
  }

  return {
    intent: 'ambiguous',
    shouldSearch: true,
    reason: 'default_force_search'
  };
};

const buildBehaviorAnswer = (message) => {
  const normalized = normalizeIntentText(message);

  if (/cam on|thanks|thank you/.test(normalized)) {
    return 'Không có gì, mình luôn sẵn sàng hỗ trợ bạn về tài liệu, sản phẩm, giá và khuyến mãi.';
  }

  if (/bye|goodbye|tam biet|hen gap lai/.test(normalized)) {
    return 'Tạm biệt bạn. Khi cần hỏi về tài liệu hoặc sản phẩm, bạn cứ mở lại trợ lý AI nhé.';
  }

  if (/ban la ai|bot la ai|ban lam duoc gi|huong dan su dung|cach dung/.test(normalized)) {
    return [
      'Mình là trợ lý AI của AquaticPose.',
      'Bạn có thể hỏi mình về tài liệu đã upload, sản phẩm, giá, tồn kho hoặc khuyến mãi.',
      'Với câu hỏi cần dữ liệu, mình sẽ tìm trong nguồn nội bộ trước rồi trả lời kèm nguồn tham khảo.'
    ].join('\n');
  }

  return 'Xin chào, mình có thể hỗ trợ bạn tra cứu tài liệu, sản phẩm, giá và khuyến mãi. Bạn muốn hỏi nội dung nào?';
};

export {
  detectAiIntent,
  buildBehaviorAnswer,
  normalizeIntentText
};
