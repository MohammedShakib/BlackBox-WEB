export interface MediaItem {
  id: string;
  provider: string;
  providerId: string;
  title: string;
  description?: string;
  poster?: string;
  backdrop?: string;
  year?: number;
  genres?: string[];
  rating?: string;
  type: 'movie' | 'series' | 'live';
  seasons?: Season[];
  duration?: string;
  quality?: string;
  recommendations?: MediaItem[];
}

export interface Season {
  seasonNumber: number;
  seasonName?: string;
  episodes: Episode[];
}

export interface Episode {
  episodeNumber: number;
  title?: string;
  link?: string;
}

export interface StreamSource {
  url: string;
  type: 'hls' | 'mp4' | 'm3u8' | 'unknown';
  quality?: string;
  headers?: Record<string, string>;
  expiresAt?: number;
}

export interface Provider {
  id: string;
  name: string;
  healthCheck: () => Promise<boolean>;
  getHome: () => Promise<{ title: string; items: MediaItem[] }[]>;
  search: (query: string) => Promise<MediaItem[]>;
  getDetails: (id: string) => Promise<MediaItem | null>;
  resolveStreams: (id: string, streamUrl?: string) => Promise<StreamSource[]>;
}
