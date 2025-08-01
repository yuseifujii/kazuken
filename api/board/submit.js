const { getFirestore } = require('../lib/firebase');
const { validatePostNickname, validatePostContent, escapeHtml } = require('../lib/validation');
const admin = require('firebase-admin');

/**
 * 掲示板投稿送信API
 * POST /api/board/submit
 */
module.exports = async (req, res) => {
  // CORS対応
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { nickname, content } = req.body;

    // 入力値のバリデーション
    if (!validatePostNickname(nickname)) {
      return res.status(400).json({ 
        success: false, 
        error: 'ニックネームが無効です（1-15文字、特殊文字不可）' 
      });
    }

    if (!validatePostContent(content)) {
      return res.status(400).json({ 
        success: false, 
        error: '投稿内容が無効です（1-300文字、不適切な内容は禁止）' 
      });
    }

    // HTMLエスケープ処理（セキュリティ対策）
    const escapedNickname = escapeHtml(nickname);
    const escapedContent = escapeHtml(content);

    const db = getFirestore();
    const newPost = {
      nickname: escapedNickname,
      content: escapedContent,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isAdmin: false, // 将来的に管理者投稿機能用
    };

    // Firestoreに投稿を保存
    await db.collection('board').add(newPost);

    res.status(200).json({ 
      success: true, 
      message: '投稿が正常に送信されました。' 
    });

  } catch (error) {
    console.error('掲示板投稿エラー:', error);
    res.status(500).json({
      success: false,
      error: '投稿の送信に失敗しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};