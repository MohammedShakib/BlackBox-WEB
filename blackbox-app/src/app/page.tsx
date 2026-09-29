import { getAllProviders, MediaItem } from "@/providers";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 3600; // Cache for 1 hour

export default async function Home() {
  const providers = getAllProviders();
  
  // Aggregate home content from all providers
  let allRails: { title: string; items: MediaItem[] }[] = [];
  
  for (const provider of providers) {
    try {
      const homeData = await provider.getHome();
      allRails = [...allRails, ...homeData];
    } catch (e) {
      console.error(`Failed to load home for provider ${provider.name}`, e);
    }
  }

  // Pick a random item for the Hero, prioritizing movies with backdrops or just a good poster
  let heroItem: MediaItem | null = null;
  const flatItems = allRails.flatMap(r => r.items);
  if (flatItems.length > 0) {
    heroItem = flatItems[Math.floor(Math.random() * Math.min(20, flatItems.length))];
  }

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Hero Section */}
      {heroItem && (
        <div className="hero">
          {heroItem.poster && (
            // Since we don't always have backdrops from this provider, use the poster as a blurred bg
            <img src={heroItem.poster} alt={heroItem.title} className="hero-bg" style={{ objectPosition: 'center 20%' }} />
          )}
          <div className="hero-vignette"></div>
          
          <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
            <div className="hero-content">
              <h1 className="hero-title">{heroItem.title}</h1>
              <div className="hero-meta">
                {heroItem.year && <span>{heroItem.year}</span>}
                {heroItem.type && <span style={{ textTransform: 'capitalize' }}>{heroItem.type}</span>}
                <span className="text-secondary">{heroItem.provider}</span>
              </div>
              {heroItem.description && (
                <p className="hero-synopsis">{heroItem.description}</p>
              )}
              <div className="hero-actions">
                <Link href={`/watch/${heroItem.provider}/${heroItem.id}`} className="btn btn-primary">
                  Watch Now
                </Link>
                <Link href={`/title/${heroItem.provider}/${heroItem.id}`} className="btn btn-secondary">
                  More Info
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Rails */}
      <div style={{ marginTop: heroItem ? '-5vw' : '100px', position: 'relative', zIndex: 20 }}>
        {allRails.map((rail, i) => (
          <div key={i} className="rail-container">
            <h2 className="rail-title">{rail.title}</h2>
            <div className="rail-scroller">
              {rail.items.map(item => (
                <Link href={`/title/${item.provider}/${item.id}`} key={item.id} className="media-card">
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                      {item.title}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
        {allRails.length === 0 && (
          <div className="container text-center text-muted" style={{ padding: '5rem 0' }}>
            No content available.
          </div>
        )}
      </div>
    </div>
  );
}
