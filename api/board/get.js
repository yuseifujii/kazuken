const { getFirestore } = require('../lib/firebase');

/**
 * 掲示板投稿取得API
 * GET /api/board/get
 */
module.exports = async (req, res) => {
  // CORS対応
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const db = getFirestore();
    
    // 全体の投稿数を取得
    const totalSnapshot = await db.collection('board').get();
    const totalPosts = totalSnapshot.size;

    // 投稿を時系列順（新しい順）で取得（最大50件）
    const snapshot = await db.collection('board')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const posts = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // タイムスタンプがnullの場合のハンドリング
      let timestamp;
      try {
        timestamp = data.timestamp && data.timestamp.toDate ?
          data.timestamp.toDate().toISOString() :
          new Date().toISOString();
      } catch (timestampError) {
        console.warn('⚠️ タイムスタンプエラー:', timestampError);
        timestamp = new Date().toISOString();
      }

      posts.push({
        id: doc.id,
        nickname: data.nickname || 'Anonymous',
        content: data.content || '',
        timestamp: timestamp,
        isAdmin: data.isAdmin || false
      });
    });

    res.status(200).json({
      success: true,
      posts: posts,
      count: posts.length,
      totalPosts: totalPosts,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 掲示板取得エラー:', error);
    console.error('エラー詳細:', error.stack);
    res.status(500).json({
      success: false,
      error: '投稿の取得に失敗しました',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};