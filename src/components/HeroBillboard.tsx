import React, { useState, useEffect } from 'react';
import { Play, Bookmark, Star, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';
import { useMedia } from '../context/MediaContext';

interface HeroBillboardProps {
  items: MediaItem[];
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({ items }) => {
  const { playMedia, isInWatchlist, toggleWatchlist, getResumeTimestamp } = useMedia();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

  // Auto rotate hero every 8 seconds if not hovered/paused
  useEffect(() => {
    if (items.length <= 1 || isAutoPlayPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length, isAutoPlayPaused]);

  if (!items || items.length === 0) return null;
  const currentItem = items[currentIndex] || items[0];

  const inWatchlist = isInWatchlist(currentItem.id);
  const resumeSeconds = getResumeTimestamp(currentItem.id);

  const seasonText =
    currentItem.type === 'series' && currentItem.seasons
      ? `${currentItem.seasons.length} ${currentItem.seasons.length === 1 ? 'Season' : 'Seasons'}`
      : currentItem.duration || '2h 15m';

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div
      onMouseEnter={() => setIsAutoPlayPaused(true)}
      onMouseLeave={() => setIsAutoPlayPaused(false)}
      className="relative w-full h-[520px] sm:h-[600px] lg:h-[660px] overflow-hidden rounded-2xl bg-black mb-10 border border-white/10 shadow-2xl group select-none"
    >
      {/* Dynamic Background Image */}
      <img
        key={currentItem.id}
        src={currentItem.backdropUrl || currentItem.posterUrl}
        alt={currentItem.title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 animate-in fade-in duration-700"
      />

      {/* Measured Scrims & Deep Obsidian Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080b11] via-[#080b11]/70 to-transparent sm:w-4/5" />

      {/* Carousel Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
            title="Previous highlight"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
            title="Next highlight"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Hero Content Container */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col justify-end pb-12 sm:pb-16 max-w-3xl">
        {/* Editorial Pill-Free Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-500/30">
            {currentItem.type === 'series' ? 'Featured Series' : 'Top Blockbuster'}
          </span>
          <span className="text-[11px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
            {currentItem.quality}
          </span>
          {currentItem.rating >= 8.8 && (
            <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              <span>Critic's Choice</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display text-balance mb-3 leading-[1.08]">
          {currentItem.title}
        </h1>

        {/* Unboxed Metadata with clean typographic separators */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-300 mb-4">
          <div className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
            <Star className="w-4 h-4 fill-current" />
            <span>{currentItem.rating.toFixed(1)} IMDb</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{currentItem.releaseYear}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono text-xs uppercase text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
            {currentItem.contentRating}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{seasonText}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400">{currentItem.genres.join(', ')}</span>
        </div>

        {/* Tagline & Synopsis */}
        {currentItem.tagline && (
          <p className="text-xs sm:text-sm text-rose-300 font-medium italic mb-2">
            "{currentItem.tagline}"
          </p>
        )}
        <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl line-clamp-3 mb-6">
          {currentItem.synopsis}
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => playMedia(currentItem)}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-lg shadow-rose-950/80 active:scale-98 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>{resumeSeconds > 10 ? 'Resume Playing' : 'Watch Now'}</span>
          </button>

          <button
            onClick={() => toggleWatchlist(currentItem.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl border transition-all active:scale-98 whitespace-nowrap backdrop-blur-md ${
              inWatchlist
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-900/60'
                : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
            <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>
        </div>

        {/* Carousel indicators dots */}
        {items.length > 1 && (
          <div className="flex items-center gap-1.5 mt-8">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all ${
                  currentIndex === idx ? 'w-8 bg-rose-600' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`Go to ${item.title}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
