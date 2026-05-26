const BEHAVIOR_PATTERNS = [
  /^(hi|hello|hey|xin chao|chao|chao ban|alo|hello bot)$/i,
  /^(xin chao ban|chao shop|xin chao shop|shop oi|shop oi cho minh hoi)$/i,
  /^(ban\s+)?(co\s+)?khoe\s+khong\s*\??$/i,
  /^(ban\s+)?(van\s+)?khoe\s+chu\s*\??$/i,
  /^(hom nay\s+)?(ban\s+)?the nao\s*\??$/i,
  /^(bot\s+)?(co\s+)?on\s+khong\s*\??$/i,
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
    return 'Không có gì nha. Nếu bạn cần chọn sản phẩm cho hồ cá hoặc muốn xem khuyến mãi đang có, mình hỗ trợ bạn ngay.';
  }

  if (/khoe khong|khoe chu|the nao|on khong/.test(normalized)) {
    return 'Mình khỏe, cảm ơn bạn đã hỏi. Hôm nay bạn muốn tìm sản phẩm nào cho hồ thủy sinh của mình?';
  }

  if (/bye|goodbye|tam biet|hen gap lai/.test(normalized)) {
    return 'Tạm biệt bạn, hẹn gặp lại nhé. Chúc hồ cá của bạn luôn khỏe và đẹp.';
  }

  if (/ban la ai|bot la ai|ban lam duoc gi|huong dan su dung|cach dung/.test(normalized)) {
    return [
      'Mình là trợ lý AI của AquaticPose.',
      'Mình có thể gợi ý sản phẩm cho hồ thủy sinh, kiểm tra giá, khuyến mãi, tồn kho và hỗ trợ các câu hỏi cơ bản về chăm sóc hồ cá.'
    ].join('\n');
  }

  if (/shop oi|chao shop/.test(normalized)) {
    return 'Chào bạn, AquaticPose có thể hỗ trợ gì cho hồ thủy sinh của bạn hôm nay? Bạn đang muốn tìm thức ăn, vi sinh, cây thủy sinh hay phụ kiện?';
  }

  return 'Xin chào bạn, hôm nay bạn có nhu cầu như thế nào? Bạn muốn tìm sản phẩm gì để phục vụ cho hồ thủy sinh của mình?';
};

export {
  detectAiIntent,
  buildBehaviorAnswer,
  normalizeIntentText
};
