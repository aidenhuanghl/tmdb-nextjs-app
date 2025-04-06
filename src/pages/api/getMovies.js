// src/pages/api/getMovies.js (或 pages/api/getMovies.js)

export default async function handler(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  
    // 1. 从环境变量获取 API Key
    const apiKey = process.env.TMDB_API_KEY; // 或者 process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN
  
    if (!apiKey) {
      console.error('TMDB API Key not found in environment variables.');
      return res.status(500).json({ message: 'Server configuration error: API Key missing.' });
    }
  
    // 2. 从请求的查询参数中获取页码，默认为 1
    const page = req.query.page || '1'; // req.query 包含 URL ? 后面的参数
  
    // 3. 构建 TMDb API URL
    const tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=zh-CN&page=${page}`;
    // 注意：这里我们直接用了 api_key 查询参数。
    // 如果你用的是 Read Access Token，认证方式可能不同，通常是放在 Authorization Header 里:
    // const headers = { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN}` };
    // const tmdbUrl = `https://api.themoviedb.org/3/movie/popular?language=zh-CN&page=${page}`;
  
    console.log(`Fetching TMDb URL: ${tmdbUrl}`); // 方便调试
  
    try {
      // 4. 使用 fetch 调用 TMDb
      // 在 Next.js API 路由中，fetch 是全局可用的，不需要额外安装 node-fetch
      const tmdbRes = await fetch(tmdbUrl);
  
      // 5. 处理响应
      if (!tmdbRes.ok) {
        // 如果 TMDb 返回错误状态码 (比如 401 Unauthorized, 404 Not Found)
        console.error(`TMDb API request failed with status: ${tmdbRes.status}`);
        const errorData = await tmdbRes.json().catch(() => ({})); // 尝试解析错误信息
        return res.status(tmdbRes.status).json({
          message: `Failed to fetch data from TMDb. Status: ${tmdbRes.status}`,
          tmdb_error: errorData.status_message || 'Unknown TMDb error'
        });
      }
  
      const data = await tmdbRes.json();
  
      // 6. 发送数据回前端
      // 我们直接将 TMDb 返回的数据（包含 results, page, total_pages 等）转发给前端
      res.status(200).json(data);
  
    } catch (error) {
      // 捕获网络错误或其他 fetch 过程中的异常
      console.error('Error fetching from TMDb in /api/getMovies:', error);
      res.status(500).json({ message: 'Internal Server Error while fetching from TMDb.' });
    }
  }