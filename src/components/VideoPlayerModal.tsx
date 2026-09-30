import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Bookmark,
  ExternalLink,
  Tv,
  Film,
  Sparkles,
  Server,
  Star,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { Episode, Comment } from '../types';
import { AdBanner } from './AdBanner';
import { getComments, postComment, getAISummary, fetchTmdbSeasonEpisodes } from '../services/api';

type EmbedServer = 'vidsrcto' | 'vidsrcpm' | 'multiembed' | 'embedsu';

const EMBED_SERVERS: { id: EmbedServer; label: string; host: string }[] = [
  { id: 'vidsrcto', label: 'Server 1 (VidSrc.to)', host: 'vidsrc.to' },
  { id: 'vidsrcpm', label: 'Server 2 (VidSrc.pm)', host: 'vidsrc.pm' },
  { id: 'multiembed', label: 'Server 3 (MultiEmbed)', host: 'multiembed.mov' },
  { id: 'embedsu', label: 'Server 4 (Embed.su)', host: 'embed.su' },
];

export const VideoPlayerModal: React.FC = () => {
  const {
    selectedMedia,
    setSelectedMedia,
    activeEpisode,
    setActiveEpisode,
    isInWatchlist,
    toggleWatchlist,
    recordProgress,
  } = useMedia();

  const [selectedServer, setSelectedServer] = useState<EmbedServer>('vidsrcto');

  // Iframe loading and error states
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeHasError, setIframeHasError] = useState(false);

  // TV Series Seasons
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState<Episode[]>([]);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);

  // Comments and AI Summary
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Clean close and state reset
  const handleClose = () => {
    setActiveEpisode(null);
    setSelectedMedia(null);
    setIsIframeLoading(false);
    setIframeHasError(false);
  };

  // Keyboard Escape listener and prevent body scroll
  useEffect(() => {
    if (!selectedMedia) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedMedia]);

  // Init/Reset when media changes
  useEffect(() => {
    if (!selectedMedia) return;

    setIsIframeLoading(true);
    setIframeHasError(false);

    if (selectedMedia.type === 'series') {
      setSelectedSeasonNumber(1);
      if (selectedMedia.seasons && selectedMedia.seasons[0]?.episodes) {
        setCurrentSeasonEpisodes(selectedMedia.seasons[0].episodes);
        if (!activeEpisode && selectedMedia.seasons[0].episodes.length > 0) {
          setActiveEpisode(selectedMedia.seasons[0].episodes[0]);
        }
      }
    }

    getComments(selectedMedia.id).then(setComments);
    setAiSummary(null);

    recordProgress(selectedMedia.id, 0, 7200, activeEpisode?.id);
  }, [selectedMedia?.id]);

  // Handle season change for TV Series
  const handleSeasonChange = async (seasonNum: number) => {
    setSelectedSeasonNumber(seasonNum);
    setIsIframeLoading(true);
    setIframeHasError(false);

    if (!selectedMedia?.tmdbId) return;

    setIsLoadingSeason(true);
    try {
      const data = await fetchTmdbSeasonEpisodes(selectedMedia.tmdbId, seasonNum);
      if (data?.episodes && data.episodes.length > 0) {
        setCurrentSeasonEpisodes(data.episodes);
        setActiveEpisode(data.episodes[0]);
      }
    } catch (e) {
      console.warn('Failed to load season episodes:', e);
    } finally {
      setIsLoadingSeason(false);
    }
  };

  // Iframe error safety timeout: If iframe doesn't trigger onLoad within 9s, release spinner
  useEffect(() => {
    if (!selectedMedia) return;

    setIsIframeLoading(true);
    setIframeHasError(false);

    const safetyTimer = setTimeout(() => {
      setIsIframeLoading(false);
    }, 9000);

    return () => clearTimeout(safetyTimer);
  }, [selectedMedia?.id, selectedServer, selectedSeasonNumber, activeEpisode?.episodeNumber]);

  if (!selectedMedia) return null;

  // Accurate Streaming URL generator for TMDB & Anime Movies & Series
  const getEmbedUrl = (): string => {
    const tmdbId = selectedMedia.tmdbId;
    const malId = selectedMedia.malId;
    const season = selectedSeasonNumber || 1;
    const episode = activeEpisode?.episodeNumber || 1;

    // Anime or item with malId
    if (malId && !tmdbId) {
      switch (selectedServer) {
        case 'vidsrcto':
          return `https://vidsrc.to/embed/tv/${malId}/${season}/${episode}`;
        case 'vidsrcpm':
          return `https://vidsrc.pm/embed/tv/${malId}/${season}/${episode}`;
        case 'multiembed':
          return `https://multiembed.mov/?video_id=${malId}&s=${season}&e=${episode}`;
        case 'embedsu':
          return `https://embed.su/embed/tv/${malId}/${season}/${episode}`;
        default:
          return `https://vidsrc.to/embed/tv/${malId}/${season}/${episode}`;
      }
    }

    if (tmdbId) {
      if (selectedMedia.type === 'movie') {
        switch (selectedServer) {
          case 'vidsrcto':
            return `https://vidsrc.to/embed/movie/${tmdbId}`;
          case 'vidsrcpm':
            return `https://vidsrc.pm/embed/movie/${tmdbId}`;
          case 'multiembed':
            return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
          case 'embedsu':
            return `https://embed.su/embed/movie/${tmdbId}`;
          default:
            return `https://vidsrc.to/embed/movie/${tmdbId}`;
        }
      } else {
        // TV Series
        switch (selectedServer) {
          case 'vidsrcto':
            return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
          case 'vidsrcpm':
            return `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`;
          case 'multiembed':
            return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
          case 'embedsu':
            return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
          default:
            return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
        }
      }
    }

    // Direct multiembed query by title if no numeric id
    if (selectedMedia.title) {
      return `https://multiembed.mov/?video_id=${encodeURIComponent(selectedMedia.title)}`;
    }

    // Custom or fallback video
    return activeEpisode?.videoUrl || selectedMedia.videoUrl;
  };

  const streamUrl = getEmbedUrl();
  const inWatchlist = isInWatchlist(selectedMedia.id);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const added = await postComment(
      selectedMedia.id,
      newCommentText,
      newRating,
      'Viewer',
      activeEpisode?.id
    );
    setComments((prev) => [added, ...prev]);
    setNewCommentText('');
  };

  const handleGenerateAISummary = async () => {
    setIsAiLoading(true);
    try {
      const summary = await getAISummary(
        selectedMedia.title,
        selectedMedia.synopsis,
        selectedMedia.genres
      );
      setAiSummary(summary);
    } catch {
      setAiSummary('An intense and cinematic viewing experience.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenDedicatedTab = () => {
    window.open(streamUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-dialog-title"
      onClick={(e) => {
        // Close cleanly when clicking directly on the dark backdrop outside modal card
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/92 backdrop-blur-md flex flex-col justify-start items-center p-2 sm:p-4 md:p-6 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-[#0b0f19] rounded-2xl border border-white/10 shadow-2xl overflow-hidden my-auto flex flex-col"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#080b12]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
              {selectedMedia.type}
            </span>
            <h2 id="player-dialog-title" className="text-sm sm:text-base font-bold text-white truncate font-display">
              {selectedMedia.title}
              {activeEpisode && (
                <span className="text-slate-400 font-normal ml-2 text-xs sm:text-sm">
                  · S{selectedSeasonNumber} E{activeEpisode.episodeNumber}: {activeEpisode.title}
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Open in Dedicated Page */}
            <button
              onClick={handleOpenDedicatedTab}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-white/10"
              title="Open full stream in dedicated window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dedicated Watch Page</span>
            </button>

            <button
              onClick={() => toggleWatchlist(selectedMedia.id)}
              className={`p-2 rounded-lg transition-colors ${
                inWatchlist ? 'text-rose-400 bg-rose-950/50' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
            </button>

            {/* The primary Close 'X' button */}
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-600/20 hover:text-rose-400 rounded-lg transition-colors"
              title="Close Player (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Streaming Video Screen Area - Guaranteed Fluid 16:9 Aspect Ratio (56.25%) */}
        <div
          className="relative w-full bg-black overflow-hidden select-none"
          style={{ paddingTop: '56.25%' }}
        >
          {/* Loading Indicator */}
          {isIframeLoading && (
            <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-3" />
              <p className="text-xs sm:text-sm font-semibold text-white">
                Loading stream from {EMBED_SERVERS.find((s) => s.id === selectedServer)?.label}...
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Streaming directly using TMDB ID: {selectedMedia.tmdbId}
              </p>
            </div>
          )}

          {/* Server Fallback Notice if Error Occurs */}
          {iframeHasError && (
            <div className="absolute inset-0 z-20 bg-[#0b0f19] flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                Stream Server Connection Issue
              </h3>
              <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                The current server ({selectedServer}) is blocked or taking too long. Please select an alternate streaming server or open the dedicated watch page.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                {EMBED_SERVERS.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => {
                      setSelectedServer(server.id);
                      setIframeHasError(false);
                      setIsIframeLoading(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedServer === server.id
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Try {server.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleOpenDedicatedTab}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Stream in New Tab (Bypasses Sandbox)</span>
              </button>
            </div>
          )}

          {/* Streaming Iframe filling 100% width and 100% height */}
          <iframe
            key={`${selectedMedia.id}-${selectedServer}-${selectedSeasonNumber}-${activeEpisode?.episodeNumber || 1}`}
            src={streamUrl}
            title={selectedMedia.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onLoad={() => setIsIframeLoading(false)}
            onError={() => {
              setIsIframeLoading(false);
              setIframeHasError(true);
            }}
            className="absolute top-0 left-0 border-0"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Server & Stream Switcher Toolbar */}
        <div className="px-4 py-2.5 bg-[#080c16] border-y border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-slate-300">Server Switcher:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {EMBED_SERVERS.map((server) => (
                <button
                  key={server.id}
                  onClick={() => {
                    setSelectedServer(server.id);
                    setIsIframeLoading(true);
                    setIframeHasError(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    selectedServer === server.id
                      ? 'bg-rose-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  {server.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsIframeLoading(true);
                setIframeHasError(false);
              }}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              title="Reload current stream"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reload Stream</span>
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={handleOpenDedicatedTab}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium"
            >
              Pop-out Player
            </button>
          </div>
        </div>

        {/* Content Details, Series Episodes, and Community Reviews */}
        <div className="p-4 sm:p-6 flex flex-col gap-6">
          <AdBanner placement="below_player" />

          {/* TV Series Episode Picker (if series) */}
          {selectedMedia.type === 'series' && (
            <div className="border border-white/10 rounded-xl p-4 bg-[#0d1322]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Episodes & Seasons
                  </h3>
                </div>

                {/* Season selector tabs */}
                <div className="flex items-center gap-1.5">
                  {(selectedMedia.seasons && selectedMedia.seasons.length > 0
                    ? selectedMedia.seasons
                    : [{ seasonNumber: 1, title: 'Season 1', episodes: [] }]
                  ).map((season) => (
                    <button
                      key={season.seasonNumber}
                      onClick={() => handleSeasonChange(season.seasonNumber)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        selectedSeasonNumber === season.seasonNumber
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Season {season.seasonNumber}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingSeason ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Loading Season {selectedSeasonNumber} episodes from TMDB...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {currentSeasonEpisodes.map((ep) => {
                    const isActive = activeEpisode?.episodeNumber === ep.episodeNumber;
                    return (
                      <div
                        key={ep.id || `ep-${ep.episodeNumber}`}
                        onClick={() => {
                          setActiveEpisode(ep);
                          setIsIframeLoading(true);
                          setIframeHasError(false);
                        }}
                        className={`group flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isActive
                            ? 'bg-rose-950/40 border-rose-500/50 text-white'
                            : 'bg-[#101728] border-white/5 text-slate-300 hover:border-white/20 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="relative w-24 h-16 rounded overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                          {ep.thumbnailUrl ? (
                            <img
                              src={ep.thumbnailUrl}
                              alt={ep.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 font-mono text-xs">
                              EP {ep.episodeNumber}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 text-white fill-current" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-mono text-rose-400 text-[11px]">
                              Episode {ep.episodeNumber}
                            </span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              {ep.duration}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-white truncate mb-1">
                            {ep.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {ep.synopsis}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Storyline & AI Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="md:col-span-2 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Storyline
                  </h3>
                  <button
                    onClick={handleGenerateAISummary}
                    disabled={isAiLoading}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    <span>{isAiLoading ? 'Analyzing...' : 'AI Synopsis & Themes'}</span>
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedMedia.synopsis}
                </p>

                {aiSummary && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#090e1a] border border-rose-500/30 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>CinePulse AI Critic Analysis:</span>
                    </div>
                    {aiSummary}
                  </div>
                )}
              </div>

              {/* Cast & Director */}
              <div className="flex flex-col gap-1.5 text-xs text-slate-400 border-t border-white/5 pt-3">
                {selectedMedia.director && (
                  <div>
                    <span className="text-slate-200 font-semibold">Director: </span>
                    <span>{selectedMedia.director}</span>
                  </div>
                )}
                {selectedMedia.cast && selectedMedia.cast.length > 0 && (
                  <div>
                    <span className="text-slate-200 font-semibold">Starring: </span>
                    <span>{selectedMedia.cast.join(', ')}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-200 font-semibold">Genres: </span>
                  <span>{selectedMedia.genres.join(' · ')}</span>
                </div>
              </div>
            </div>

            {/* Side specs & Open Provider Info */}
            <div className="bg-[#0f1422] rounded-xl p-4 border border-white/5 flex flex-col justify-between text-xs space-y-4">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Rating:</span>
                  <span className="text-amber-400 font-bold font-mono">
                    ★ {selectedMedia.rating.toFixed(1)} / 10
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Year:</span>
                  <span className="text-slate-200 font-mono">{selectedMedia.releaseYear}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>TMDB ID:</span>
                  <span className="text-emerald-400 font-mono font-semibold">{selectedMedia.tmdbId || 'N/A'}</span>
                </div>
              </div>

              <button
                onClick={handleOpenDedicatedTab}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Screen Tab</span>
              </button>
            </div>
          </div>

          {/* Community Reviews & Comments */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-500" />
              <span>Community Reviews ({comments.length})</span>
            </h3>

            <form onSubmit={handleAddComment} className="mb-6 p-3.5 rounded-xl bg-[#0e1424] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Leave your rating & review:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${star <= newRating ? 'fill-current' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Share your thoughts about this title..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#090d18] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-40"
                >
                  Post Review
                </button>
              </div>
            </form>

            <div className="space-y-3 max-h-56 overflow-y-auto">
              {comments.map((comm) => (
                <div key={comm.id} className="p-3 rounded-lg bg-[#0e1424] border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white">{comm.userName}</span>
                    <div className="flex items-center gap-1 text-amber-400 text-[11px] font-mono">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{comm.rating} / 5</span>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{comm.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
