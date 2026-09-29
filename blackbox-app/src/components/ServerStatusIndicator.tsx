'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProviderStatus {
  name: string;
  id: string;
  isUp: boolean;
}

export default function ServerStatusIndicator() {
  const [statuses, setStatuses] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setStatuses(data);
      } catch (err) {
        console.error("Failed to fetch server status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  const connectedCount = statuses.filter(s => s.isUp).length;
  
  return (
    <div 
      className="server-status-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '1rem' }}
    >
      <Link href="/status" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative' }}>
          {/* Server / Database Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          
          {/* Badge */}
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-8px',
            background: connectedCount > 0 ? '#4ade80' : '#f87171',
            color: '#000',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-primary)'
          }}>
            {connectedCount}
          </div>
        </div>
      </Link>

      {/* Hover Tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          width: 'max-content',
          minWidth: '200px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Server Status</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {statuses.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem' }}>{s.name}</span>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: s.isUp ? '#4ade80' : '#f87171',
                  boxShadow: `0 0 5px ${s.isUp ? '#4ade80' : '#f87171'}`
                }}></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
