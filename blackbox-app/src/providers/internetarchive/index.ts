import { Provider, MediaItem, StreamSource } from '../types';

const API_BASE = 'https://archive.org';

async function fetchApi(url: string, cacheTime: number = 3600) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000); // 8 second timeout for global API
  try {
    const res = await fetch(url, {
      next: { revalidate: cacheTime },
      signal: controller.signal
    });
    clearTimeout(id);
    if (!res.ok) throw new Error('Failed to fetch from Internet Archive');
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const InternetArchiveProvider: Provider = {
  id: 'internetarchive',
  name: 'Internet Archive (Global)',
  
  healthCheck: async () => {
    try {
      await fetchApi(`${API_BASE}/advancedsearch.php?q=test&output=json&rows=1`, 60);
      return true;
    } catch {
      return false;
    }
  },

  getHome: async () => {
    const categories = [
      { id: 'feature_films', name: 'Classic Feature Films' },
      { id: 'SciFi_Horror', name: 'Sci-Fi & Horror Classics' },
      { id: 'Comedy_Films', name: 'Classic Comedies' },
    ];

    const promises = categories.map(async (cat) => {
      try {
        const query = `mediatype:movies AND collection:${cat.id}`;
        const url = `${API_BASE}/advancedsearch.php?q=${encodeURIComponent(query)}&sort[]=downloads desc&fl[]=identifier,title,description,year&output=json&rows=15`;
        
        const data = await fetchApi(url, 3600 * 24);
        
        const docs = data?.response?.docs || [];
        const items: MediaItem[] = docs.map((doc: any) => ({
          id: doc.identifier,
          provider: 'internetarchive',
          providerId: doc.identifier,
          title: doc.title || 'Unknown Title',
          description: Array.isArray(doc.description) ? doc.description[0] : doc.description,
          poster: `${API_BASE}/services/img/${doc.identifier}`,
          year: doc.year ? parseInt(doc.year, 10) : undefined,
          type: 'movie',
        }));

        if (items.length > 0) {
          return { title: cat.name, items };
        }
      } catch (err) {
        console.error(`Failed to fetch Internet Archive category ${cat.name}`);
      }
      return null;
    });

    const resolved = await Promise.all(promises);
    return resolved.filter(r => r !== null) as { title: string; items: MediaItem[] }[];
  },

  search: async (query: string) => {
    try {
      const q = `mediatype:movies AND title:(${query})`;
      const url = `${API_BASE}/advancedsearch.php?q=${encodeURIComponent(q)}&sort[]=downloads desc&fl[]=identifier,title,description,year&output=json&rows=20`;
      const data = await fetchApi(url, 0);
      
      const docs = data?.response?.docs || [];
      return docs.map((doc: any) => ({
        id: doc.identifier,
        provider: 'internetarchive',
        providerId: doc.identifier,
        title: doc.title || 'Unknown Title',
        description: Array.isArray(doc.description) ? doc.description[0] : doc.description,
        poster: `${API_BASE}/services/img/${doc.identifier}`,
        year: doc.year ? parseInt(doc.year, 10) : undefined,
        type: 'movie',
      }));
    } catch (err) {
      console.error('Internet Archive search failed', err);
      return [];
    }
  },

  getDetails: async (id: string) => {
    try {
      const data = await fetchApi(`${API_BASE}/metadata/${id}`, 3600 * 24);
      if (!data || !data.metadata) return null;
      
      const meta = data.metadata;
      return {
        id: id,
        provider: 'internetarchive',
        providerId: id,
        title: meta.title || 'Unknown Title',
        description: Array.isArray(meta.description) ? meta.description[0] : meta.description,
        poster: `${API_BASE}/services/img/${id}`,
        year: meta.year ? parseInt(meta.year, 10) : undefined,
        type: 'movie',
      };
    } catch (err) {
      console.error('Failed to get IA details', err);
      return null;
    }
  },

  resolveStreams: async (id: string) => {
    const data = await fetchApi(`${API_BASE}/metadata/${id}`, 3600);
    if (!data || !data.files) throw new Error('No files found in IA metadata');

    const streams: StreamSource[] = [];
    
    // Find the best MP4 file
    const mp4Files = data.files.filter((f: any) => f.format === '512Kb MPEG4' || f.format === 'h.264' || f.name.endsWith('.mp4'));
    
    if (mp4Files.length === 0) {
      throw new Error('No MP4 stream available for this movie');
    }

    for (const file of mp4Files) {
      streams.push({
        url: `${API_BASE}/download/${id}/${file.name}`,
        type: 'mp4',
        quality: file.format,
      });
    }

    return streams;
  }
};
