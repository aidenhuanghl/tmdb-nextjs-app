// src/pages/index.js (或 pages/index.js)

import Head from 'next/head';
import { useState, useEffect } from 'react'; // 导入 useState 和 useEffect (后面分页会用到)

// Home 组件基本不变...
export default function Home({ initialMovies, initialPage, initialTotalPages }) {
  // 使用 useState 来管理电影列表和分页状态
  // 初始值来自 getServerSideProps 传递的 props
  const [movies, setMovies] = useState(initialMovies);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false); // 加载状态 (用于分页)
  const [error, setError] = useState(null);     // 错误状态

  // (后面添加处理分页的函数)

  return (
    <div>
      <Head>
        <title>TMDb 电影浏览器 (Next.js)</title>
        <meta name="description" content="使用 Next.js 构建的 TMDb 电影浏览器" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>热门电影</h1>

        {/* 错误提示 */}
        {error && <p style={{ color: 'red' }}>加载错误: {error}</p>}

        {/* 加载状态提示 */}
        {loading && <p>加载中...</p>}

        {/* 电影列表 */}
        <div id="movie-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {movies.map((movie) => (
            <div key={movie.id} style={{ border: '1px solid #ccc', padding: '10px', width: '200px' }}>
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/placeholder.png'} // 添加图片占位符
                alt={movie.title}
                style={{ width: '100%', height: 'auto' }}
                onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }} // 图片加载失败处理
              />
              <h3>{movie.title} ({movie.release_date?.substring(0, 4)})</h3> {/* ?. 安全访问符 */}
              <p>评分: {movie.vote_average.toFixed(1)}</p>
              {/* 可以在这里添加链接到详情页 */}
            </div>
          ))}
        </div>

        {/* 分页控件 */}
        <div id="pagination" style={{ marginTop: '20px' }}>
          <button disabled={currentPage <= 1 || loading}>
            上一页
          </button>
          <span> 第 {currentPage} 页 / 共 {totalPages} 页 </span>
          <button disabled={currentPage >= totalPages || loading}>
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

// 在页面组件下方导出 getServerSideProps 函数
export async function getServerSideProps(context) {
  // context 对象包含请求相关的信息，比如 query 参数

  // 1. 获取页码 (如果 URL 有 ?page=... 参数的话)
  // 注意：getServerSideProps 在服务器端运行，不能访问 window.location
  // 它可以通过 context.query 获取 URL 查询参数
  const page = context.query.page || '1';

  // 2. 调用我们自己的 API 路由
  // 重要：在 getServerSideProps 中调用自己的 API 路由时，
  // 需要使用绝对 URL 或相对路径，并且因为这是服务器端到服务器端的调用，
  // 可以直接调用 localhost 上的地址 (在开发时) 或内部地址 (在生产环境)。
  // 为了简单起见，我们先用 fetch 调用相对路径 /api/getMovies。
  // Vercel 会智能处理这种情况。
  // (更健壮的方式是直接在这里写获取 TMDb 数据的逻辑，避免一次额外的网络请求)
  // 但为了演示 API Route 的用法，我们先调用它。

  // 获取部署环境的基地址，确保在服务器端也能正确访问 API
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  // Vercel 会设置 VERCEL_URL 环境变量，优先使用它
  const host = context.req.headers.host || 'localhost:3000'; // context.req.headers.host 更可靠
  const apiBaseUrl = `${protocol}://${host}`;

  try {
    console.log(`getServerSideProps fetching: ${apiBaseUrl}/api/getMovies?page=${page}`);
    const res = await fetch(`${apiBaseUrl}/api/getMovies?page=${page}`);

    if (!res.ok) {
      // 如果 API 路由返回错误
      console.error(`API route /api/getMovies failed with status: ${res.status}`);
      // 抛出错误会让 Next.js 显示一个错误页面
      // 或者你可以返回一个特定的 props 来在页面上显示错误信息
      // throw new Error(`Failed to fetch movies: ${res.statusText}`);
       return {
        props: {
          initialMovies: [],
          initialPage: parseInt(page, 10),
          initialTotalPages: 1,
          error: `加载电影失败，状态码: ${res.status}` // 把错误信息传给页面
        },
      };
    }

    const data = await res.json();

    // 3. 将获取到的数据通过 props 返回给 Home 组件
    return {
      props: {
        initialMovies: data.results || [], // API 返回的数据中的电影列表
        initialPage: data.page || parseInt(page, 10),       // 当前页码
        initialTotalPages: data.total_pages || 1, // 总页数
        error: null // 没有错误
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    // 网络错误或其他异常
     return {
        props: {
          initialMovies: [],
          initialPage: parseInt(page, 10),
          initialTotalPages: 1,
          error: '加载电影时发生服务器内部错误。' // 把错误信息传给页面
        },
      };
  }
}