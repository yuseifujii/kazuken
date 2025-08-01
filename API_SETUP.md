# Firebase + Vercel API セットアップガイド

## 必要な環境変数

Vercelプロジェクトに以下の環境変数を設定してください：

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
NODE_ENV=production
```

## セットアップ手順

### 1. Firebaseプロジェクト作成
1. https://console.firebase.google.com/ にアクセス
2. 新しいプロジェクトを作成
3. Firestore Database を作成（asia-northeast1）

### 2. サービスアカウント作成
1. プロジェクト設定 → サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. JSONファイルをダウンロード

### 3. Vercel環境変数設定
1. Vercelダッシュボードでプロジェクトを選択
2. Settings → Environment Variables
3. 上記の環境変数を追加

### 4. Firestoreセキュリティルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rankings/{document} {
      allow read: if true;
      allow write: if false; // API経由のみ
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## APIエンドポイント

- `GET /api/rankings/get` - ランキング取得
- `POST /api/rankings/submit` - スコア送信

## ローカル開発

```bash
npm install
npm run dev
```

ローカル開発時は `.env.local` ファイルに環境変数を設定してください。