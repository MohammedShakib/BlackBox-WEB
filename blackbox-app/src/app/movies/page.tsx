import { getAllProviders, MediaItem } from "@/providers";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function MoviesPage() {
  const providers = getAllProviders();
  const allHomesPromises = providers.map(p => p.getHome().catch(() => []));
  const homesArray = await Promise.all(allHomesPromises);
  
  let rails: { title: string; items: MediaItem[] }[] = [];
  
  homesArray.forEach(providerHome => {
    providerHome.forEach(rail => {
      // Filter out only movies
      const movieItems = rail.items.filter(item => item.type === 'movie');
      if (movieItems.length > 0) {
        rails.push({ title: rail.title, items: movieItems });
      }
    });
  });

  return (
    <div className="page-container container">
      <h1 style={{ marginTop: '2rem', marginBottom: '2rem' }}>Movies</h1>
      
      {rails.length > 0 ? rails.map((rail, idx) => (
        <section key={idx} className="rail-section">
          <h2 className="rail-title">{rail.title}</h2>
          <div className="rail-container">
            {rail.items.map(item => (
              <Link href={`/title/${item.provider}/${item.id}`} key={`${item.provider}-${item.id}`} className="media-card">
                {item.poster ? (
                  <img src={item.poster} alt={item.title} loading="lazy" />
                ) : (
                  <div className="poster-placeholder">{item.title}</div>
                )}
                <div className="card-overlay">
                  <span className="card-title">{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )) : (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No movies available at the moment.
        </div>
      )}
    </div>
  );
}
