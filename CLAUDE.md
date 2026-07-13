# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JotflowyはWorkflowy公式APIを利用したノートアプリ。Cloudflare Workers上で動作し、フロントエンドにHono JSXを使用。

## Commands

```bash
npm run dev        # 開発サーバー起動 (wrangler dev)
npm run deploy     # Cloudflare Workersへデプロイ
npm run typecheck  # TypeScript型チェック
npm test           # vitestでテスト実行（watchモード）
npm run test:run   # テストを1回実行
npm run test:ui    # vitest UI起動
```

## Testing Policy

- 新機能・バグ修正は必ずテストを先に書く（TDD）
- テストファイルは `src/test/` に配置し、対象モジュール名に合わせて命名（例: `crypto.test.ts`）
- 既存テストパターン（`describe` / `it` / `expect`、vitest）に倣う
- 外部依存（`fetch`、Web Crypto API、`WorkflowyClient`）は `vi.stubGlobal` / `vi.fn()` でモックする
- テスト実行: `npm run test:run`

## Architecture

### Backend (src/)
- `index.tsx` - Honoアプリケーションのエントリーポイント。ルーティング定義
- `api/handlers.ts` - APIエンドポイント実装。認証、ノード操作、URL取得など
- `api/workflowy-v1.ts` - Workflowy API v1クライアント
- `api/crypto.ts` - APIキーの暗号化/復号化
- `types/index.ts` - 共有型定義

### Frontend (public/)
- `scripts/client.js` - UIロジック。LocalStorageで設定保存、APIとの通信
- `scripts/utils.js` - テンプレート処理、パース、エスケープ関数
- `styles/main.css` - スタイル

### Server Components (src/components/)
- `layouts/BaseLayout.tsx` - HTMLベーステンプレート（PWA設定含む）
- `pages/MainPage.tsx` - メインUIのJSX（サーバーサイドレンダリング）

## Key Concepts

- **認証**: APIキーはHTTP-only Cookieに暗号化して保存
- **Daily Note**: Workflowyネイティブカレンダーを使用。送信は `parent_id="today"`（Day NodeはWF側でオンデマンド作成）、履歴は日付キー `YYYY-MM-DD` を1日ずつ遡ってプローブ（404 = その日ノート無し）
- **Destination**: `type: "node" | "calendar"`。旧 `dailyNoteEnabled` は `migrateSettings` がLocalStorage読み込み時に自動変換
- **Template**: `{content}`, `{YYYY}`, `{MM}`, `{DD}`, `{HH}`, `{mm}`, `{ss}` プレースホルダー対応
- **URL展開**: 送信時にプレーンURLをMarkdownリンクに自動変換

## Environment Variables (wrangler.toml)

- `ENCRYPTION_KEY` - APIキー暗号化用キー
- `ALLOWED_ORIGINS` - CORS許可オリジン（カンマ区切り）
