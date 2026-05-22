#!/bin/bash
# 本地生产服务器启动脚本
# 用法: ./scripts/start-local-prod.sh [端口]
# 说明: 自动启动独立的生产环境数据库，与开发数据库完全隔离

set -e

PORT=${1:-3000}

# 生产环境数据库配置（与开发环境隔离）
PROD_DB_URL="postgresql://taekwondo:taekwondo123@localhost:5433/taekwondo_crm_prod"
DB_CONTAINER="taekwondo-db-prod"

echo "🥋 跆拳道 CRM - 本地生产服务器启动"
echo "===================================="

# 退出时自动停止生产数据库容器
cleanup() {
  echo ""
  echo "🛑 正在停止生产数据库容器..."
  docker compose stop postgres-prod > /dev/null 2>&1 || true
  echo "👋 生产环境已清理"
}
trap cleanup EXIT INT TERM

# 启动生产数据库
echo "🐘 启动生产数据库容器 ($DB_CONTAINER)..."
docker compose up -d postgres-prod > /dev/null 2>&1

# 等待数据库就绪
echo "⏳ 等待数据库就绪..."
for i in {1..30}; do
  if docker compose exec -T postgres-prod pg_isready -U taekwondo -d taekwondo_crm_prod > /dev/null 2>&1; then
    echo "✅ 生产数据库已就绪"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "❌ 数据库启动超时，请检查 Docker 状态"
    exit 1
  fi
  sleep 1
done

# 使用生产数据库连接字符串
export DATABASE_URL="$PROD_DB_URL"

# 执行数据库迁移
echo "🔧 执行数据库迁移..."
npx prisma migrate deploy > /dev/null 2>&1
echo "✅ 数据库迁移完成"

# 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
npx prisma generate > /dev/null 2>&1
echo "✅ Prisma Client 就绪"

# 生产构建
echo "🏗️  生产构建..."
NODE_ENV=production npm run build
echo "✅ 构建完成"

# 启动生产服务器
echo ""
echo "🚀 启动生产服务器 (端口: $PORT)"
echo "   数据库: taekwondo_crm_prod (端口 5433)"
echo "   访问地址: http://localhost:$PORT"
echo "   按 Ctrl+C 停止"
echo ""
NODE_ENV=production npx next start -p $PORT
