import { getAllProviders, MediaItem } from "@/providers";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function LiveTVPage() {
  const providers = getAllProviders();
  const allHomesPromises = providers.map(p => p.getHome().catch(() => []));
  const homesArray = await Promise.all(allHomesPromises);
  
  let rails: { title: string; items: MediaItem[] }[] = [];
  
  homesArray.forEach(providerHome => {
    providerHome.forEach(rail => {
      // Filter out only live tv
      const liveItems = rail.items.filter(item => item.type === 'live');
      if (liveItems.length > 0) {
        rails.push({ title: rail.title, items: liveItems });
      }
    });
  });

  return (
    <div className="page-container container">
      <h1 style={{ marginTop: '2rem', marginBottom: '2rem' }}>Live TV</h1>
      
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
          <h3 style={{ marginBottom: '1rem' }}>No Live TV Channels Available</h3>
          <p>Most Live TV providers on the BDIX network are currently offline or unreachable.</p>
        </div>
      )}
    </div>
  );
}
