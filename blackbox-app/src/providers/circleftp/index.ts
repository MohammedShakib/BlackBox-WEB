import { Provider, MediaItem, StreamSource, Season, Episode } from '../types';

const MAIN_API_URL = 'http://new.circleftp.net:5000';
const BACKUP_API_URL = 'http://15.1.1.50:5000';

async function fetchApi(endpoint: string, cacheTime: number = 3600) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  try {
    const res = await fetch(`${MAIN_API_URL}${cleanEndpoint}`, {
      next: { revalidate: cacheTime },
    });
    if (!res.ok) throw new Error('Failed to fetch from main API');
    return await res.json();
  } catch (error) {
    const res = await fetch(`${BACKUP_API_URL}${cleanEndpoint}`, {
      next: { revalidate: cacheTime },
    });
    if (!res.ok) throw new Error('Failed to fetch from backup API');
    return await res.json();
  }
}

function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  return `${MAIN_API_URL}/uploads/${imagePath}`;
}

export const CircleFtpProvider: Provider = {
  id: 'circleftp',
  name: '(BDIX) Circle FTP',
  
  healthCheck: async () => {
    try {
      await fetchApi('/api/posts?page=1&limit=1', 60);
      return true;
    } catch {
      return false;
    }
  },

  getHome: async () => {
    const categories = [
      { id: '80', name: 'Featured' },
      { id: '6', name: 'English Movies' },
      { id: '9', name: 'English & Foreign TV Series' },
      { id: '22', name: 'Dubbed TV Series' },
      { id: '2', name: 'Hindi Movies' },
      { id: '1', name: 'Animation Movies' },
    ];

    const results = [];
    for (const cat of categories) {
      try {
        const data = await fetchApi(`/api/posts?categoryExact=${cat.id}&page=1&order=desc&limit=15`, 3600);
        const items: MediaItem[] = (data.posts || []).filter((p: any) => p.type === 'singleVideo' || p.type === 'series').map((post: any) => ({
          id: post.id.toString(),
          provider: 'circleftp',
          providerId: post.id.toString(),
          title: post.title || post.name,
          poster: getImageUrl(post.imageSm),
          type: post.type === 'singleVideo' ? 'movie' : 'series',
        }));
        if (items.length > 0) {
          results.push({ title: cat.name, items });
        }
      } catch (err) {
        console.error(`Failed to fetch category ${cat.name}`, err);
      }
    }
    return results;
  },

  search: async (query: string) => {
    const data = await fetchApi(`/api/posts?searchTerm=${encodeURIComponent(query)}&order=desc`, 0);
    return (data.posts || []).filter((p: any) => p.type === 'singleVideo' || p.type === 'series').map((post: any) => ({
      id: post.id.toString(),
      provider: 'circleftp',
      providerId: post.id.toString(),
      title: post.title || post.name,
      poster: getImageUrl(post.imageSm),
      type: post.type === 'singleVideo' ? 'movie' : 'series',
    }));
  },

  getDetails: async (id: string) => {
    const data = await fetchApi(`/api/posts/${id}`, 3600);
    if (!data) return null;
    
    let seasons: Season[] = [];
    if (data.type === 'series' && data.content && Array.isArray(data.content)) {
      seasons = data.content.map((season: any, idx: number) => {
        const episodes: Episode[] = (season.episodes || []).map((ep: any, epIdx: number) => ({
          episodeNumber: epIdx + 1,
          title: ep.title,
          link: ep.link,
        }));
        return {
          seasonNumber: idx + 1,
          seasonName: season.seasonName,
          episodes,
        };
      });
    }

    // For singleVideo, data.content is just a string (the movie url)
    const mediaItem: MediaItem = {
      id: id,
      provider: 'circleftp',
      providerId: id,
      title: data.title || data.name,
      description: data.metaData,
      poster: getImageUrl(data.image),
      year: data.year ? parseInt(data.year.toString().replace(/\D/g, ''), 10) : undefined,
      type: data.type === 'singleVideo' ? 'movie' : 'series',
      seasons: seasons.length > 0 ? seasons : undefined,
      duration: data.watchTime,
      quality: data.quality,
    };
    
    // Store link directly for movies in a specific property if we want,
    // but typically we fetch stream separately using resolveStreams.
    // However, CircleFtp provider in kotlin used the `url` from loadData.content
    if (data.type === 'singleVideo') {
       // We can store it in a generic place or wait for resolveStreams.
       // Let's rely on resolveStreams to fetch again if needed, or pass it via url.
       // Since resolveStreams only gets ID, it might need to fetch the post again.
    }

    return mediaItem;
  },

  resolveStreams: async (id: string, streamUrl?: string) => {
    let targetUrl = streamUrl;
    
    // If streamUrl not provided (e.g. for movies where it's part of getDetails), fetch it.
    if (!targetUrl) {
      const data = await fetchApi(`/api/posts/${id}`, 3600);
      if (data && data.type === 'singleVideo' && typeof data.content === 'string') {
        targetUrl = data.content;
      } else {
        throw new Error('No stream URL provided or found');
      }
    }

    if (!targetUrl) throw new Error('Failed to resolve stream URL');

    const domainLink = targetUrl;
    let ipLink = targetUrl;

    const replacements: Record<string, string> = {
      "index.circleftp.net": "15.1.4.2",
      "index2.circleftp.net": "15.1.4.5",
      "index1.circleftp.net": "15.1.4.9",
      "ftp3.circleftp.net": "15.1.4.7",
      "ftp4.circleftp.net": "15.1.1.5",
      "ftp5.circleftp.net": "15.1.1.15",
      "ftp6.circleftp.net": "15.1.2.3",
      "ftp7.circleftp.net": "15.1.4.8",
      "ftp8.circleftp.net": "15.1.2.2",
      "ftp9.circleftp.net": "15.1.2.12",
      "ftp10.circleftp.net": "15.1.4.3",
      "ftp11.circleftp.net": "15.1.2.6",
      "ftp12.circleftp.net": "15.1.2.1",
      "ftp13.circleftp.net": "15.1.1.18",
      "ftp15.circleftp.net": "15.1.4.12",
      "ftp17.circleftp.net": "15.1.3.8",
    };

    for (const [key, value] of Object.entries(replacements)) {
      if (ipLink.includes(key)) {
        ipLink = ipLink.replace(key, value);
        break;
      }
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Connection": "close",
      "Accept-Encoding": "identity",
    };

    const streams: StreamSource[] = [];
    
    // Check if it's m3u8
    const type = targetUrl.toLowerCase().includes('.m3u8') ? 'm3u8' : 'mp4';

    streams.push({
      url: domainLink,
      type,
      quality: 'Domain',
      headers,
    });

    if (ipLink && ipLink !== domainLink) {
      streams.push({
        url: ipLink,
        type,
        quality: 'Direct IP',
        headers,
      });
    }

    return streams;
  }
};
