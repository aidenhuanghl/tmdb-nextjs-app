// src/pages/movie/[id].js

import Head from 'next/head';
import Link from 'next/link';

export default function MovieDetail({ movie, error }) {

  if (error) {
    return (
      <div>
        <Head>
          <title>错误</title>
        </Head>
        <main style={{ padding: '20px' }}>
          <h1>加载出错</h1>
          <p>{error}</p>
          <Link href="/">
             ← 返回热门电影
          </Link>
        </main>
      </div>
    );
  }

  if (!movie) {
    return (
       <div>
        <Head>
          <title>电影未找到</title>
        </Head>
        <main style={{ padding: '20px' }}>
          <h1>电影未找到</h1>
           <Link href="/">
             ← 返回热门电影
          </Link>
        </main>
      </div>
    );
  }

  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
  const genres = movie.genres?.map(g => g.name).join(', ') || '未知类型';
  const runtime = movie.runtime ? `${movie.runtime} 分钟` : '未知时长';

  // 获取前 10 位演员信息
  const cast = movie.credits?.cast?.slice(0, 10) || [];

  return (
    <div>
      <Head>
        <title>{movie.title} ({releaseYear}) - 电影详情</title>
        <meta name="description" content={movie.overview || `电影 ${movie.title} 的详情信息`} />
         <link rel="icon" href="/favicon.ico" /> {/* 也给详情页加上 icon */}
      </Head>

      <main style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' /* 居中显示 */ }}>
        <div style={{ marginBottom: '20px' }}>
          <Link href="/">
            ← 返回热门电影
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' /* 顶部对齐 */ }}>
          <div style={{ flexShrink: 0 }}>
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : '/placeholder.png'}
              alt={`电影 ${movie.title} 的海报`}
              style={{ width: '300px', height: 'auto', display: 'block', border: '1px solid #eee', borderRadius: '8px' /* 加点圆角 */ }}
               onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }}
            />
          </div>
          <div style={{ flexGrow: 1 }}>
            <h1>{movie.title} <span style={{ color: '#666', fontWeight: 'normal' }}>({releaseYear})</span></h1>
            {movie.tagline && <p style={{ fontStyle: 'italic', color: '#555' }}><em>{movie.tagline}</em></p>}
            <p><strong>类型:</strong> {genres}</p>
            <p><strong>时长:</strong> {runtime}</p>
            <p><strong>评分:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} ({movie.vote_count} 票)</p>
             <p><strong>上映日期:</strong> {movie.release_date || '未知'}</p>
             {/* 可以按需添加更多字段，如 status, original_language, budget, revenue 等 */}
             {movie.homepage && <p><strong>官网:</strong> <a href={movie.homepage} target="_blank" rel="noopener noreferrer">{movie.homepage}</a></p>}
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h2>简介</h2>
          <p style={{ lineHeight: '1.6' }}>{movie.overview || '暂无简介'}</p>
        </div>

        {/* 显示演员信息 */}
        {cast.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h2>主要演员</h2>
             <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' /* 留出滚动条空间 */ }}>
               {cast.map(actor => (
                 <div key={actor.cast_id || actor.id} style={{ textAlign: 'center', minWidth: '100px' }}>
                   <img
                     src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/placeholder_person.png' /* 演员占位图 */}
                     alt={actor.name}
                     style={{ width: '100px', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '5px' }}
                     onError={(e) => { e.target.onerror = null; e.target.src='/placeholder_person.png'; }}
                   />
                   <div style={{ fontSize: '0.9em' }}><strong>{actor.name}</strong></div>
                   <div style={{ fontSize: '0.8em', color: '#555' }}>{actor.character}</div>
                 </div>
               ))}
             </div>
          </div>
        )}

      </main>
       <footer style={{ marginTop: '40px', textAlign: 'center', color: '#888', paddingBottom: '20px' }}>
        <p>数据来源：TMDb</p>
      </footer>
    </div>
  );
}


export async function getServerSideProps(context) {
  const { id } = context.params;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  // 修正：优先使用 VERCEL_URL
  const host = process.env.VERCEL_URL || context.req.headers.host || 'localhost:3000';
  const apiBaseUrl = `${protocol}://${host}`;

  let movie = null;
  let error = null;

  try {
    console.log(`getServerSideProps fetching details from: ${apiBaseUrl}/api/getMovieDetails?id=${id}`);
    const res = await fetch(`${apiBaseUrl}/api/getMovieDetails?id=${id}`);

    if (!res.ok) {
      if (res.status === 404) {
        error = `ID 为 ${id} 的电影未找到。请检查 ID 或返回首页。`;
      } else {
        const errorData = await res.json().catch(() => ({})); // 尝试解析错误体
        error = errorData.message || `加载电影详情失败，状态码: ${res.status}`;
      }
      console.error(`API route /api/getMovieDetails failed for ID ${id}: ${res.status}`);
    } else {
      movie = await res.json();
    }

  } catch (err) {
    console.error(`Error in getServerSideProps for movie ID ${id}:`, err);
    error = '加载电影详情时发生服务器内部错误。';
  }

  return {
    props: {
      movie,
      error,
    },
  };
}