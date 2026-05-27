# 跆拳道馆 CRM 生产镜像
# 使用多阶段构建，最终镜像仅包含运行所需文件

# ─── 构建阶段 ───
FROM node:22-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 先复制依赖文件，利用 Docker 缓存层
COPY package.json package-lock.json* ./
RUN npm ci

# 复制 Prisma Schema 并生成客户端
COPY prisma ./prisma/
RUN npx prisma generate

# 复制源码并构建
COPY . .
ENV DOCKER_DEPLOY=true
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── 运行阶段 ───
FROM node:22-alpine AS runner

# 安装 PostgreSQL 客户端（备份/恢复功能依赖 pg_dump / psql）
RUN apk add --no-cache postgresql-client

WORKDIR /app

ENV NODE_ENV=production
ENV DOCKER_DEPLOY=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 创建非 root 用户运行应用
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 创建 uploads 目录并授权
RUN mkdir -p /app/public/uploads/students /app/public/uploads/coaches && \
    chown -R nextjs:nodejs /app/public/uploads

# 从构建阶段复制必要文件
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json* ./

# 单独安装 Prisma CLI（用于启动时执行 migrate deploy）
RUN npm install -g prisma && \
    npm cache clean --force

USER nextjs

EXPOSE 3000

# 启动前执行数据库迁移，然后启动应用
CMD ["sh", "-c", "prisma migrate deploy && node server.js"]
