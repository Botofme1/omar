import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MediaItem, Episode, User, WatchProgress } from '../types';
import { INITIAL_MEDIA_ITEMS } from '../data/defaultMedia';
import {
  getWatchHistory,
  saveWatchProgress,
  getAIRecommendations,
  fetchTmdbTrending,
  fetchTmdbPopular,
  fetchTmdbSearch,
  fetchTmdbDetails,
  fetchJikanTopAnime,
  searchJikanAnime,
} from '../services/api';

interface MediaContextType {
  mediaList: MediaItem[];
  watchlist: string[];
  toggleWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  selectedMedia: MediaItem | null;
  setSelectedMedia: (item: MediaItem | null) => void;
  activeEpisode: Episode | null;
  setActiveEpisode: (ep: Episode | null) => void;
  playMedia: (item: MediaItem, episode?: Episode, resumeAtSecond?: number) => Promise<void>;
  addMediaItem: (item: Omit<MediaItem, 'id' | 'createdAt'>) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  resetCatalogToDefaults: () => void;
  
  // Watch History & Resume Watching
  watchHistory: WatchProgress[];
  recordProgress: (mediaId: string, timestampSeconds: number, durationSeconds: number, episodeId?: string) => void;
  getResumeTimestamp: (mediaId: string, episodeId?: string) => number;
  
  // Navigation & Filters
  activeTab: 'all' | 'movies' | 'series' | 'anime' | 'trending' | 'watchlist';
  setActiveTab: (tab: 'all' | 'movies' | 'series' | 'anime' | 'trending' | 'watchlist') => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  releaseYearFilter: number | 'all';
  setReleaseYearFilter: (year: number | 'all') => void;
  minRatingFilter: number;
  setMinRatingFilter: (rating: number) => void;

  // Pagination & Loading
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  isLoading: boolean;

  // AI Recommendations
  aiRecommendation: { headline: string; reasoning: string; recommendedTitles: string[] } | null;
  refreshAIRecommendations: () => Promise<void>;

  // AI Chat & Modals
  isAIChatOpen: boolean;
  setIsAIChatOpen: (open: boolean) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isAdManagerOpen: boolean;
  setIsAdManagerOpen: (open: boolean) => void;
  editingItem: MediaItem | null;
  setEditingItem: (item: MediaItem | null) => void;
  user: User;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

const WATCHLIST_STORAGE_KEY = 'cinepulse_watchlist';
const CUSTOM_TITLES_KEY = 'cinepulse_custom_titles';

const DEFAULT_USER: User = {
  id: 'user-default',
  name: 'Alex Mercer',
  email: 'alex@cinepulse.io',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  role: 'admin',
};

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customTitles, setCustomTitles] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_TITLES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [tmdbItems, setTmdbItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [watchHistory, setWatchHistory] = useState<WatchProgress[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'series' | 'anime' | 'trending' | 'watchlist'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [releaseYearFilter, setReleaseYearFilter] = useState<number | 'all'>('all');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdManagerOpen, setIsAdManagerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [user] = useState<User>(DEFAULT_USER);

  const [aiRecommendation, setAiRecommendation] = useState<{
    headline: string;
    reasoning: string;
    recommendedTitles: string[];
  } | null>(null);

  // Load live TMDB content dynamically based on tab / search
  const loadTmdbContent = useCallback(async () => {
    setIsLoading(true);
    try {
      if (searchQuery.trim().length > 1) {
        if (activeTab === 'anime') {
          const jikanSearch = await searchJikanAnime(searchQuery.trim(), 1);
          if (jikanSearch.results.length > 0) {
            setTmdbItems(jikanSearch.results);
            setIsLoading(false);
            return;
          }
        }
        const data = await fetchTmdbSearch(searchQuery.trim(), 1);
        if (data.results.length > 0) {
          setTmdbItems(data.results);
          setIsLoading(false);
          return;
        }
      }

      if (activeTab === 'movies') {
        const data = await fetchTmdbPopular('movie', 1);
        setTmdbItems(data.results);
      } else if (activeTab === 'series') {
        const data = await fetchTmdbPopular('tv', 1);
        setTmdbItems(data.results);
      } else if (activeTab === 'anime') {
        // Real Jikan MyAnimeList API for Anime
        const jikanData = await fetchJikanTopAnime(1);
        if (jikanData.results.length > 0) {
          setTmdbItems(jikanData.results);
        } else {
          const tmdbAnime = await fetchTmdbSearch('anime', 1);
          setTmdbItems(tmdbAnime.results);
        }
      } else if (activeTab === 'trending') {
        const data = await fetchTmdbTrending('all', 1);
        setTmdbItems(data.results);
      } else {
        // 'all' tab: fetch trending
        const data = await fetchTmdbTrending('all', 1);
        setTmdbItems(data.results);
      }
    } catch (e) {
      console.warn('Error fetching TMDB content, using fallback:', e);
      setTmdbItems(INITIAL_MEDIA_ITEMS);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    loadTmdbContent();
  }, [loadTmdbContent]);

  // Combined catalog: curated featured items (Anime & Blockbusters) + dynamic TMDB titles + custom titles
  const mediaList = React.useMemo(() => {
    const map = new Map<string, MediaItem>();
    INITIAL_MEDIA_ITEMS.forEach((item) => map.set(item.id, item));
    tmdbItems.forEach((item) => map.set(item.id, item));
    customTitles.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [customTitles, tmdbItems]);

  // Initial load for watch history
  useEffect(() => {
    getWatchHistory().then((hist) => {
      if (hist && hist.length > 0) setWatchHistory(hist);
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_TITLES_KEY, JSON.stringify(customTitles));
    } catch {}
  }, [customTitles]);

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isInWatchlist = (id: string) => watchlist.includes(id);

  const recordProgress = useCallback((mediaId: string, timestampSeconds: number, durationSeconds: number, episodeId?: string) => {
    saveWatchProgress({ mediaId, episodeId, timestampSeconds, durationSeconds });
    setWatchHistory((prev) => {
      const filtered = prev.filter((h) => h.mediaId !== mediaId || (episodeId && h.episodeId !== episodeId));
      return [
        {
          mediaId,
          episodeId,
          timestampSeconds,
          durationSeconds,
          lastWatchedAt: Date.now(),
          completed: durationSeconds > 0 && timestampSeconds / durationSeconds >= 0.9,
        },
        ...filtered,
      ].slice(0, 20);
    });
  }, []);

  const getResumeTimestamp = useCallback((mediaId: string, episodeId?: string): number => {
    const entry = watchHistory.find((h) => h.mediaId === mediaId && (!episodeId || h.episodeId === episodeId));
    if (entry && !entry.completed && entry.timestampSeconds > 5) {
      return entry.timestampSeconds;
    }
    return 0;
  }, [watchHistory]);

  const playMedia = async (item: MediaItem, episode?: Episode, resumeAtSecond?: number) => {
    // If it's a TMDB TV series and seasons are not loaded yet, fetch full details
    if (item.tmdbId && item.type === 'series' && (!item.seasons || item.seasons.length === 0)) {
      try {
        const fullDetails = await fetchTmdbDetails('series', item.tmdbId);
        if (fullDetails) {
          item = { ...item, ...fullDetails };
        }
      } catch (err) {
        console.warn('Could not fetch TMDB full details for player', err);
      }
    }

    setSelectedMedia(item);
    if (episode) {
      setActiveEpisode(episode);
    } else if (item.type === 'series' && item.seasons?.[0]?.episodes?.[0]) {
      setActiveEpisode(item.seasons[0].episodes[0]);
    } else {
      setActiveEpisode(null);
    }
  };

  const addMediaItem = (itemData: Omit<MediaItem, 'id' | 'createdAt'>) => {
    const newItem: MediaItem = {
      ...itemData,
      id: `media-${Date.now()}`,
      createdAt: Date.now(),
    };
    setCustomTitles((prev) => [newItem, ...prev]);
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setCustomTitles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteMediaItem = (id: string) => {
    setCustomTitles((prev) => prev.filter((item) => item.id !== id));
    setTmdbItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedMedia?.id === id) {
      setSelectedMedia(null);
    }
  };

  const resetCatalogToDefaults = () => {
    setCustomTitles([]);
    loadTmdbContent();
  };

  const refreshAIRecommendations = useCallback(async () => {
    const watchedNames = watchHistory
      .map((h) => mediaList.find((m) => m.id === h.mediaId)?.title)
      .filter((t): t is string => !!t);

    const rec = await getAIRecommendations(watchedNames, mediaList);
    setAiRecommendation(rec);
  }, [watchHistory, mediaList]);

  useEffect(() => {
    if (mediaList.length > 0) {
      refreshAIRecommendations();
    }
  }, [mediaList.length]);

  return (
    <MediaContext.Provider
      value={{
        mediaList,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        selectedMedia,
        setSelectedMedia,
        activeEpisode,
        setActiveEpisode,
        playMedia,
        addMediaItem,
        updateMediaItem,
        deleteMediaItem,
        resetCatalogToDefaults,
        watchHistory,
        recordProgress,
        getResumeTimestamp,
        activeTab,
        setActiveTab,
        selectedGenre,
        setSelectedGenre,
        searchQuery,
        setSearchQuery,
        releaseYearFilter,
        setReleaseYearFilter,
        minRatingFilter,
        setMinRatingFilter,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        isLoading,
        aiRecommendation,
        refreshAIRecommendations,
        isAIChatOpen,
        setIsAIChatOpen,
        isAddModalOpen,
        setIsAddModalOpen,
        isAdManagerOpen,
        setIsAdManagerOpen,
        editingItem,
        setEditingItem,
        user,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
