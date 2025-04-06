// src/pages/api/getMovies.js (或 pages/api/getMovies.js)

export default async function handler(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  
    // 1. 从环境变量获取 API Key
    const apiKey = process.env.TMDB_API_KEY;
  
    if (!apiKey) {
      console.error('TMDB API Key not found in environment variables.');
      return res.status(500).json({ 
        message: 'Server configuration error: API Key missing.',
        debug: {
          env_keys: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')),
          node_env: process.env.NODE_ENV,
          vercel_env: process.env.VERCEL_ENV
        }
      });
    }
  
    // 2. 从请求的查询参数中获取页码，默认为 1
    const page = req.query.page || '1'; // req.query 包含 URL ? 后面的参数
  
    // 3. 构建 TMDb API URL
    const tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=zh-CN&page=${page}`;
    
    // 不输出完整 URL（含 API key）到日志
    console.log(`Fetching TMDb URL for page: ${page}`);
  
    try {
      // 4. 使用 fetch 调用 TMDb
      const tmdbRes = await fetch(tmdbUrl);
  
      // 5. 处理响应
      if (!tmdbRes.ok) {
        console.error(`TMDb API request failed with status: ${tmdbRes.status}`);
        const errorData = await tmdbRes.json().catch(() => ({}));
        return res.status(tmdbRes.status).json({
          message: `Failed to fetch data from TMDb. Status: ${tmdbRes.status}`,
          tmdb_error: errorData.status_message || 'Unknown TMDb error'
        });
      }
  
      const data = await tmdbRes.json();
      console.log(`Successfully fetched TMDb data for page ${page}. Got ${data.results?.length || 0} results.`);
  
      // 6. 发送数据回前端
      res.status(200).json(data);
  
    } catch (error) {
      console.error('Error fetching from TMDb in /api/getMovies:', error);
      res.status(500).json({ 
        message: 'Internal Server Error while fetching from TMDb.',
        error_details: process.env.NODE_ENV === 'development' ? error.message : 'Error details hidden in production'
      });
    }
  }