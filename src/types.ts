export type MediaType = 'movie' | 'series';

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  durationSeconds?: number;
  synopsis: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface SubtitleTrack {
  id: string;
  label: string;
  lang: string;
  src?: string; // Optional .vtt / .srt file url
  cues?: Array<{ start: number; end: number; text: string }>;
}

export interface MediaItem {
  id: string;
  title: string;
  arabicTitle?: string;
  keywords?: string[];
  type: MediaType;
  tagline?: string;
  synopsis: string;
  releaseYear: number;
  rating: number; // e.g. 8.7
  contentRating: string; // PG-13, TV-MA, R, etc.
  genres: string[];
  duration?: string; // e.g. "2h 14m" for movies
  seasons?: Season[]; // For TV series
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string; // Main movie video URL or trailer/stream
  director?: string;
  cast: string[];
  language?: string;
  quality: '4K UHD' | '1080p' | 'HD';
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt: number;
  tmdbId?: number | string;
  subtitles?: SubtitleTrack[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
}

export interface WatchProgress {
  mediaId: string;
  episodeId?: string;
  timestampSeconds: number;
  durationSeconds: number;
  lastWatchedAt: number;
  completed: boolean;
}

export interface Comment {
  id: string;
  mediaId: string;
  episodeId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  content: string;
  createdAt: number;
}

export interface GlobalAdSettings {
  adSensePublisherId?: string; // e.g. ca-pub-1234567890123456
  autoAds: boolean;
  globalHeadCode?: string; // Adsterra, PopAds, Monetag or Google script
  popunderCode?: string;
  adBlockNoticeEnabled: boolean;
  googleSiteVerification?: string;
}

export interface AdUnitConfig {
  id: string;
  name: string;
  placement: 'header_leaderboard' | 'preroll_video' | 'in_feed_native' | 'below_player' | 'sticky_bottom';
  enabled: boolean;
  adFormat?: 'banner' | 'code'; // visual banner or custom HTML/Script code from network
  customCode?: string; // raw HTML / AdSense <ins> / script snippet
  title: string;
  sponsorName: string;
  bannerImageUrl: string;
  videoUrl?: string;
  clickUrl: string;
  ctaText: string;
  adText: string;
  cpmRate: number;
  cpcRate: number;
  impressions: number;
  clicks: number;
  skipDelaySeconds?: number;
}

export interface AdRevenueStats {
  totalImpressions: number;
  totalClicks: number;
  estimatedEarnings: number;
  ctr: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  recommendedTitles?: string[]; // IDs of recommended media items
}
