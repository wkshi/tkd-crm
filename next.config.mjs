/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 部署时使用 standalone 输出，减小镜像体积
  output: process.env.DOCKER_DEPLOY === "true" ? "standalone" : undefined,

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
