import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, Bookmark, Sparkles, Bot, Search } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setSelectedGenre,
    setSearchQuery,
    watchlist,
    setIsAddModalOpen,
    setIsAdManagerOpen,
    setIsAIChatOpen,
    setEditingItem,
    user,
  } = useMedia();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tab: 'all' | 'movies' | 'series' | 'trending' | 'watchlist') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080b11]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-[#080b11]/90 via-[#080b11]/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedGenre('All');
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-2xl font-extrabold tracking-tight text-white font-display hover:text-rose-500 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <span className="text-rose-600">CINE</span>
          <span>PULSE</span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium">
          <button
            onClick={() => handleNavClick('all')}
            className={`transition-colors relative py-1 ${
              activeTab === 'all'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Home
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('movies')}
            className={`transition-colors relative py-1 ${
              activeTab === 'movies'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Movies
            {activeTab === 'movies' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('series')}
            className={`transition-colors relative py-1 ${
              activeTab === 'series'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TV Series
            {activeTab === 'series' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('anime')}
            className={`transition-colors relative py-1 flex items-center gap-1.5 ${
              activeTab === 'anime'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Anime</span>
            <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded">
              HOT
            </span>
            {activeTab === 'anime' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('trending')}
            className={`transition-colors relative py-1 ${
              activeTab === 'trending'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trending
            {activeTab === 'trending' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('watchlist')}
            className={`transition-colors relative py-1 flex items-center gap-1.5 ${
              activeTab === 'watchlist'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Watchlist
            {watchlist.length > 0 && (
              <span className="text-xs text-rose-400 font-mono">({watchlist.length})</span>
            )}
            {activeTab === 'watchlist' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary actions & AI Concierge */}
        <div className="flex items-center gap-2.5">
          {/* AI Concierge Trigger */}
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl transition-all shadow-sm whitespace-nowrap active:scale-95"
            title="Ask CinePulse AI Concierge for recommendations based on mood"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="hidden sm:inline">AI Concierge</span>
          </button>

          {/* Add Title Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all whitespace-nowrap shadow-md shadow-rose-950/60 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Title</span>
          </button>

          {/* User profile avatar */}
          <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 shrink-0 hidden sm:block">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};
