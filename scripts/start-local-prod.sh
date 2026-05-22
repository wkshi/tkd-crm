#!/bin/bash
# 本地生产服务器启动脚本
# 用法: ./scripts/start-local-prod.sh [端口]

set -e

PORT=${1:-3000}

echo "🥋 跆拳道 CRM - 本地生产服务器启动"
echo "===================================="

# 检查数据库连接
echo "📡 检查数据库连接..."
if ! npx prisma migrate status > /dev/null 2>&1; then
  echo "❌ 数据库连接失败，请确保 PostgreSQL 已启动"
  echo "   运行: docker compose up -d db"
  exit 1
fi
echo "✅ 数据库连接正常"

# 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
npx prisma generate > /dev/null 2>&1
echo "✅ Prisma Client 就绪"

# 生产构建
echo "🏗️  生产构建..."
NODE_ENV=production npm run build
echo "✅ 构建完成"

# 启动生产服务器
echo "🚀 启动生产服务器 (端口: $PORT)..."
echo "   访问地址: http://localhost:$PORT"
echo "   按 Ctrl+C 停止"
echo ""
NODE_ENV=production npx next start -p $PORT
