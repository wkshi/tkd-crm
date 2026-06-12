/** @type {import('next').NextConfig} */
const nextConfig = {
  // 通过环境变量控制构建输出模式，生产环境建议设置为 standalone
  output: process.env.NEXT_OUTPUT || undefined,

  // 图片优化配置
  images: {
    unoptimized: false,
  },

  // 统一路由风格
  trailingSlash: false,

  // 环境变量白名单（客户端可访问）
  env: {
    APP_NAME: "跆拳道 CRM",
    APP_VERSION: "1.0.0",
  },
};

export default nextConfig;
