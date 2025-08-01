const { getFirestore } = require('../lib/firebase');

/**
 * ランキング取得API
 * GET /api/rankings/get
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
    console.log('🔥 Firestore接続開始...');
    const db = getFirestore();
    console.log('✅ Firestore接続完了');
    
    // ランキングコレクションから上位50件を取得
    console.log('📊 ランキングクエリ実行中...');
    const snapshot = await db.collection('rankings')
      .orderBy('score', 'desc')
      .orderBy('timestamp', 'asc') // 同スコアの場合は早い者勝ち
      .limit(50)
      .get();

    console.log('📋 クエリ結果:', snapshot.size, '件のドキュメント');

    const rankings = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 ドキュメント:', doc.id, data);
      
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
      
      rankings.push({
        id: doc.id,
        score: data.score,
        nickname: data.nickname,
        affiliation: data.affiliation,
        timestamp: timestamp
      });
    });

    console.log('✨ 返却データ:', rankings.length, '件');

    res.status(200).json({
      success: true,
      rankings: rankings,
      count: rankings.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ランキング取得エラー:', error);
    console.error('エラー詳細:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'ランキングの取得に失敗しました',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};