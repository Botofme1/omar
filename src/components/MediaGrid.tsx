import React, { useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Film,
  Tv,
  Sparkles,
  X,
  History,
  Star,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { MediaCard } from './MediaCard';
import { SearchAutocomplete } from './SearchAutocomplete';
import { MediaItem } from '../types';
import { matchMediaItem } from '../data/keywordsDatabase';

const GENRES = [
  'All',
  'Anime',
  'Action',
  'Sci-Fi',
  'Fantasy',
  'Drama',
  'Thriller',
  'Mystery',
  'Adventure',
  'Crime',
  'Animation',
];

const YEARS = ['all', 2026, 2025, 2024];

export const MediaGrid: React.FC = () => {
  const {
    mediaList,
    watchlist,
    watchHistory,
    activeTab,
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
    aiRecommendation,
    setIsAddModalOpen,
  } = useMedia();

  // Continue watching items
  const continueWatchingItems = useMemo(() => {
    return watchHistory
      .filter((h) => !h.completed && h.timestampSeconds > 10)
      .map((h) => mediaList.find((m) => m.id === h.mediaId))
      .filter((m): m is MediaItem => !!m)
      .slice(0, 6);
  }, [watchHistory, mediaList]);

  // AI Recommended items
  const aiRecommendedItems = useMemo(() => {
    if (!aiRecommendation?.recommendedTitles) return [];
    return mediaList.filter((m) =>
      aiRecommendation.recommendedTitles.some((title) =>
        m.title.toLowerCase().includes(title.toLowerCase())
      )
    );
  }, [aiRecommendation, mediaList]);

  // Main filtered catalog
  const filteredList = useMemo(() => {
    return mediaList.filter((item) => {
      // Tab filter
      if (activeTab === 'movies' && item.type !== 'movie') return false;
      if (activeTab === 'series' && item.type !== 'series') return false;
      if (activeTab === 'anime') {
        const isAnime =
          item.genres.includes('Animation') ||
          (item.keywords || []).some((k) => k.toLowerCase().includes('anime') || k.includes('انمي'));
        if (!isAnime) return false;
      }
      if (activeTab === 'trending' && !item.isTrending) return false;
      if (activeTab === 'watchlist' && !watchlist.includes(item.id)) return false;

      // Genre filter (including Anime)
      if (selectedGenre !== 'All') {
        if (selectedGenre === 'Anime') {
          const isAnime =
            item.genres.includes('Animation') ||
            (item.keywords || []).some((k) => k.toLowerCase().includes('anime') || k.includes('انمي'));
          if (!isAnime) return false;
        } else if (!item.genres.includes(selectedGenre)) {
          return false;
        }
      }

      // Year filter
      if (releaseYearFilter !== 'all' && item.releaseYear !== releaseYearFilter) {
        return false;
      }

      // Rating filter
      if (minRatingFilter > 0 && item.rating < minRatingFilter) {
        return false;
      }

      // Robust instant keyword and title search
      if (searchQuery.trim() && !matchMediaItem(item, searchQuery)) {
        return false;
      }

      return true;
    });
  }, [mediaList, activeTab, selectedGenre, releaseYearFilter, minRatingFilter, searchQuery, watchlist]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  return (
    <div className="w-full space-y-12">
      {/* 1. CONTINUE WATCHING ROW (Directive 4 & 5) */}
      {continueWatchingItems.length > 0 && activeTab === 'all' && !searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-rose-500" />
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Continue Watching
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Resumes right from your last frame
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {continueWatchingItems.map((item) => (
              <MediaCard key={`cw-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* 2. AI CURATED RECOMMENDATIONS ROW (Directive 5) */}
      {aiRecommendedItems.length > 0 && activeTab === 'all' && !searchQuery && (
        <section className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#11192e]/80 via-[#161226]/80 to-[#11192e]/80 border border-rose-500/20 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-600 text-white shadow-md shadow-rose-950">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  {aiRecommendation?.headline || 'AI Curated For You'}
                </h3>
                <p className="text-xs text-slate-400">
                  {aiRecommendation?.reasoning || 'Personalized cinematic selections based on your streaming profile.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {aiRecommendedItems.map((item) => (
              <MediaCard key={`ai-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* 3. MAIN CATALOG GRID & ADVANCED FILTER TOOLBAR */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Count */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                {activeTab === 'watchlist'
                  ? 'My Watchlist'
                  : activeTab === 'movies'
                  ? 'All Blockbuster Movies'
                  : activeTab === 'series'
                  ? 'All TV Series & Shows'
                  : activeTab === 'anime'
                  ? 'Japanese Anime (MyAnimeList / Jikan)'
                  : activeTab === 'trending'
                  ? 'Trending Now'
                  : 'Explore All Titles'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing <span className="font-mono text-slate-200">{filteredList.length}</span> titles
                {selectedGenre !== 'All' && ` in ${selectedGenre}`}
                {releaseYearFilter !== 'all' && ` · ${releaseYearFilter}`}
                {minRatingFilter > 0 && ` · Rating ≥ ${minRatingFilter}`}
              </p>
            </div>

            {/* Predictive Autocomplete Search Bar */}
            <div className="w-full md:w-96">
              <SearchAutocomplete />
            </div>
          </div>

          {/* Filter Bar: Genres, Release Year, and Min Rating Dropdowns */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
            {/* Genre Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {GENRES.map((genre) => {
                const isSelected = selectedGenre === genre;
                return (
                  <button
                    key={genre}
                    onClick={() => {
                      setSelectedGenre(genre);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-rose-600 text-white font-semibold shadow-sm'
                        : 'bg-[#111726] text-slate-300 hover:text-white hover:bg-slate-800 border border-white/5'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Filters: Year & Rating */}
            <div className="flex items-center gap-2 text-xs">
              {/* Year Filter */}
              <select
                value={releaseYearFilter}
                onChange={(e) => {
                  setReleaseYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-[#111726] border border-white/10 rounded-lg text-slate-300 focus:outline-none focus:border-rose-500"
              >
                <option value="all">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>

              {/* Min Rating */}
              <select
                value={minRatingFilter}
                onChange={(e) => {
                  setMinRatingFilter(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-[#111726] border border-white/10 rounded-lg text-slate-300 focus:outline-none focus:border-rose-500"
              >
                <option value="0">All Ratings</option>
                <option value="8.5">★ 8.5+</option>
                <option value="8.0">★ 8.0+</option>
                <option value="7.0">★ 7.0+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredList.length === 0 ? (
          <div className="w-full py-16 px-4 text-center rounded-2xl border border-dashed border-white/10 bg-[#0d121f]">
            <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No titles found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              {searchQuery
                ? `No movie or series matched "${searchQuery}". Try different keywords or reset filters.`
                : 'No titles match the selected criteria.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All');
                setReleaseYearFilter('all');
                setMinRatingFilter(0);
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {paginatedItems.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#111726] border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#111726] border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
