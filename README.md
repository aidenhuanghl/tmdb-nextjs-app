This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## TMDb API 认证设置

本项目使用 [TMDb API](https://www.themoviedb.org/documentation/api) 获取电影数据。您需要设置以下认证方式之一：

### 方法一：使用 API Key (v3 认证)

1. 访问 [TMDb 网站](https://www.themoviedb.org/) 并注册/登录
2. 进入 [设置 > API](https://www.themoviedb.org/settings/api) 页面
3. 如果没有 API 密钥，点击 "创建" 或 "请求 API 密钥"
4. 复制 "API 密钥 (v3 auth)" 的值
5. 创建 `.env.local` 文件并添加：
   ```
   TMDB_API_KEY=您的API密钥
   ```

### 方法二：使用 Access Token (v4 认证，推荐)

1. 访问 [TMDb 网站](https://www.themoviedb.org/) 并注册/登录
2. 进入 [设置 > API](https://www.themoviedb.org/settings/api) 页面
3. 在 "API 访问令牌 (v4 auth)" 区域，点击 "创建" 或复制现有令牌
4. 创建 `.env.local` 文件并添加：
   ```
   TMDB_ACCESS_TOKEN=您的访问令牌
   ```

**注意**：使用 Access Token (v4 认证) 是推荐的方法，可以避免某些 API Key 过期或权限问题。

## Vercel 部署指南

要在 Vercel 上部署此应用，请按照以下步骤进行：

1. 在 Vercel 控制面板创建新项目并导入此 Git 仓库

2. 在项目的"Settings" > "Environment Variables"中添加以下环境变量（至少设置一个）：
   - `TMDB_API_KEY` - 填入您的 TMDb API 密钥 (v3 auth)
   - `TMDB_ACCESS_TOKEN` - 填入您的 TMDb 访问令牌 (v4 auth，推荐)

3. **重要**: 确保环境变量值正确无误，没有多余的空格或换行符

4. 部署完成后，Vercel 会自动为您的应用提供一个域名

5. 如果遇到部署问题，请查看 Vercel 构建日志和函数日志中的错误信息

### API 密钥/令牌验证

如果需要验证您的 API 密钥/访问令牌是否有效，可以使用以下方法测试：

**测试 API Key (v3)**:
```
https://api.themoviedb.org/3/movie/popular?api_key=您的API密钥&language=zh-CN
```

**测试 Access Token (v4)**:
在浏览器中发送带有 Authorization 头的请求，或使用以下 curl 命令：
```
curl -X GET "https://api.themoviedb.org/3/movie/popular?language=zh-CN" -H "Authorization: Bearer 您的访问令牌"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
