# 献金管理 - 月次財政報告システム

教会の献金・財政を管理するウェブアプリケーションです。  
現行のExcelマクロ付きファイルの運用をウェブアプリに置き換え、全国の教会からブラウザで利用できるようにします。

## 主要機能

| 機能 | パス | 説明 |
|------|------|------|
| ダッシュボード | `/` | 年間KPI、収支グラフ、残高推移、献金内訳、月別報告状況 |
| 月次報告 | `/monthly` | 収入の部（8カテゴリ）・支出の部（11カテゴリ）の入力、振込情報、月締め |
| 年間推移 | `/annual` | 全科目の12ヶ月分金額一覧（年間合計・月平均付き） |
| 基礎データ | `/settings` | 教会名、年度、宣教会会費割合、前年繰越残高等の設定 |

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **グラフ**: Recharts
- **データベース**: PostgreSQL (Prisma ORM)
- **デプロイ**: Vercel + Vercel Postgres

## セットアップ

### 前提条件

- Node.js 18以上
- PostgreSQLデータベース（ローカル or Vercel Postgres / Neon）

### 手順

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env に DATABASE_URL を設定

# データベースのマイグレーション
npx prisma migrate dev

# 開発サーバーの起動
npm run dev
```

`http://localhost:3000` でアクセスできます。

## Vercelへのデプロイ

1. このリポジトリをVercelにインポート
2. Vercelダッシュボードで **Storage > Postgres** を追加
3. `DATABASE_URL` が自動的に環境変数に設定されます
4. デプロイ後、以下を実行してテーブルを作成：
   ```bash
   npx prisma migrate deploy
   ```

## プロジェクト構成

```
src/
├── app/
│   ├── api/           # APIルート (church, reports, entries, transfers)
│   ├── annual/        # 年間推移ページ
│   ├── monthly/       # 月次報告ページ
│   ├── settings/      # 基礎データ設定ページ
│   ├── layout.tsx     # 共通レイアウト（サイドバー）
│   └── page.tsx       # ダッシュボード
├── components/
│   └── Sidebar.tsx    # サイドナビゲーション
├── lib/
│   ├── accounts.ts    # 勘定科目マスターデータ
│   ├── prisma.ts      # Prismaクライアント
│   └── utils.ts       # ユーティリティ関数
└── generated/prisma/  # Prisma生成コード（gitignore対象）

prisma/
├── schema.prisma      # データベーススキーマ
└── migrations/        # マイグレーションファイル
```
