// src/pages/api/getMovieDetails.js

export default async function handler(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  
    const { id } = req.query;
  
    if (!id) {
      return res.status(400).json({ message: 'Bad Request: Movie ID is required.' });
    }
  
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.error('TMDB API Key not found.');
      return res.status(500).json({ message: 'Server configuration error.' });
    }
  
    // 同时请求详情和演职员信息
    const tmdbUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=zh-CN&append_to_response=credits`;
  
    console.log(`Fetching TMDb Movie Details URL: ${tmdbUrl}`);
  
    try {
      const tmdbRes = await fetch(tmdbUrl);
  
      if (!tmdbRes.ok) {
        if (tmdbRes.status === 404) {
            return res.status(404).json({ message: `Movie with ID ${id} not found.` });
        }
        console.error(`TMDb API request failed for ID ${id}: ${tmdbRes.status}`);
        const errorData = await tmdbRes.json().catch(() => ({}));
        return res.status(tmdbRes.status).json({
          message: `Failed to fetch data from TMDb. Status: ${tmdbRes.status}`,
          tmdb_error: errorData.status_message || 'Unknown TMDb error'
        });
      }
  
      const data = await tmdbRes.json();
      res.status(200).json(data);
  
    } catch (error) {
      console.error(`Error fetching TMDb details for ID ${id}:`, error);
      res.status(500).json({ message: 'Internal Server Error while fetching from TMDb.' });
    }
  }