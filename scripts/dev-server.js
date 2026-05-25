#!/usr/bin/env node
/**
 * 开发服务器守护进程
 *
 * 解决问题：
 * 1. Next.js 开发服务器偶发崩溃后无法自动恢复
 * 2. Turbopack 长时间运行后可能进入假死状态（进程在但无响应）
 * 3. 崩溃重启时端口残留占用
 * 4. Turbopack 连续崩溃后自动回退到 webpack 模式
 * 5. 优雅处理进程信号，避免僵尸进程
 */

import { spawn } from "child_process"
import http from "http"
import process from "process"

const PORT = parseInt(process.env.DEV_SERVER_PORT || "3000", 10)
const HEARTBEAT_INTERVAL_MS = 30_000
const HEALTH_CHECK_INTERVAL_MS = 30_000
const HEALTH_CHECK_TIMEOUT_MS = 10_000
const CRASH_RESTART_DELAY_MS = 3_000
const MAX_RESTARTS = 10
const MAX_TURBO_CRASHES = 3

let nextProcess = null
let heartbeatTimer = null
let healthCheckTimer = null
let restartCount = 0
let turboCrashCount = 0
let isShuttingDown = false
let useTurbopack = true

function log(message) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`)
}

/**
 * 检查端口是否已被占用
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      res.resume()
      resolve(true)
    })
    req.on("error", () => resolve(false))
    req.setTimeout(2000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

/**
 * 对 localhost:PORT 执行 HTTP 健康检查
 */
function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PORT}/`, (res) => {
      res.resume()
      resolve(res.statusCode < 500)
    })
    req.on("error", () => resolve(false))
    req.setTimeout(HEALTH_CHECK_TIMEOUT_MS, () => {
      req.destroy()
      resolve(false)
    })
  })
}

/**
 * 获取当前启动参数
 */
function getDevArgs() {
  const args = ["dev"]
  if (useTurbopack) args.push("--turbopack")
  return args
}

/**
 * 启动 Next.js 开发服务器
 */
async function startDevServer() {
  if (isShuttingDown) return

  // 检查端口占用，等待释放
  if (await isPortInUse(PORT)) {
    log(`⚠️ 端口 ${PORT} 被占用，等待释放...`)
    let waited = 0
    while (await isPortInUse(PORT)) {
      await new Promise((r) => setTimeout(r, 1000))
      waited += 1
      if (waited > 10) {
        log(`❌ 端口 ${PORT} 10 秒后仍被占用，无法启动`)
        process.exit(1)
      }
    }
    log(`✅ 端口 ${PORT} 已释放`)
  }

  const args = getDevArgs()
  log(`🚀 启动 Next.js 开发服务器${useTurbopack ? " (Turbopack)" : ""}...`)

  nextProcess = spawn("next", args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
    env: process.env,
  })

  // 手动转发子进程输出（避免 inherit 带来的信号/stdio 耦合问题）
  nextProcess.stdout.on("data", (data) => process.stdout.write(data))
  nextProcess.stderr.on("data", (data) => process.stderr.write(data))

  nextProcess.on("exit", (code, signal) => {
    if (isShuttingDown) return

    if (signal) {
      log(`⚠️ 开发服务器被信号 ${signal} 终止`)
    } else if (code !== 0) {
      log(`❌ 开发服务器异常退出，exit code: ${code}`)
      if (useTurbopack) {
        turboCrashCount++
        if (turboCrashCount >= MAX_TURBO_CRASHES) {
          log(
            `⚠️ Turbopack 连续崩溃 ${turboCrashCount} 次，回退到 webpack 模式`,
          )
          useTurbopack = false
        }
      }
    } else {
      log("✅ 开发服务器正常退出")
      shutdown()
      return
    }

    restartCount++
    if (restartCount > MAX_RESTARTS) {
      log(`🚫 重启次数超过上限 (${MAX_RESTARTS})，放弃重试`)
      process.exit(1)
    }

    log(
      `🔄 ${CRASH_RESTART_DELAY_MS / 1000} 秒后尝试第 ${restartCount} 次重启...`,
    )
    setTimeout(startDevServer, CRASH_RESTART_DELAY_MS)
  })
}

/**
 * 定期打印心跳日志
 */
function startHeartbeat() {
  heartbeatTimer = setInterval(() => {
    if (!isShuttingDown) {
      log(`💓 heartbeat — 运行中 (Turbopack: ${useTurbopack})`)
    }
  }, HEARTBEAT_INTERVAL_MS)
}

/**
 * 定期 HTTP 健康检查，无响应则主动重启
 */
function startHealthCheck() {
  let failureCount = 0
  healthCheckTimer = setInterval(async () => {
    if (isShuttingDown || !nextProcess) return
    const healthy = await checkHealth()
    if (!healthy) {
      failureCount++
      log(
        `❌ 健康检查失败 (${failureCount}/3)，开发服务器无响应`,
      )
      if (failureCount >= 3) {
        log(`🔄 连续 3 次健康检查失败，准备强制重启...`)
        failureCount = 0
        if (nextProcess && !nextProcess.killed) {
          nextProcess.kill("SIGTERM")
        }
      }
    } else {
      if (failureCount > 0) {
        log("✅ 健康检查恢复")
        failureCount = 0
      }
    }
  }, HEALTH_CHECK_INTERVAL_MS)
}

/**
 * 优雅关闭
 */
function shutdown() {
  if (isShuttingDown) return
  isShuttingDown = true

  log("🛑 正在关闭开发服务器...")
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer)
    healthCheckTimer = null
  }

  if (nextProcess && !nextProcess.killed) {
    nextProcess.kill("SIGTERM")
    // 5 秒后若仍未退出则强制关闭
    setTimeout(() => {
      if (nextProcess && !nextProcess.killed) {
        nextProcess.kill("SIGKILL")
      }
    }, 5000)
  } else {
    process.exit(0)
  }
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
process.on("SIGHUP", shutdown)

process.on("uncaughtException", (err) => {
  log(`💥 未捕获异常: ${err.message}`)
  console.error(err)
  shutdown()
})

process.on("unhandledRejection", (reason) => {
  log(`💥 未处理的 Promise 拒绝: ${reason}`)
  shutdown()
})

startDevServer()
startHeartbeat()
startHealthCheck()
