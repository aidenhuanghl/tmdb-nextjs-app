/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 这些环境变量将在构建时注入
    TMDB_API_KEY: process.env.TMDB_API_KEY,
  },
  // 确保 API 路由有足够的执行时间
  serverRuntimeConfig: {
    // 仅在服务器端可用的配置
    API_TIMEOUT: 10000, // 10 秒
  },
  publicRuntimeConfig: {
    // 客户端和服务器端都可用的配置
    API_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  },
};

export default nextConfig;
