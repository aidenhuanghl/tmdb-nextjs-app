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
          env_keys: Object.keys(process.env)
            .filter(key => !key.includes('SECRET') && !key.includes('KEY')),
          node_env: process.env.NODE_ENV,
          vercel_env: process.env.VERCEL_ENV || 'not set',
          vercel_url: process.env.VERCEL_URL || 'not set'
        }
      });
    }
  
    // 2. 从请求的查询参数中获取页码，默认为 1
    const page = req.query.page || '1';
    
    // 打印环境信息（不包含私钥）以帮助调试
    console.log('Environment info:', {
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV || 'not set',
      has_api_key: !!apiKey,
      api_key_length: apiKey ? apiKey.length : 0,
      is_vercel: !!process.env.VERCEL
    });
  
    // 3. 构建 TMDb API URL - 使用标准 API KEY 方法
    const tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=zh-CN&page=${page}`;
    
    console.log(`Fetching TMDb data for page: ${page}`);
  
    try {
      // 4. 使用 fetch 调用 TMDb API
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          // 我们在URL中使用api_key而不是Authorization header
        }
      };
      
      const tmdbRes = await fetch(tmdbUrl, fetchOptions);
  
      // 5. 处理响应
      if (!tmdbRes.ok) {
        const status = tmdbRes.status;
        console.error(`TMDb API request failed with status: ${status}`);
        
        let errorMessage = `Failed to fetch data from TMDb. Status: ${status}`;
        let errorDetail = 'Unknown TMDb error';
        
        try {
          const errorData = await tmdbRes.json();
          errorDetail = errorData.status_message || errorDetail;
          console.error('TMDb error details:', errorData);
          
          // 如果是401错误，可能是API密钥问题
          if (status === 401) {
            errorMessage = 'TMDb API密钥认证失败。请检查API密钥是否正确设置。';
            console.error('API Key validation failed. Masked key:', 
              apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'undefined');
          }
        } catch (parseError) {
          console.error('Could not parse TMDb error response:', parseError);
        }
        
        return res.status(status).json({
          message: errorMessage,
          tmdb_error: errorDetail
        });
      }
  
      const data = await tmdbRes.json();
      console.log(`Successfully fetched TMDb data. Got ${data.results?.length || 0} results.`);
  
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