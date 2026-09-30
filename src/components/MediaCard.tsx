import React from 'react';
import { Play, Bookmark, Edit2, Trash2, Star } from 'lucide-react';
import { MediaItem } from '../types';
import { useMedia } from '../context/MediaContext';

interface MediaCardProps {
  item: MediaItem;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  const {
    playMedia,
    isInWatchlist,
    toggleWatchlist,
    deleteMediaItem,
    setEditingItem,
    setIsAddModalOpen,
    getResumeTimestamp,
    watchHistory,
  } = useMedia();

  const inWatchlist = isInWatchlist(item.id);
  const resumeSeconds = getResumeTimestamp(item.id);

  // Check progress percentage
  const historyEntry = watchHistory.find((h) => h.mediaId === item.id);
  const progressPercent =
    historyEntry && historyEntry.durationSeconds > 0
      ? Math.min(100, Math.round((historyEntry.timestampSeconds / historyEntry.durationSeconds) * 100))
      : 0;

  const handleCardClick = () => {
    playMedia(item);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${item.title}" from catalog?`)) {
      deleteMediaItem(item.id);
    }
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(item.id);
  };

  const seasonCount = item.seasons?.length || 0;
  const episodeCount = item.seasons?.reduce((acc, s) => acc + s.episodes.length, 0) || 0;

  return (
    <article
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col h-full rounded-xl overflow-hidden border border-white/5 bg-[#0f1422] p-2.5 sm:p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-2xl hover:shadow-black/70"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-slate-900 border border-white/5 mb-2.5">
        <img
          src={item.posterUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

        {/* Quality indicator & Media Type */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-200">
          <span className="bg-black/75 px-1.5 py-0.5 rounded text-rose-400 border border-white/10 uppercase tracking-wider text-[10px]">
            {item.type}
          </span>
          <span className="bg-black/60 px-1.5 py-0.5 rounded text-slate-300 border border-white/10 text-[10px]">
            {item.quality}
          </span>
        </div>

        {/* Bookmark button */}
        <button
          onClick={handleWatchlist}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-colors ${
            inWatchlist
              ? 'bg-rose-600 text-white'
              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/45 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-950 transition-transform group-hover:scale-110">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Resume progress bar across bottom of image */}
        {progressPercent > 5 && !historyEntry?.completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-rose-600 transition-all"
              style={{ width: `${progressPercent}%` }}
              title={`Watched ${progressPercent}%`}
            />
          </div>
        )}

        {/* Bottom meta over image: Rating & Year */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
          <span className="text-slate-300 text-[11px] font-mono">{item.releaseYear}</span>
        </div>
      </div>

      {/* Info section below poster */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors line-clamp-1 mb-1">
            {item.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 truncate">
            <span>{item.genres.slice(0, 2).join(', ')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            {item.type === 'movie' ? (
              <span>{item.duration || '2h 10m'}</span>
            ) : (
              <span>
                {seasonCount} {seasonCount === 1 ? 'Season' : 'Seasons'}
                {episodeCount > 0 && ` (${episodeCount} eps)`}
              </span>
            )}
          </div>
        </div>

        {/* Card bottom toolbar */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
            {item.contentRating}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              title="Edit Title & Stream Link"
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={handleDelete}
              title="Delete Title"
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
