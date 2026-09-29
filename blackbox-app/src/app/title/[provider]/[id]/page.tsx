import { getProvider } from "@/providers";
import Link from "next/link";
import { notFound } from "next/navigation";
import './detail.css'; // We will create this

export const revalidate = 3600;

export default async function TitleDetail({
  params,
}: {
  params: Promise<{ provider: string; id: string }>;
}) {
  const { provider, id } = await params;
  
  let providerInstance;
  try {
    providerInstance = getProvider(provider);
  } catch (e) {
    return notFound();
  }

  const media = await providerInstance.getDetails(id);
  if (!media) {
    return notFound();
  }

  return (
    <div className="detail-page">
      <div className="detail-hero">
        <div className="detail-backdrop">
          {media.poster && <img src={media.poster} alt={media.title} />}
          <div className="detail-vignette"></div>
        </div>
        
        <div className="container detail-content">
          <div className="detail-poster-wrap">
            {media.poster ? (
              <img src={media.poster} alt={media.title} className="detail-poster" />
            ) : (
              <div className="detail-poster-placeholder">No Image</div>
            )}
          </div>
          
          <div className="detail-info">
            <h1 className="detail-title">{media.title}</h1>
            
            <div className="detail-meta">
              {media.year && <span>{media.year}</span>}
              {media.quality && <span className="quality-badge">{media.quality}</span>}
              {media.duration && <span>{media.duration}</span>}
              <span className="provider-badge">{providerInstance.name}</span>
            </div>
            
            <div className="detail-actions">
              {media.type === 'movie' ? (
                <Link href={`/watch/${provider}/${id}`} className="btn btn-primary">
                  Watch Movie
                </Link>
              ) : (
                <a href="#episodes" className="btn btn-primary">
                  View Episodes
                </a>
              )}
              <button className="btn btn-secondary">+ My List</button>
            </div>
            
            {media.description && (
              <div className="detail-synopsis">
                <p>{media.description}</p>
              </div>
            )}
            
            {media.genres && media.genres.length > 0 && (
              <div className="detail-genres">
                <span className="text-muted">Genres: </span>
                {media.genres.join(", ")}
              </div>
            )}
          </div>
        </div>
      </div>

      {media.type === 'series' && media.seasons && media.seasons.length > 0 && (
        <div id="episodes" className="container episodes-section">
          <h2>Episodes</h2>
          
          {media.seasons.map((season) => (
            <div key={season.seasonNumber} className="season-container">
              <h3 className="season-title">{season.seasonName || `Season ${season.seasonNumber}`}</h3>
              <div className="episodes-grid">
                {season.episodes.map((ep) => (
                  <Link href={`/watch/${provider}/${id}?ep=${ep.episodeNumber}&s=${season.seasonNumber}`} key={ep.episodeNumber} className="episode-card">
                    <div className="episode-number">{ep.episodeNumber}</div>
                    <div className="episode-info">
                      <div className="episode-title">{ep.title || `Episode ${ep.episodeNumber}`}</div>
                    </div>
                    <div className="episode-play">▶</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
