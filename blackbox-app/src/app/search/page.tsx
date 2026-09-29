import { getAllProviders, MediaItem } from "@/providers";
import Link from "next/link";
import SearchInput from "./SearchInput"; // We will create this client component
import "./search.css";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let results: MediaItem[] = [];
  let hasSearched = false;

  if (q && q.trim().length > 0) {
    hasSearched = true;
    const providers = getAllProviders();
    const searchPromises = providers.map(p => p.search(q).catch(e => {
      console.error(`Search failed for ${p.name}`, e);
      return [];
    }));
    
    const allResults = await Promise.all(searchPromises);
    results = allResults.flat();
    
    // Simple deduplication based on title + year
    const seen = new Set();
    results = results.filter(item => {
      const key = `${item.title}-${item.year || ''}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return (
    <div className="page-container container">
      <div className="search-header">
        <h1>Search</h1>
        <SearchInput initialQuery={q || ''} />
      </div>

      {hasSearched ? (
        <div className="search-results">
          <h2 style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Results for "{q}" ({results.length})
          </h2>
          
          {results.length > 0 ? (
            <div className="search-grid">
              {results.map(item => (
                <Link href={`/title/${item.provider}/${item.id}`} key={`${item.provider}-${item.id}`} className="media-card">
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="search-poster-placeholder">{item.title}</div>
                  )}
                  <div className="search-card-meta">
                    <span className="search-title">{item.title}</span>
                    <span className="search-type">{item.type}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No results found for "{q}". Try a different keyword.
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: '5rem', opacity: 0.5 }}>
          Type something above to search across all providers.
        </div>
      )}
    </div>
  );
}
