// src/pages/index.js (或 pages/index.js)

import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link'; // 导入 Link 组件

export default function Home({ initialMovies, initialPage, initialTotalPages, error: initialError }) {
  const [movies, setMovies] = useState(initialMovies || []);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || null);

  const fetchMoviesForPage = async (pageNumber) => {
    if (loading || pageNumber < 1 || pageNumber > totalPages) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/getMovies?page=${pageNumber}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `请求失败，状态码: ${res.status}`);
      }
      const data = await res.json();
      setMovies(data.results || []);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error fetching page:", err);
      setError(err.message || '加载电影时发生错误。');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => fetchMoviesForPage(currentPage - 1);
  const handleNextPage = () => fetchMoviesForPage(currentPage + 1);

  return (
    <div>
      <Head>
        <title>TMDb 电影浏览器 (Next.js) - 第 {currentPage} 页</title>
        <meta name="description" content={`使用 Next.js 构建的 TMDb 电影浏览器 - 第 ${currentPage} 页`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: '20px' }}> {/* 给 main 加点内边距 */}
        <h1>热门电影</h1>

        {(initialError || error) && <p style={{ color: 'red' }}>加载错误: {error || initialError}</p>}
        {loading && <p>加载中...</p>}

        <div id="movie-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', minHeight: '300px' }}>
          {!loading && movies.map((movie) => (
            // --- 修改部分：使用 Link 包裹卡片 ---
            <Link key={movie.id} href={`/movie/${movie.id}`} passHref legacyBehavior>
              <a style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ border: '1px solid #ccc', padding: '10px', width: '200px', height: '100%', cursor: 'pointer', transition: 'transform 0.2s ease', }}
                     onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'} // 简单的悬停效果
                     onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/placeholder.png'}
                    alt={movie.title}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }}
                  />
                  <h3 style={{ marginTop: '10px', fontSize: '1em', minHeight: '3em' /* 给标题留点空间 */ }}>
                      {movie.title} ({movie.release_date?.substring(0, 4)})
                  </h3>
                  <p>评分: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
                </div>
              </a>
            </Link>
             // --- 修改结束 ---
          ))}
        </div>

        <div id="pagination" style={{ marginTop: '20px', opacity: loading ? 0.5 : 1 }}>
          <button onClick={handlePrevPage} disabled={currentPage <= 1 || loading}>
            上一页
          </button>
          <span> 第 {currentPage} 页 / 共 {totalPages} 页 </span>
          <button onClick={handleNextPage} disabled={currentPage >= totalPages || loading}>
            下一页
          </button>
        </div>
      </main>

      <footer style={{ marginTop: '40px', textAlign: 'center', color: '#888' }}>
        <p>数据来源：TMDb</p>
      </footer>
    </div>
  );
}

// getServerSideProps 函数保持不变
export async function getServerSideProps(context) {
   const page = context.query.page || '1';
   const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
   // 修正：优先使用 VERCEL_URL (如果存在且在 Vercel 环境)
   const host = process.env.VERCEL_URL || context.req.headers.host || 'localhost:3000';
   const apiBaseUrl = `${protocol}://${host}`;

   let initialMovies = [];
   let initialPage = parseInt(page, 10);
   let initialTotalPages = 1;
   let error = null;

   try {
     console.log(`getServerSideProps fetching: ${apiBaseUrl}/api/getMovies?page=${page}`);
     const res = await fetch(`${apiBaseUrl}/api/getMovies?page=${page}`);

     if (!res.ok) {
       console.error(`API route /api/getMovies failed with status: ${res.status}`);
       const errorData = await res.json().catch(() => ({}));
       error = errorData.message || `加载电影失败，状态码: ${res.status}`;
     } else {
       const data = await res.json();
       initialMovies = data.results || [];
       initialPage = data.page || parseInt(page, 10);
       initialTotalPages = data.total_pages || 1;
     }

   } catch (err) {
     console.error("Error in getServerSideProps:", err);
     error = err.message || '加载电影时发生服务器内部错误。';
   }

   return {
     props: {
       initialMovies,
       initialPage,
       initialTotalPages,
       error,
     },
   };
}