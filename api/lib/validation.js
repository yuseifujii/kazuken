// スコア検証ユーティリティ

/**
 * スコアの妥当性をチェック
 * @param {number} score - 送信されたスコア
 * @param {object} sessionData - ゲームセッションデータ
 * @returns {boolean} - 妥当性
 */
function validateScore(score, sessionData) {
  // 基本的な範囲チェック
  if (score < 0 || score > 10000) {
    return false;
  }

  // スコアが10の倍数でない場合は無効
  if (score % 10 !== 0) {
    return false;
  }

  // 時間ベースの妥当性チェック（最低プレイ時間）
  if (sessionData && sessionData.duration) {
    const minDuration = Math.max(score / 50, 30); // 最低30秒、スコアに応じて増加
    if (sessionData.duration < minDuration) {
      return false;
    }
  }

  return true;
}

/**
 * ニックネームの妥当性をチェック
 * @param {string} nickname - ニックネーム（最大10文字）
 * @returns {boolean} - 妥当性
 */
function validateNickname(nickname) {
  if (!nickname || typeof nickname !== 'string') {
    return false;
  }

  // 長さチェック
  if (nickname.length < 1 || nickname.length > 10) {
    return false;
  }

  // 不適切な文字列のチェック（簡易版）
  const inappropriate = ['admin', 'test', 'null', 'undefined', 'script'];
  if (inappropriate.some(word => nickname.toLowerCase().includes(word))) {
    return false;
  }

  return true;
}

/**
 * 所属の妥当性をチェック
 * @param {string} affiliation - 所属（最大10文字）
 * @returns {boolean} - 妥当性
 */
function validateAffiliation(affiliation) {
  if (!affiliation || typeof affiliation !== 'string') {
    return false;
  }

  // 長さチェック
  if (affiliation.length < 1 || affiliation.length > 10) {
    return false;
  }

  return true;
}

/**
 * レート制限チェック用のキー生成
 * @param {string} ip - IPアドレス
 * @param {string} nickname - ニックネーム
 * @returns {string} - レート制限キー
 */
function getRateLimitKey(ip, nickname) {
  return `rate_limit_${ip}_${nickname}`;
}

/**
 * 掲示板投稿のニックネームの妥当性をチェック
 * @param {string} nickname - ニックネーム（最大15文字）
 * @returns {boolean} - 妥当性
 */
function validatePostNickname(nickname) {
  if (!nickname || typeof nickname !== 'string') {
    return false;
  }
  
  // 長さチェック
  if (nickname.length < 1 || nickname.length > 15) {
    return false;
  }
  
  // 禁止文字チェック（HTML/JS/SQL等の危険文字）
  const forbiddenChars = /<|>|&|"|'|`|\||;|--|\/\*|\*\/|select|insert|update|delete|drop|script/gi;
  if (forbiddenChars.test(nickname)) {
    return false;
  }
  
  return true;
}

/**
 * 掲示板投稿内容の妥当性をチェック
 * @param {string} content - 投稿内容（最大300文字）
 * @returns {boolean} - 妥当性
 */
function validatePostContent(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  // 長さチェック
  if (content.length < 1 || content.length > 300) {
    return false;
  }
  
  // 基本的な不適切内容チェック（改良可能）
  const inappropriateTerms = /spam|広告|宣伝|詐欺|違法|誹謗中傷/gi;
  if (inappropriateTerms.test(content)) {
    return false;
  }
  
  return true;
}

/**
 * HTMLエスケープ処理
 * @param {string} text - エスケープする文字列
 * @returns {string} - エスケープされた文字列
 */
function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;');
}

module.exports = {
  validateScore,
  validateNickname,
  validateAffiliation,
  getRateLimitKey,
  validatePostNickname,
  validatePostContent,
  escapeHtml
};