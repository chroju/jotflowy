# CI/CDセットアップガイド

このプロジェクトには自動化されたテストとデプロイメントのワークフローが設定されています。

## GitHub Actions ワークフロー

### 1. テストワークフロー (`.github/workflows/test.yml`)

**トリガー:**
- プルリクエストが作成または更新された時
- mainブランチへのpush時

**動作:**
- Node.js 18と20でテストを実行
- 依存関係をインストール (`npm ci`)
- ユニットテストを実行 (`npm run test:run`)
- TypeScript型チェックを実行 (`npm run typecheck`)

### 2. デプロイワークフロー (`.github/workflows/deploy.yml`)

**トリガー:**
- mainブランチへのpush時（PRマージ後）

**動作:**
1. テストとtype checkを実行
2. すべてのチェックが通った場合、自動的にCloudflare Workersにデプロイ

## Cloudflareシークレット設定

デプロイを有効にするには、以下のGitHubシークレットを設定する必要があります：

### 必要なシークレット

1. **CLOUDFLARE_API_TOKEN**
   - CloudflareダッシュボードでAPI tokenを作成
   - 必要な権限: `Workers:Edit`, `Zone:Read`

2. **CLOUDFLARE_ACCOUNT_ID**
   - CloudflareダッシュボードのAccount IDを使用

### シークレット設定手順

1. GitHubリポジトリの「Settings」タブに移動
2. 左メニューから「Secrets and variables」→「Actions」を選択
3. 「New repository secret」をクリック
4. 各シークレットを追加：
   - Name: `CLOUDFLARE_API_TOKEN`, Value: あなたのAPI token
   - Name: `CLOUDFLARE_ACCOUNT_ID`, Value: あなたのAccount ID

## 開発フロー

1. **新機能開発**:
   ```bash
   git checkout -b feature/new-feature
   # 開発作業
   git push origin feature/new-feature
   ```

2. **プルリクエスト作成**:
   - PR作成時に自動テストが実行される
   - すべてのテストが通ることを確認

3. **マージ**:
   - PRがmainにマージされると自動デプロイが実行される

## ローカルテスト

デプロイ前にローカルでテストを実行：

```bash
# ユニットテスト
npm run test:run

# TypeScript型チェック
npm run typecheck

# 開発サーバー起動
npm run dev
```

## トラブルシューティング

### よくある問題

1. **型チェックエラー**
   - `DOM`ライブラリタイプが含まれていることを確認
   - `vitest/globals`と`node`のtypesが設定されていることを確認

2. **デプロイ失敗**
   - CloudflareシークレットがGitHubに正しく設定されているか確認
   - wrangler.tomlの設定を確認

3. **テスト失敗**
   - localStorage mock設定を確認
   - jsdom環境設定を確認

### ログの確認

- GitHub ActionsのログはGitHubリポジトリの「Actions」タブで確認可能
- デプロイログはCloudflareダッシュボードでも確認可能