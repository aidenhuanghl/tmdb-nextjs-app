// src/pages/api/getMovies.js (或 pages/api/getMovies.js)

export default async function handler(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  
    // 获取 API 认证信息
    const apiKey = process.env.TMDB_API_KEY;
    const accessToken = process.env.TMDB_ACCESS_TOKEN;
  
    if (!apiKey && !accessToken) {
      console.error('TMDb 认证信息未找到: 需要设置 TMDB_API_KEY 或 TMDB_ACCESS_TOKEN');
      return res.status(500).json({ 
        message: 'TMDb 认证信息未找到: 需要设置 TMDB_API_KEY 或 TMDB_ACCESS_TOKEN',
        debug: {
          env_keys: Object.keys(process.env)
            .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN')),
          node_env: process.env.NODE_ENV,
          vercel_env: process.env.VERCEL_ENV || 'not set',
          vercel_url: process.env.VERCEL_URL || 'not set'
        }
      });
    }
  
    const page = req.query.page || '1';
    
    console.log('Environment info:', {
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV || 'not set',
      has_api_key: !!apiKey,
      has_access_token: !!accessToken,
      is_vercel: !!process.env.VERCEL
    });
  
    // 根据可用的认证方式构建请求
    let tmdbUrl = '';
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    
    // 优先使用 access token (v4 auth)
    if (accessToken) {
      tmdbUrl = `https://api.themoviedb.org/3/movie/popular?language=zh-CN&page=${page}`;
      fetchOptions.headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('使用 Access Token 认证方式');
    } 
    // 其次使用 API Key (v3 auth)
    else if (apiKey) {
      tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=zh-CN&page=${page}`;
      console.log('使用 API Key 认证方式');
    }
    
    console.log(`获取第 ${page} 页电影数据`);
  
    try {
      const tmdbRes = await fetch(tmdbUrl, fetchOptions);
  
      if (!tmdbRes.ok) {
        const status = tmdbRes.status;
        console.error(`TMDb API 请求失败，状态码: ${status}`);
        
        let errorMessage = `无法从 TMDb 获取数据。状态码: ${status}`;
        let errorDetail = '未知 TMDb 错误';
        
        try {
          const errorData = await tmdbRes.json();
          errorDetail = errorData.status_message || errorDetail;
          console.error('TMDb 错误详情:', JSON.stringify(errorData));
          
          if (status === 401) {
            errorMessage = 'TMDb 认证失败。请检查您的 API 密钥或访问令牌是否正确设置。';
            if (apiKey) {
              console.error('API Key 验证失败，密钥前4位和后4位:', 
                apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : '未设置');
            }
            if (accessToken) {
              console.error('Access Token 验证失败，令牌前4位和后4位:', 
                accessToken ? `${accessToken.substring(0, 4)}...${accessToken.substring(accessToken.length - 4)}` : '未设置');
            }
          }
        } catch (parseError) {
          console.error('无法解析 TMDb 错误响应:', parseError);
        }
        
        return res.status(status).json({
          message: errorMessage,
          tmdb_error: errorDetail
        });
      }
  
      const data = await tmdbRes.json();
      console.log(`成功获取 TMDb 数据。获取了 ${data.results?.length || 0} 条电影信息。`);
  
      res.status(200).json(data);
  
    } catch (error) {
      console.error('从 TMDb 获取数据时出错:', error);
      res.status(500).json({ 
        message: '从 TMDb 获取数据时发生服务器内部错误。',
        error_details: process.env.NODE_ENV === 'development' ? error.message : '生产环境中隐藏错误详情'
      });
    }
  }