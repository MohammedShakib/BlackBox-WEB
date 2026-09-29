import { getProvider } from "@/providers";
import Player from "@/components/Player";
import { notFound } from "next/navigation";

// Disable layout for this page if we want fullscreen, but Next.js App Router 
// requires a layout. We can just hide the navbar using CSS or a layout group.
// For now, we will just use absolute positioning in Player to cover the screen.

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ provider: string; id: string }>;
  searchParams: Promise<{ ep?: string; s?: string }>;
}) {
  const { provider, id } = await params;
  const { ep, s } = await searchParams;

  let providerInstance;
  try {
    providerInstance = getProvider(provider);
  } catch (e) {
    return notFound();
  }

  // Fetch details to get title and maybe specific stream URLs
  const media = await providerInstance.getDetails(id);
  if (!media) return notFound();

  let targetStreamUrl: string | undefined;
  let title = media.title;

  if (media.type === 'series' && ep && s) {
    // Find the specific episode link
    const season = media.seasons?.find(season => season.seasonNumber === parseInt(s));
    const episode = season?.episodes.find(episode => episode.episodeNumber === parseInt(ep));
    if (episode && episode.link) {
      targetStreamUrl = episode.link;
      title = `${media.title} - S${s} E${ep} ${episode.title ? `- ${episode.title}` : ''}`;
    }
  }

  // Resolve streams (this will yield direct IPs or tokens immediately before playback)
  const streams = await providerInstance.resolveStreams(id, targetStreamUrl);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'black' }}>
      <Player streams={streams} title={title} />
    </div>
  );
}
