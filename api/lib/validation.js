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

module.exports = {
  validateScore,
  validateNickname,
  validateAffiliation,
  getRateLimitKey
};