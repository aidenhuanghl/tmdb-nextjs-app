// src/pages/index.js (或 pages/index.js)

import Head from 'next/head';
import { useState } from 'react'; // 暂时移除了 useEffect，因为目前只用 useState
// 如果后面需要更新 URL，我们会再引入 next/router

export default function Home({ initialMovies, initialPage, initialTotalPages, error: initialError }) { // 接收 error prop
  const [movies, setMovies] = useState(initialMovies || []); // 提供默认空数组以防 initialMovies 为 null/undefined
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  // 将来自 SSR 的错误也设置到状态中
  const [error, setError] = useState(initialError || null);

  // --- 新增：处理分页的函数 ---
  const fetchMoviesForPage = async (pageNumber) => {
    // 防止重复请求或请求无效页码
    if (loading || pageNumber < 1 || pageNumber > totalPages) {
      return;
    }

    setLoading(true); // 开始加载
    setError(null);   // 清除之前的错误

    try {
      // 直接从浏览器调用我们的 API 路由
      // 注意：这里用相对路径 '/api/...' 即可，浏览器会自动处理
      const res = await fetch(`/api/getMovies?page=${pageNumber}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); // 尝试获取错误信息
        throw new Error(errorData.message || `请求失败，状态码: ${res.status}`);
      }

      const data = await res.json();

      // 更新状态
      setMovies(data.results || []); // 更新电影列表
      setCurrentPage(data.page);     // 更新当前页码
      setTotalPages(data.total_pages); // 更新总页数 (以防万一有变化)

      // 可选：滚动到页面顶部
      window.scrollTo(0, 0);

      // 可选：更新浏览器 URL (稍后添加)


    } catch (err) {
      console.error("Error fetching page:", err);
      setError(err.message || '加载电影时发生错误。');
      // 出错时不清空电影列表，让用户还能看到旧数据
    } finally {
      setLoading(false); // 加载结束 (无论成功或失败)
    }
  };

  // --- 处理点击事件的函数 ---
  const handlePrevPage = () => {
    fetchMoviesForPage(currentPage - 1);
  };

  const handleNextPage = () => {
    fetchMoviesForPage(currentPage + 1);
  };

  // --- JSX 部分 ---
  return (
    <div>
      <Head>
        {/* Head 内容不变 */}
        <title>TMDb 电影浏览器 (Next.js) - 第 {currentPage} 页</title>
        <meta name="description" content={`使用 Next.js 构建的 TMDb 电影浏览器 - 第 ${currentPage} 页`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>热门电影</h1>

        {/* 错误提示 */}
        {/* 同时显示来自 SSR 的错误和客户端请求的错误 */}
        {(initialError || error) && <p style={{ color: 'red' }}>加载错误: {error || initialError}</p>}


        {/* 加载状态提示 */}
        {loading && <p>加载中...</p>}

        {/* 电影列表 */}
        <div id="movie-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', minHeight: '300px' /* 给个最小高度防止加载时跳动 */ }}>
          {/* 如果正在加载且没有错误，可以显示骨架屏或保持旧数据 */}
          {!loading && movies.map((movie) => ( // 仅在非加载状态下渲染新列表
            <div key={movie.id} style={{ border: '1px solid #ccc', padding: '10px', width: '200px' }}>
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/placeholder.png'}
                alt={movie.title}
                style={{ width: '100%', height: 'auto', display: 'block' /* 防止图片下方有空隙 */ }}
                onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }}
              />
              <h3>{movie.title} ({movie.release_date?.substring(0, 4)})</h3>
              <p>评分: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p> {/* 增加对评分不存在的处理 */}
            </div>
          ))}
           {/* 也可以在加载时显示旧数据，视觉效果更连贯 */}
           {/* {movies.map((movie) => ( ... ))} */}
        </div>

        {/* 分页控件 */}
        <div id="pagination" style={{ marginTop: '20px', opacity: loading ? 0.5 : 1 /* 加载时按钮变淡 */ }}>
          <button onClick={handlePrevPage} disabled={currentPage <= 1 || loading}>
            上一页
          </button>
          <span> 第 {currentPage} 页 / 共 {totalPages} 页 </span>
          <button onClick={handleNextPage} disabled={currentPage >= totalPages || loading}>
            下一页
          </button>
        </div>
      </main>

      <footer>
        <p>数据来源：TMDb</p>
      </footer>
    </div>
  );
}

// getServerSideProps 函数保持不变
export async function getServerSideProps(context) {
  // ... (之前的 getServerSideProps 代码)
   const page = context.query.page || '1';
   const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
   const host = context.req.headers.host || 'localhost:3000';
   const apiBaseUrl = `${protocol}://${host}`;

   let initialMovies = [];
   let initialPage = parseInt(page, 10);
   let initialTotalPages = 1;
   let error = null; // 定义 error 变量

   try {
     console.log(`getServerSideProps fetching: ${apiBaseUrl}/api/getMovies?page=${page}`);
     const res = await fetch(`${apiBaseUrl}/api/getMovies?page=${page}`);

     if (!res.ok) {
       console.error(`API route /api/getMovies failed with status: ${res.status}`);
       const errorData = await res.json().catch(() => ({}));
       error = errorData.message || `加载电影失败，状态码: ${res.status}`; // 将错误信息赋给 error
     } else {
       const data = await res.json();
       initialMovies = data.results || [];
       initialPage = data.page || parseInt(page, 10);
       initialTotalPages = data.total_pages || 1;
     }

   } catch (err) { // Renamed catch variable to 'err' to avoid conflict
     console.error("Error in getServerSideProps:", err);
     error = err.message || '加载电影时发生服务器内部错误。'; // 将错误信息赋给 error
   }

   // 将所有数据，包括 error，都通过 props 返回
   return {
     props: {
       initialMovies,
       initialPage,
       initialTotalPages,
       error, // 传递 error 给 Home 组件
     },
   };
}