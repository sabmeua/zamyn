# Phase 1 Week 1-2 テスト手順

## 前提条件

- Node.js 20以上
- pnpm 8以上
- Docker & Docker Compose
- PostgreSQL 16（Dockerで起動）

## セットアップ手順

### 1. リポジトリのクローンとブランチのチェックアウト

```bash
# リポジトリをクローン（既にクローン済みの場合はスキップ）
git clone https://github.com/sabmeua/zamyn.git
cd zamyn

# Phase 1のブランチをチェックアウト
git fetch origin
git checkout devin/1764239092-phase1-core
```

### 2. 依存関係のインストール

```bash
# ルートディレクトリで実行
pnpm install
```

### 3. Docker サービスの起動

```bash
# PostgreSQLとRedisを起動
docker-compose up -d postgres redis

# サービスが起動したことを確認
docker-compose ps
```

### 4. 環境変数の設定

```bash
# バックエンドの環境変数をコピー
cp apps/backend/.env.example apps/backend/.env

# フロントエンドの環境変数をコピー
cp apps/frontend/.env.example apps/frontend/.env.local
```

`apps/backend/.env` の内容を確認：
```env
DATABASE_URL="postgresql://zamyn_user:zamyn_password@localhost:5432/zamyn_dev"
JWT_SECRET="your-secret-key-change-in-production"
REDIS_URL="redis://localhost:6379"
```

### 5. データベースマイグレーションの実行

```bash
cd apps/backend

# Prismaマイグレーションを実行
pnpm dlx prisma migrate dev

# Prisma Clientを生成（postinstallで自動実行されますが、念のため）
pnpm dlx prisma generate

# マイグレーション状態を確認
pnpm dlx prisma migrate status
```

**期待される結果:**
- `20251127102829_add_all_entities` マイグレーションが適用される
- 14個のテーブルが作成される（users, roles, departments, workflows, workflow_states, workflow_actions, tickets, ticket_comments, ticket_attachments, ticket_histories, integrations, external_messages, saved_filters, notifications）

### 6. データベースの確認（オプション）

Prisma Studioでデータベースを確認：

```bash
cd apps/backend
pnpm dlx prisma studio
```

ブラウザで `http://localhost:5555` が開き、全てのテーブルが表示されます。

### 7. バックエンドサーバーの起動

```bash
# apps/backendディレクトリで実行
cd apps/backend
pnpm run start:dev
```

**期待される結果:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] LOG [InstanceLoader] AuthModule dependencies initialized
[Nest] LOG [InstanceLoader] FilesModule dependencies initialized
[Nest] LOG [InstanceLoader] WorkflowsModule dependencies initialized
[Nest] LOG [InstanceLoader] TicketsModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application is running on: http://localhost:3001
```

## API テスト手順

### 8. ユーザー登録とログイン

新しいターミナルを開いて以下を実行：

```bash
# ユーザー登録
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

**期待される結果:**
```json
{
  "id": "...",
  "username": "testuser",
  "email": "test@example.com",
  "displayName": "Test User",
  "role": {"name": "user"}
}
```

**注意:** 登録はユーザーを作成するだけで、access_tokenは返されません。次にログインしてトークンを取得します。

```bash
# ログイン
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**期待される結果:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "displayName": "Test User",
    "role": "user"
  }
}
```

**重要:** `access_token` の値をコピーして、以降のリクエストで使用します。

環境変数に設定：
```bash
export TOKEN="ここにaccess_tokenの値を貼り付け"
```

### 9. ワークフローの作成

```bash
# ワークフローを作成
curl -X POST http://localhost:3001/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "サポートチケット",
    "description": "カスタマーサポート用のワークフロー",
    "isActive": true,
    "customProperties": {}
  }'
```

**期待される結果:**
```json
{
  "id": "workflow-uuid",
  "name": "サポートチケット",
  "description": "カスタマーサポート用のワークフロー",
  "isActive": true,
  "states": [],
  "actions": [],
  ...
}
```

**重要:** `id` の値をコピーして、以降のリクエストで使用します。

```bash
export WORKFLOW_ID="ここにworkflow idを貼り付け"
```

### 10. ワークフローステートの作成

```bash
# 初期ステート（新規）を作成
curl -X POST http://localhost:3001/workflows/$WORKFLOW_ID/states \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "new",
    "displayName": "新規",
    "color": "#3B82F6",
    "position": {"x": 100, "y": 100},
    "isInitial": true,
    "isFinal": false,
    "requiredProperties": {},
    "assignConfig": {}
  }'
```

**期待される結果:**
```json
{
  "id": "state-uuid-1",
  "name": "new",
  "displayName": "新規",
  "color": "#3B82F6",
  "isInitial": true,
  ...
}
```

```bash
export STATE_NEW="ここにstate idを貼り付け"
```

```bash
# 進行中ステートを作成
curl -X POST http://localhost:3001/workflows/$WORKFLOW_ID/states \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "in_progress",
    "displayName": "進行中",
    "color": "#F59E0B",
    "position": {"x": 300, "y": 100},
    "isInitial": false,
    "isFinal": false,
    "requiredProperties": {},
    "assignConfig": {}
  }'
```

```bash
export STATE_IN_PROGRESS="ここにstate idを貼り付け"
```

```bash
# 完了ステートを作成
curl -X POST http://localhost:3001/workflows/$WORKFLOW_ID/states \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "done",
    "displayName": "完了",
    "color": "#10B981",
    "position": {"x": 500, "y": 100},
    "isInitial": false,
    "isFinal": true,
    "requiredProperties": {},
    "assignConfig": {}
  }'
```

```bash
export STATE_DONE="ここにstate idを貼り付け"
```

### 11. ワークフローアクションの作成

```bash
# 新規→進行中のアクションを作成
curl -X POST http://localhost:3001/workflows/$WORKFLOW_ID/actions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "開始",
    "triggerType": "MANUAL",
    "fromStateId": "'$STATE_NEW'",
    "toStateId": "'$STATE_IN_PROGRESS'",
    "order": 1,
    "sideEffects": {}
  }'
```

```bash
# 進行中→完了のアクションを作成
curl -X POST http://localhost:3001/workflows/$WORKFLOW_ID/actions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "完了",
    "triggerType": "MANUAL",
    "fromStateId": "'$STATE_IN_PROGRESS'",
    "toStateId": "'$STATE_DONE'",
    "order": 2,
    "sideEffects": {}
  }'
```

### 12. チケットの作成

```bash
# チケットを作成
curl -X POST http://localhost:3001/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "workflowId": "'$WORKFLOW_ID'",
    "currentStateId": "'$STATE_NEW'",
    "title": "ログインできない問題",
    "description": "ユーザーがログインできないと報告しています",
    "priority": "HIGH",
    "tags": ["ログイン", "緊急"],
    "requesterEmail": "customer@example.com",
    "requesterName": "山田太郎"
  }'
```

**期待される結果:**
```json
{
  "id": "ticket-uuid",
  "ticketNumber": "TICKET-000001",
  "title": "ログインできない問題",
  "description": "ユーザーがログインできないと報告しています",
  "priority": "HIGH",
  ...
}
```

**重要:** チケット番号が `TICKET-000001` 形式で自動生成されることを確認してください。

```bash
export TICKET_ID="ここにticket idを貼り付け"
```

### 13. コメントの追加

```bash
# チケットにコメントを追加
curl -X POST http://localhost:3001/tickets/$TICKET_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "調査を開始しました。ログを確認中です。",
    "isInternal": false
  }'
```

**期待される結果:**
```json
{
  "id": "comment-uuid",
  "content": "調査を開始しました。ログを確認中です。",
  "isInternal": false,
  "user": {
    "id": "...",
    "username": "testuser",
    "displayName": "Test User"
  },
  ...
}
```

### 14. 添付ファイルのアップロード

```bash
# テスト用ファイルを作成
echo "これはテストファイルです" > /tmp/test.txt

# ファイルをアップロード
curl -X POST http://localhost:3001/tickets/$TICKET_ID/attachments \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test.txt"
```

**期待される結果:**
```json
{
  "id": "attachment-uuid",
  "filename": "test.txt",
  "fileSize": 33,
  "mimeType": "text/plain",
  "uploadedBy": {
    "id": "...",
    "username": "testuser",
    "displayName": "Test User"
  },
  ...
}
```

### 15. チケットの検索

```bash
# テキスト検索
curl -X POST http://localhost:3001/tickets/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "ログイン"
  }'
```

```bash
# タグで検索
curl -X POST http://localhost:3001/tickets/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tags": ["緊急"]
  }'
```

```bash
# 優先度で検索
curl -X POST http://localhost:3001/tickets/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "priority": "HIGH"
  }'
```

### 16. チケット詳細の取得

```bash
# チケット詳細を取得（コメント、添付ファイル、履歴を含む）
curl -X GET http://localhost:3001/tickets/$TICKET_ID \
  -H "Authorization: Bearer $TOKEN"
```

**期待される結果:**
- チケット情報
- コメント一覧
- 添付ファイル一覧
- 変更履歴（CREATED、COMMENTED、ATTACHMENT_ADDED）

## バリデーションテスト

### 17. 初期ステートの重複チェック

```bash
# 2つ目の初期ステートを作成しようとする（エラーになるはず）
curl -X POST http://localhost:3001/workflows/$WORKFLOW_ID/states \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "another_initial",
    "displayName": "もう一つの初期",
    "color": "#FF0000",
    "position": {"x": 100, "y": 300},
    "isInitial": true,
    "isFinal": false,
    "requiredProperties": {},
    "assignConfig": {}
  }'
```

**期待される結果:**
```json
{
  "statusCode": 400,
  "message": "Workflow already has an initial state",
  "error": "Bad Request"
}
```

### 18. 初期ステートの削除防止チェック

```bash
# 初期ステートを削除しようとする（エラーになるはず）
curl -X DELETE http://localhost:3001/workflows/$WORKFLOW_ID/states/$STATE_NEW \
  -H "Authorization: Bearer $TOKEN"
```

**期待される結果:**
```json
{
  "statusCode": 400,
  "message": "Cannot delete the initial state",
  "error": "Bad Request"
}
```

## トラブルシューティング

### TypeScript エラーが出る場合

```bash
# 1. 依存関係を再インストール
pnpm install

# 2. Prisma Clientを明示的に再生成
cd apps/backend
pnpm dlx prisma generate

# 3. 実行中のdev:backendを停止（Ctrl+C）

# 4. ビルドキャッシュをクリア
rm -rf dist

# 5. バックエンドを再起動
pnpm run start:dev
```

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
docker-compose ps postgres

# ログを確認
docker-compose logs postgres
```

### マイグレーションエラー

```bash
# マイグレーション状態を確認
cd apps/backend
pnpm dlx prisma migrate status

# マイグレーションをリセット（開発環境のみ）
pnpm dlx prisma migrate reset
```

### ポート競合エラー

```bash
# ポート3001が使用中か確認
lsof -i :3001

# ポート5432が使用中か確認
lsof -i :5432
```

## クリーンアップ

テスト後にデータベースをクリーンアップする場合：

```bash
# Dockerサービスを停止
docker-compose down

# データベースボリュームも削除する場合
docker-compose down -v
```

## 次のステップ

Phase 1 Week 1-2のテストが完了したら：

1. PRをレビュー
2. 問題があればPRにコメント
3. 問題なければPRをマージ
4. Phase 1 Week 3以降の開発に進む

## 参考情報

- PR: https://github.com/sabmeua/zamyn/pull/2
- Devinセッション: https://app.devin.ai/sessions/d4eefdb6302241248bd5250b2009bf16
- Prismaドキュメント: https://www.prisma.io/docs
- NestJSドキュメント: https://docs.nestjs.com
