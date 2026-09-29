'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { StreamSource } from '@/providers';
import { useRouter } from 'next/navigation';

interface PlayerProps {
  streams: StreamSource[];
  title?: string;
}

export default function Player({ streams, title }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!streams || streams.length === 0) {
      setError('No playable streams available.');
      setLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const stream = streams[currentStreamIndex];
    let hls: Hls | null = null;

    setLoading(true);
    setError(null);

    const handleCanPlay = () => setLoading(false);
    video.addEventListener('canplay', handleCanPlay);

    if (stream.type === 'm3u8') {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxMaxBufferLength: 60,
        });
        hls.loadSource(stream.url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error encountered, trying to recover');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Media error encountered, trying to recover');
                hls?.recoverMediaError();
                break;
              default:
                // Fatal error, try next stream
                handleStreamError();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native support
        video.src = stream.url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(console.error);
        });
      }
    } else {
      // MP4 or other native
      video.src = stream.url;
      video.play().catch(console.error);
    }

    const handleNativeError = () => {
      handleStreamError();
    };

    video.addEventListener('error', handleNativeError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleNativeError);
      if (hls) {
        hls.destroy();
      }
    };
  }, [currentStreamIndex, streams]);

  const handleStreamError = () => {
    if (currentStreamIndex < streams.length - 1) {
      console.log('Stream failed, trying next...');
      setCurrentStreamIndex(prev => prev + 1);
    } else {
      setError('All streams failed to load.');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      {/* Top bar for title & back button */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '2rem',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        zIndex: 10, display: 'flex', alignItems: 'center', gap: '2rem',
        opacity: loading ? 1 : 0.8, transition: 'opacity 0.3s'
      }}>
        <button onClick={() => router.back()} style={{ color: 'white', fontSize: '2rem', cursor: 'pointer', background: 'none', border: 'none' }}>
          &larr;
        </button>
        <h2 style={{ color: 'white', margin: 0, fontWeight: 500 }}>{title || 'Playing'}</h2>
      </div>

      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 5 }}>
          <div className="spinner">Loading stream...</div>
        </div>
      )}

      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e50914', zIndex: 5, flexDirection: 'column', gap: '1rem' }}>
          <h3>{error}</h3>
          <button onClick={() => router.back()} className="btn btn-primary">Go Back</button>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        autoPlay
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
