# 本地生产服务器启动脚本 (Windows PowerShell)
# 用法: 双击运行或在 PowerShell 中执行 .\scripts\start-local-prod.ps1 [端口]
# 说明: 自动启动独立的生产环境数据库，与开发数据库完全隔离

param(
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

# 生产环境数据库配置（与开发环境隔离）
$PROD_DB_URL = "postgresql://taekwondo:taekwondo123@localhost:5433/taekwondo_crm_prod"
$DB_CONTAINER = "taekwondo-db-prod"

Write-Host "🥋 跆拳道 CRM - 本地生产服务器启动"
Write-Host "===================================="

# 清理函数：退出时自动停止生产数据库容器
function Cleanup {
    Write-Host ""
    Write-Host "🛑 正在停止生产数据库容器..."
    docker compose stop postgres-prod > $null 2>&1
    Write-Host "👋 生产环境已清理"
}

try {
    # 启动生产数据库
    Write-Host "🐘 启动生产数据库容器 ($DB_CONTAINER)..."
    docker compose up -d postgres-prod > $null 2>&1

    # 等待数据库就绪
    Write-Host "⏳ 等待数据库就绪..."
    $ready = $false
    for ($i = 1; $i -le 30; $i++) {
        docker compose exec -T postgres-prod pg_isready -U taekwondo -d taekwondo_crm_prod > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 生产数据库已就绪"
            $ready = $true
            break
        }
        if ($i -eq 30) {
            Write-Host "❌ 数据库启动超时，请检查 Docker 状态"
            exit 1
        }
        Start-Sleep -Seconds 1
    }

    # 使用生产数据库连接字符串
    $env:DATABASE_URL = $PROD_DB_URL

    # 执行数据库迁移
    Write-Host "🔧 执行数据库迁移..."
    npx prisma migrate deploy > $null 2>&1
    Write-Host "✅ 数据库迁移完成"

    # 生成 Prisma Client
    Write-Host "🔧 生成 Prisma Client..."
    npx prisma generate > $null 2>&1
    Write-Host "✅ Prisma Client 就绪"

    # 生产构建
    Write-Host "🏗️  生产构建..."
    $env:NODE_ENV = "production"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 构建失败"
        exit 1
    }
    Write-Host "✅ 构建完成"

    # 启动生产服务器
    Write-Host ""
    Write-Host "🚀 启动生产服务器 (端口: $Port)"
    Write-Host "   数据库: taekwondo_crm_prod (端口 5433)"
    Write-Host "   访问地址: http://localhost:$Port"
    Write-Host "   关闭此窗口即可停止"
    Write-Host ""

    npx next start -p $Port
}
finally {
    Cleanup
}
