const admin = require('firebase-admin');

let app;

function getFirebaseApp() {
  if (!app) {
    try {
      // 環境変数から秘密鍵を取得
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('Firebase環境変数が設定されていません');
      }

      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
      });
    } catch (error) {
      // すでに初期化されている場合
      if (error.code === 'app/duplicate-app') {
        app = admin.app();
      } else {
        throw error;
      }
    }
  }
  return app;
}

function getFirestore() {
  const app = getFirebaseApp();
  return admin.firestore(app);
}

module.exports = {
  getFirebaseApp,
  getFirestore,
  admin
};