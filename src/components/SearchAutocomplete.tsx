import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Sparkles, Film, Tv, Flame, Play, Clapperboard, Star } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { MediaItem } from '../types';
import {
  matchMediaItem,
  getKeywordSuggestions,
  POPULAR_CHIPS,
  KeywordSuggestion,
  normalizeSearchTerm,
} from '../data/keywordsDatabase';

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  onSelectMedia?: (item: MediaItem) => void;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  className = '',
  placeholder = 'ابحث عن اسم الفيلم، المسلسل، أو الأنمي (حتى بحرف واحد)...',
  onSelectMedia,
}) => {
  const { mediaList, searchQuery, setSearchQuery, setSelectedMedia, setCurrentPage } = useMedia();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter media items using fuzzy & keyword matching
  const matchingMedia = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return mediaList
      .filter((item) => matchMediaItem(item, searchQuery))
      .slice(0, 6);
  }, [mediaList, searchQuery]);

  // Keyword suggestions
  const keywordSuggestions = useMemo(() => {
    return getKeywordSuggestions(searchQuery, 5);
  }, [searchQuery]);

  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item);
    setIsOpen(false);
    if (onSelectMedia) onSelectMedia(item);
  };

  const handleApplyKeyword = (kw: string) => {
    setSearchQuery(kw);
    setCurrentPage(1);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setCurrentPage(1);
    if (inputRef.current) inputRef.current.focus();
  };

  const getItemTypeLabel = (item: MediaItem) => {
    const isAnime =
      item.genres.includes('Animation') ||
      item.keywords?.some((k) => k.toLowerCase().includes('anime') || k.includes('انمي'));
    if (isAnime) return { label: 'ANIME', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (item.type === 'movie') return { label: 'MOVIE', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    return { label: 'SERIES', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar */}
      <div className="relative group">
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-[#111726]/95 border border-white/10 group-focus-within:border-rose-500/60 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner"
        />

        {searchQuery ? (
          <button
            onClick={handleClear}
            title="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 pointer-events-none">
            <span>Quick</span>
          </div>
        )}
      </div>

      {/* Live Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[#0d121f]/98 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-150">
          {/* Section 1: Matching Media Titles */}
          {searchQuery.trim() && matchingMedia.length > 0 && (
            <div className="p-2 sm:p-3">
              <div className="flex items-center justify-between px-2.5 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                <span>نتائج البحث الفورية ({matchingMedia.length})</span>
                <span className="text-[10px] text-emerald-400">اضغط للمشاهدة فوراً</span>
              </div>
              <div className="space-y-1">
                {matchingMedia.map((item) => {
                  const badge = getItemTypeLabel(item);
                  return (
                    <button
                      key={`search-res-${item.id}`}
                      onClick={() => handleSelectMedia(item)}
                      className="w-full flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-lg border border-white/10 shrink-0 group-hover:border-rose-500/50 transition-colors"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {item.releaseYear}
                            </span>
                            <div className="flex items-center text-amber-400 text-[11px] font-mono">
                              <Star className="w-3 h-3 fill-current mr-0.5" />
                              <span>{item.rating}</span>
                            </div>
                          </div>
                          <div className="font-semibold text-white text-xs sm:text-sm truncate group-hover:text-rose-400 transition-colors">
                            {item.title}
                          </div>
                          {item.arabicTitle && (
                            <div className="text-[11px] text-slate-400 truncate">
                              {item.arabicTitle}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 truncate hidden sm:block">
                            {item.genres.join(' · ')}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 p-2 rounded-lg bg-rose-600/10 border border-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Keyword Predictions */}
          {searchQuery.trim() && keywordSuggestions.length > 0 && (
            <div className="p-2 sm:p-3 bg-black/20">
              <div className="px-2.5 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                اقتراحات الكلمات المفتاحية
              </div>
              <div className="flex flex-wrap gap-1.5 px-1">
                {keywordSuggestions.map((kw, idx) => (
                  <button
                    key={`kw-sug-${idx}`}
                    onClick={() => handleApplyKeyword(kw.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 bg-white/5 hover:bg-rose-600 hover:text-white rounded-lg border border-white/5 transition-all active:scale-95"
                  >
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>{kw.text}</span>
                    {kw.arabic && <span className="text-[10px] text-slate-400">({kw.arabic})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Popular & Trending Quick Search Chips */}
          <div className="p-3 bg-gradient-to-b from-[#090e18] to-[#0d121f]">
            <div className="flex items-center gap-1.5 px-1 pb-2 text-[11px] font-semibold text-rose-400 font-mono">
              <Flame className="w-3.5 h-3.5" />
              <span>الكلمات الأكثر بحثاً والتريند (أنيمي، أفلام، مسلسلات)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CHIPS.map((chip, idx) => (
                <button
                  key={`chip-${idx}`}
                  onClick={() => handleApplyKeyword(chip.query)}
                  className="px-2.5 py-1 text-xs text-slate-300 bg-white/5 hover:bg-rose-600/90 hover:text-white hover:border-rose-500/40 rounded-lg border border-white/5 transition-all text-left active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
