import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Seed data stores
interface StoredUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
}

interface StoredWatchProgress {
  userId: string;
  mediaId: string;
  episodeId?: string;
  timestampSeconds: number;
  durationSeconds: number;
  lastWatchedAt: number;
  completed: boolean;
}

interface StoredComment {
  id: string;
  mediaId: string;
  episodeId?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  createdAt: number;
}

const users: StoredUser[] = [
  {
    id: 'user-default',
    name: 'Alex Mercer',
    email: 'alex@cinepulse.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'admin',
  },
];

let watchHistory: StoredWatchProgress[] = [
  {
    userId: 'user-default',
    mediaId: 'interstellar-voyage',
    timestampSeconds: 1240,
    durationSeconds: 9840,
    lastWatchedAt: Date.now() - 3600000,
    completed: false,
  },
  {
    userId: 'user-default',
    mediaId: 'chronicles-of-elysium',
    episodeId: 'elysium-s1-e1',
    timestampSeconds: 2100,
    durationSeconds: 3360,
    lastWatchedAt: Date.now() - 7200000,
    completed: false,
  },
];

let favorites: string[] = ['chronicles-of-elysium', 'interstellar-voyage'];

let comments: StoredComment[] = [
  {
    id: 'comm-1',
    mediaId: 'chronicles-of-elysium',
    userId: 'user-default',
    userName: 'Alex Mercer',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    content: 'The cinematography in Episode 1 is breathtaking. The soundtrack sets an unreal atmospheric mood!',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'comm-2',
    mediaId: 'interstellar-voyage',
    userId: 'user-2',
    userName: 'Sophia Chen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    content: 'A masterclass in tension and cosmological physics. Must watch with headphones!',
    createdAt: Date.now() - 43200000,
  },
];

// TMDB API Integration
const TMDB_API_KEY = process.env.TMDB_API_KEY || '2dca580c2a14b55200e784d157207b4d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

function formatTmdbItem(item: any, explicitType?: 'movie' | 'series'): any {
  const isMovie = explicitType ? explicitType === 'movie' : (item.media_type === 'movie' || !!item.title);
  const title = item.title || item.name || 'Untitled';
  const releaseDate = item.release_date || item.first_air_date || '';
  const releaseYear = releaseDate ? parseInt(releaseDate.substring(0, 4), 10) : 2026;
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : posterUrl;

  const genreIds = item.genre_ids || (item.genres || []).map((g: any) => g.id);
  const genres = (genreIds || [])
    .map((gid: number) => GENRE_MAP[gid])
    .filter(Boolean);

  const type = isMovie ? 'movie' : 'series';
  const tmdbId = item.id;

  const videoUrl = isMovie
    ? `https://vidsrc.xyz/embed/movie/${tmdbId}`
    : `https://vidsrc.xyz/embed/tv/${tmdbId}/1/1`;

  const duration = isMovie
    ? item.runtime
      ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
      : '2h 05m'
    : undefined;

  return {
    id: `tmdb-${type}-${tmdbId}`,
    tmdbId,
    title,
    type,
    tagline: item.tagline || undefined,
    synopsis: item.overview || 'No synopsis available for this title.',
    releaseYear: isNaN(releaseYear) ? 2025 : releaseYear,
    rating: Number((item.vote_average || 7.5).toFixed(1)),
    contentRating: item.adult ? 'R' : 'PG-13',
    genres: genres.length > 0 ? genres : ['Drama'],
    duration,
    posterUrl,
    backdropUrl,
    videoUrl,
    cast: (item.credits?.cast || []).slice(0, 5).map((c: any) => c.name),
    quality: '4K UHD',
    isFeatured: (item.popularity || 0) > 100,
    isTrending: true,
    createdAt: Date.now(),
  };
}

// TMDB: Trending titles
app.get('/api/tmdb/trending', async (req: Request, res: Response) => {
  try {
    const type = req.query.type || 'all'; // all, movie, tv
    const time = req.query.time || 'week'; // week, day
    const page = req.query.page || '1';

    const url = `${TMDB_BASE_URL}/trending/${type}/${time}?api_key=${TMDB_API_KEY}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      // Return 200 with empty results so frontend smoothly falls back without errors
      return res.json({
        page: 1,
        totalPages: 1,
        totalResults: 0,
        results: [],
        warning: `TMDB service status: ${response.status}`,
      });
    }
    const data = await response.json();
    const results = (data.results || [])
      .filter((item: any) => item.poster_path && (item.title || item.name))
      .map((item: any) => formatTmdbItem(item));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results,
    });
  } catch (err: any) {
    res.json({ page: 1, totalPages: 1, totalResults: 0, results: [] });
  }
});

// TMDB: Popular titles
app.get('/api/tmdb/popular', async (req: Request, res: Response) => {
  try {
    const type = req.query.type === 'tv' ? 'tv' : 'movie';
    const page = req.query.page || '1';

    const url = `${TMDB_BASE_URL}/${type}/popular?api_key=${TMDB_API_KEY}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.json({
        page: 1,
        totalPages: 1,
        totalResults: 0,
        results: [],
        warning: `TMDB service status: ${response.status}`,
      });
    }
    const data = await response.json();
    const results = (data.results || [])
      .filter((item: any) => item.poster_path && (item.title || item.name))
      .map((item: any) => formatTmdbItem(item, type === 'tv' ? 'series' : 'movie'));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results,
    });
  } catch (err: any) {
    res.json({ page: 1, totalPages: 1, totalResults: 0, results: [] });
  }
});

// TMDB: Search titles
app.get('/api/tmdb/search', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.query || '').trim();
    const page = req.query.page || '1';
    if (!query) {
      res.json({ results: [] });
      return;
    }

    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB search error ${response.status}`);
    const data = await response.json();
    const results = (data.results || [])
      .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
      .map((item: any) => formatTmdbItem(item));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results,
    });
  } catch (err: any) {
    console.error('TMDB Search Error:', err);
    res.status(500).json({ error: 'Failed to search TMDB', results: [] });
  }
});

// TMDB: Details + Seasons & Episodes
app.get('/api/tmdb/details/:type/:id', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const tmdbType = type === 'series' || type === 'tv' ? 'tv' : 'movie';
    const url = `${TMDB_BASE_URL}/${tmdbType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB details error ${response.status}`);
    const data = await response.json();

    const formatted = formatTmdbItem(data, tmdbType === 'tv' ? 'series' : 'movie');

    // For TV Series: fetch season 1 episodes
    if (tmdbType === 'tv' && data.seasons && data.seasons.length > 0) {
      try {
        const season1Res = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/1?api_key=${TMDB_API_KEY}`);
        if (season1Res.ok) {
          const season1Data = await season1Res.json();
          formatted.seasons = [
            {
              seasonNumber: 1,
              title: season1Data.name || 'Season 1',
              episodes: (season1Data.episodes || []).map((ep: any) => ({
                id: `tmdb-tv-${id}-s1-e${ep.episode_number}`,
                episodeNumber: ep.episode_number,
                title: ep.name || `Episode ${ep.episode_number}`,
                duration: ep.runtime ? `${ep.runtime}m` : '45m',
                synopsis: ep.overview || 'No description available.',
                videoUrl: `https://vidsrc.xyz/embed/tv/${id}/1/${ep.episode_number}`,
                thumbnailUrl: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : formatted.backdropUrl,
              })),
            },
          ];

          // Also populate additional season numbers metadata
          if (data.seasons.length > 1) {
            for (let i = 2; i <= Math.min(data.seasons.length, 5); i++) {
              formatted.seasons.push({
                seasonNumber: i,
                title: `Season ${i}`,
                episodes: [
                  {
                    id: `tmdb-tv-${id}-s${i}-e1`,
                    episodeNumber: 1,
                    title: `Season ${i} Premiere`,
                    duration: '50m',
                    synopsis: `Season ${i} episode 1.`,
                    videoUrl: `https://vidsrc.xyz/embed/tv/${id}/${i}/1`,
                    thumbnailUrl: formatted.backdropUrl,
                  },
                ],
              });
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch season 1 details:', err);
      }
    }

    res.json(formatted);
  } catch (err: any) {
    console.error('TMDB Details Error:', err);
    res.status(500).json({ error: 'Failed to fetch details' });
  }
});

// TMDB: Fetch specific season episodes
app.get('/api/tmdb/tv/:id/season/:seasonNumber', async (req: Request, res: Response) => {
  try {
    const { id, seasonNumber } = req.params;
    const url = `${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB season error ${response.status}`);
    const data = await response.json();

    const episodes = (data.episodes || []).map((ep: any) => ({
      id: `tmdb-tv-${id}-s${seasonNumber}-e${ep.episode_number}`,
      episodeNumber: ep.episode_number,
      title: ep.name || `Episode ${ep.episode_number}`,
      duration: ep.runtime ? `${ep.runtime}m` : '45m',
      synopsis: ep.overview || 'No description available.',
      videoUrl: `https://vidsrc.xyz/embed/tv/${id}/${seasonNumber}/${ep.episode_number}`,
      thumbnailUrl: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : undefined,
    }));

    res.json({
      seasonNumber: Number(seasonNumber),
      title: data.name || `Season ${seasonNumber}`,
      episodes,
    });
  } catch (err: any) {
    console.error('TMDB Season Episodes Error:', err);
    res.status(500).json({ error: 'Failed to fetch season episodes', episodes: [] });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'CinePulse Backend API', timestamp: Date.now() });
});

// Authentication endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || users[0];
  res.json({ token: `session-${user.id}`, user });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email } = req.body;
  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: name || 'Cinema Fan',
    email: email || `user${Date.now()}@cinepulse.io`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'user',
  };
  users.push(newUser);
  res.json({ token: `session-${newUser.id}`, user: newUser });
});

app.get('/api/auth/me', (_req: Request, res: Response) => {
  res.json({ user: users[0] });
});

// Watch History endpoints
app.get('/api/user/history', (_req: Request, res: Response) => {
  res.json({ history: watchHistory });
});

app.post('/api/user/history', (req: Request, res: Response) => {
  const { mediaId, episodeId, timestampSeconds, durationSeconds } = req.body;
  if (!mediaId) {
    res.status(400).json({ error: 'mediaId is required' });
    return;
  }

  const completed = durationSeconds > 0 && timestampSeconds / durationSeconds >= 0.9;
  const existingIdx = watchHistory.findIndex(
    (h) => h.mediaId === mediaId && (!episodeId || h.episodeId === episodeId)
  );

  const entry: StoredWatchProgress = {
    userId: 'user-default',
    mediaId,
    episodeId,
    timestampSeconds: Number(timestampSeconds) || 0,
    durationSeconds: Number(durationSeconds) || 100,
    lastWatchedAt: Date.now(),
    completed,
  };

  if (existingIdx >= 0) {
    watchHistory[existingIdx] = entry;
  } else {
    watchHistory.unshift(entry);
  }

  // Keep max 20 recent items
  watchHistory = watchHistory.slice(0, 20);
  res.json({ success: true, progress: entry });
});

// Favorites endpoints
app.get('/api/user/favorites', (_req: Request, res: Response) => {
  res.json({ favorites });
});

app.post('/api/user/favorites/toggle', (req: Request, res: Response) => {
  const { mediaId } = req.body;
  if (!mediaId) {
    res.status(400).json({ error: 'mediaId is required' });
    return;
  }

  if (favorites.includes(mediaId)) {
    favorites = favorites.filter((id) => id !== mediaId);
  } else {
    favorites.push(mediaId);
  }
  res.json({ success: true, favorites });
});

// Comments endpoints
app.get('/api/comments/:mediaId', (req: Request, res: Response) => {
  const { mediaId } = req.params;
  const mediaComments = comments
    .filter((c) => c.mediaId === mediaId)
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json({ comments: mediaComments });
});

app.post('/api/comments', (req: Request, res: Response) => {
  const { mediaId, episodeId, content, rating, userName } = req.body;
  if (!mediaId || !content) {
    res.status(400).json({ error: 'mediaId and content are required' });
    return;
  }

  const newComment: StoredComment = {
    id: `comm-${Date.now()}`,
    mediaId,
    episodeId,
    userId: 'user-default',
    userName: userName || users[0].name,
    userAvatar: users[0].avatar,
    rating: Number(rating) || 5,
    content: String(content).trim(),
    createdAt: Date.now(),
  };

  comments.unshift(newComment);
  res.json({ success: true, comment: newComment });
});

// AI Directives & Smart Recommendations Engine
app.post('/api/ai/recommend', async (req: Request, res: Response) => {
  try {
    const { watchedTitles, availableCatalog } = req.body;

    const catalogTitles = Array.isArray(availableCatalog)
      ? availableCatalog.map((c: any) => `${c.title} (${c.genres?.join(', ') || ''})`).join('; ')
      : 'Chronicles of Elysium (Fantasy, Action); Interstellar Voyage (Sci-Fi, Adventure); Neon Syndicate (Sci-Fi, Mystery)';

    const prompt = `You are the CinePulse AI Recommendation Engine.
User has watched: ${Array.isArray(watchedTitles) ? watchedTitles.join(', ') : 'Sci-Fi and Fantasy movies'}.
Available catalog: ${catalogTitles}.
Analyze this watch history and return a structured JSON response with:
1. "headline": e.g. "Because you love mind-bending cosmic journeys"
2. "reasoning": a concise 1-sentence explanation of why these match their tastes.
3. "recommendedTitles": array of string titles that exist in the available catalog.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI Recommendation Error:', err);
    res.json({
      headline: 'Curated Based on Your Viewing History',
      reasoning: 'Tailored selections featuring high-concept sci-fi, intense world-building, and top-rated drama.',
      recommendedTitles: ['Interstellar Voyage', 'Chronicles of Elysium'],
    });
  }
});

// AI Movie Chatbot Concierge ("CineBot")
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], catalogSummary = [] } = req.body;

    const catalogText = Array.isArray(catalogSummary)
      ? catalogSummary.map((m: any) => `- "${m.title}" (Type: ${m.type}, Genres: ${m.genres?.join(', ')}, Rating: ${m.rating}): ${m.synopsis}`).join('\n')
      : 'Chronicles of Elysium (Fantasy), Interstellar Voyage (Sci-Fi), Neon Syndicate (Cyberpunk/Mystery), Monolith: The Frontier (Sci-Fi Thriller)';

    const prompt = `You are "CinePulse AI Concierge", an expert film critic, TV show connoisseur, and helpful streaming guide for CinePulse.
The user is talking to you. You can converse in English or Arabic (العربية) depending on the user's language.

Current CinePulse Library:
${catalogText}

User Query: "${message}"

Directives:
1. If the user asks in Arabic, answer in fluent, friendly Arabic. If in English, answer in polished English.
2. Recommend specific titles from the library that match their exact mood or preferences.
3. Keep answers engaging, cinematic, and under 3-4 sentences.
4. If appropriate, mention why a specific title in the library matches what they want.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      reply: response.text || 'I recommend checking out our top-rated sci-fi and fantasy blockbusters in the catalog!',
    });
  } catch (err: any) {
    console.error('AI Chat Error:', err);
    res.json({
      reply: 'Based on our catalog, I highly recommend "Interstellar Voyage" for cosmic sci-fi or "Chronicles of Elysium" for rich episodic fantasy!',
    });
  }
});

// AI Film Summary / Executive Breakdown
app.post('/api/ai/summary', async (req: Request, res: Response) => {
  try {
    const { title, synopsis, genres } = req.body;

    const prompt = `Generate a cinematic 2-sentence executive summary and key themes analysis for the film/series "${title}" (${genres?.join(', ')}):
Synopsis: ${synopsis}
Output formatted with 2 bullet points:
- Key Themes:
- Who Will Enjoy This:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (err: any) {
    res.json({
      summary: `An epic cinematic journey exploring high-stakes human resilience and immersive worlds. Perfect for fans of ${req.body.genres?.[0] || 'Drama'}.`,
    });
  }
});

// SEO: Robots.txt & Sitemap.xml
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml\n`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cinepulse.io/</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://cinepulse.io/?tab=movies</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://cinepulse.io/?tab=series</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://cinepulse.io/?tab=anime</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://cinepulse.io/?tab=trending</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
});

// Vite Integration (Dev) or Static Serve (Prod)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CinePulse Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
});
