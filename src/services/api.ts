import { WatchProgress, Comment, User, MediaItem, ChatMessage } from '../types';

const CLIENT_TMDB_KEY = (import.meta as any).env?.VITE_TMDB_API_KEY || '2dca580c2a14b55200e784d157207b4d';
const TMDB_CDN_URL = 'https://api.themoviedb.org/3';

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

function formatTmdbClient(item: any, explicitType?: 'movie' | 'series'): MediaItem {
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
    ? `https://vidsrc.to/embed/movie/${tmdbId}`
    : `https://vidsrc.to/embed/tv/${tmdbId}/1/1`;

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
    duration: isMovie ? (item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : '2h 05m') : undefined,
    posterUrl,
    backdropUrl,
    videoUrl,
    cast: [],
    quality: '4K UHD',
    isFeatured: (item.popularity || 0) > 100,
    isTrending: true,
    createdAt: Date.now(),
  };
}

// Safely fetch helper
async function safeFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call to ${url} failed, using resilient fallback.`, err);
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

// TMDB API Calls with Dual Backend + Direct CDN Fallback (DevOps Resilience)
export async function fetchTmdbTrending(type: 'all' | 'movie' | 'tv' = 'all', page = 1): Promise<{ results: MediaItem[]; totalPages: number }> {
  try {
    const res = await safeFetch<{ results: MediaItem[]; totalPages: number }>(`/api/tmdb/trending?type=${type}&page=${page}`);
    if (res && res.results && res.results.length > 0) return res;
  } catch {}

  // Direct CDN fallback for pure static Vercel / Netlify deployment
  try {
    const directRes = await fetch(`${TMDB_CDN_URL}/trending/${type}/week?api_key=${CLIENT_TMDB_KEY}&page=${page}`);
    if (directRes.ok) {
      const data = await directRes.json();
      const results = (data.results || [])
        .filter((item: any) => item.poster_path && (item.title || item.name))
        .map((item: any) => formatTmdbClient(item));
      return { results, totalPages: data.total_pages || 1 };
    }
  } catch (e) {
    console.warn('Direct TMDB fallback failed:', e);
  }

  return { results: [], totalPages: 1 };
}

export async function fetchTmdbPopular(type: 'movie' | 'tv' = 'movie', page = 1): Promise<{ results: MediaItem[]; totalPages: number }> {
  try {
    const res = await safeFetch<{ results: MediaItem[]; totalPages: number }>(`/api/tmdb/popular?type=${type}&page=${page}`);
    if (res && res.results && res.results.length > 0) return res;
  } catch {}

  // Direct CDN fallback
  try {
    const directRes = await fetch(`${TMDB_CDN_URL}/${type}/popular?api_key=${CLIENT_TMDB_KEY}&page=${page}`);
    if (directRes.ok) {
      const data = await directRes.json();
      const results = (data.results || [])
        .filter((item: any) => item.poster_path && (item.title || item.name))
        .map((item: any) => formatTmdbClient(item, type === 'tv' ? 'series' : 'movie'));
      return { results, totalPages: data.total_pages || 1 };
    }
  } catch (e) {
    console.warn('Direct TMDB popular fallback failed:', e);
  }

  return { results: [], totalPages: 1 };
}

export async function fetchTmdbSearch(query: string, page = 1): Promise<{ results: MediaItem[]; totalPages: number }> {
  try {
    const res = await safeFetch<{ results: MediaItem[]; totalPages: number }>(`/api/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`);
    if (res && res.results && res.results.length > 0) return res;
  } catch {}

  // Direct CDN fallback
  try {
    const directRes = await fetch(`${TMDB_CDN_URL}/search/multi?api_key=${CLIENT_TMDB_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    if (directRes.ok) {
      const data = await directRes.json();
      const results = (data.results || [])
        .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
        .map((item: any) => formatTmdbClient(item));
      return { results, totalPages: data.total_pages || 1 };
    }
  } catch (e) {
    console.warn('Direct TMDB search fallback failed:', e);
  }

  return { results: [], totalPages: 1 };
}

export async function fetchTmdbDetails(type: 'movie' | 'series' | 'tv', id: number | string): Promise<MediaItem | null> {
  try {
    const res = await safeFetch<MediaItem>(`/api/tmdb/details/${type}/${id}`);
    if (res) return res;
  } catch {}

  // Direct CDN fallback
  try {
    const tmdbType = type === 'series' || type === 'tv' ? 'tv' : 'movie';
    const directRes = await fetch(`${TMDB_CDN_URL}/${tmdbType}/${id}?api_key=${CLIENT_TMDB_KEY}&append_to_response=credits`);
    if (directRes.ok) {
      const data = await directRes.json();
      return formatTmdbClient(data, tmdbType === 'tv' ? 'series' : 'movie');
    }
  } catch {}

  return null;
}

export async function fetchTmdbSeasonEpisodes(id: number | string, seasonNumber: number): Promise<any> {
  try {
    const res = await safeFetch(`/api/tmdb/tv/${id}/season/${seasonNumber}`);
    if (res) return res;
  } catch {}

  // Direct CDN fallback
  try {
    const directRes = await fetch(`${TMDB_CDN_URL}/tv/${id}/season/${seasonNumber}?api_key=${CLIENT_TMDB_KEY}`);
    if (directRes.ok) {
      const data = await directRes.json();
      const episodes = (data.episodes || []).map((ep: any) => ({
        id: `tmdb-tv-${id}-s${seasonNumber}-e${ep.episode_number}`,
        episodeNumber: ep.episode_number,
        title: ep.name || `Episode ${ep.episode_number}`,
        duration: ep.runtime ? `${ep.runtime}m` : '45m',
        synopsis: ep.overview || 'No description available.',
        videoUrl: `https://vidsrc.to/embed/tv/${id}/${seasonNumber}/${ep.episode_number}`,
        thumbnailUrl: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : undefined,
      }));
      return {
        seasonNumber: Number(seasonNumber),
        title: data.name || `Season ${seasonNumber}`,
        episodes,
      };
    }
  } catch {}

  return null;
}

// Watch History
export async function getWatchHistory(): Promise<WatchProgress[]> {
  try {
    const data = await safeFetch<{ history: WatchProgress[] }>('/api/user/history', undefined, { history: [] });
    if (data.history && data.history.length > 0) {
      localStorage.setItem('cinepulse_history_cache', JSON.stringify(data.history));
      return data.history;
    }
  } catch {}

  try {
    const cached = localStorage.getItem('cinepulse_history_cache');
    if (cached) return JSON.parse(cached);
  } catch {}

  return [];
}

export async function saveWatchProgress(progress: Omit<WatchProgress, 'lastWatchedAt' | 'completed'>): Promise<void> {
  try {
    await safeFetch('/api/user/history', {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  } catch (e) {
    console.warn('Failed to sync watch history with server, storing locally', e);
  }

  try {
    const cached = localStorage.getItem('cinepulse_history_cache');
    let list: WatchProgress[] = cached ? JSON.parse(cached) : [];
    const completed = progress.durationSeconds > 0 && progress.timestampSeconds / progress.durationSeconds >= 0.9;
    const newEntry: WatchProgress = {
      ...progress,
      lastWatchedAt: Date.now(),
      completed,
    };
    list = [newEntry, ...list.filter((x) => x.mediaId !== progress.mediaId || (progress.episodeId && x.episodeId !== progress.episodeId))].slice(0, 20);
    localStorage.setItem('cinepulse_history_cache', JSON.stringify(list));
  } catch {}
}

// Comments
export async function getComments(mediaId: string): Promise<Comment[]> {
  const fallbackComments: Comment[] = [
    {
      id: 'mock-1',
      mediaId,
      userName: 'FilmBuff99',
      rating: 5,
      content: 'Brilliant cinematography and incredible sound design. Highly recommended!',
      createdAt: Date.now() - 3600000,
    },
  ];

  try {
    const res = await safeFetch<{ comments: Comment[] }>(`/api/comments/${mediaId}`, undefined, { comments: fallbackComments });
    return res.comments;
  } catch {
    return fallbackComments;
  }
}

export async function postComment(mediaId: string, content: string, rating: number, userName: string, episodeId?: string): Promise<Comment> {
  const fallbackComment: Comment = {
    id: `comm-local-${Date.now()}`,
    mediaId,
    episodeId,
    userName: userName || 'You',
    rating,
    content,
    createdAt: Date.now(),
  };

  try {
    const res = await safeFetch<{ success: boolean; comment: Comment }>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ mediaId, episodeId, content, rating, userName }),
    }, { success: true, comment: fallbackComment });
    return res.comment || fallbackComment;
  } catch {
    return fallbackComment;
  }
}

// AI Recommendations
export async function getAIRecommendations(watchedTitles: string[], availableCatalog: MediaItem[]): Promise<{
  headline: string;
  reasoning: string;
  recommendedTitles: string[];
}> {
  const fallback = {
    headline: 'Curated Based on Your Viewing History',
    reasoning: 'Selected for fans of high-concept storytelling and atmospheric world-building.',
    recommendedTitles: availableCatalog.slice(0, 3).map((c) => c.title),
  };

  try {
    return await safeFetch('/api/ai/recommend', {
      method: 'POST',
      body: JSON.stringify({ watchedTitles, availableCatalog }),
    }, fallback);
  } catch {
    return fallback;
  }
}

// AI Chatbot Concierge ("CineBot")
export async function sendAIChatMessage(
  message: string,
  catalogSummary: Array<{ id: string; title: string; type: string; genres: string[]; rating: number; synopsis: string }>,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  const fallback = `Based on your request, I strongly recommend checking out our top-rated trending blockbusters like "${catalogSummary[0]?.title || 'UNABOMBER'}"!`;

  try {
    const res = await safeFetch<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, catalogSummary, history }),
    }, { reply: fallback });
    return res.reply || fallback;
  } catch {
    return fallback;
  }
}

// AI Summary & Themes
export async function getAISummary(title: string, synopsis: string, genres: string[]): Promise<string> {
  const fallback = `An immersive, character-driven cinematic masterpiece. Explores timeless themes of courage and discovery.`;
  try {
    const res = await safeFetch<{ summary: string }>('/api/ai/summary', {
      method: 'POST',
      body: JSON.stringify({ title, synopsis, genres }),
    }, { summary: fallback });
    return res.summary || fallback;
  } catch {
    return fallback;
  }
}
