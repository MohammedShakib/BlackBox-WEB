import { getAllProviders } from "@/providers";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Don't cache health checks

export default async function StatusPage() {
  const providers = getAllProviders();
  const statuses = await Promise.all(
    providers.map(async (p) => {
      const start = Date.now();
      let isUp = false;
      try {
        isUp = await p.healthCheck();
      } catch (e) {
        isUp = false;
      }
      const latency = Date.now() - start;
      return { name: p.name, id: p.id, isUp, latency };
    })
  );

  return (
    <div className="page-container container" style={{ paddingBottom: '5rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>System Status</h1>
      
      <div style={{ display: 'grid', gap: '1rem', maxWidth: '800px' }}>
        {statuses.map(status => (
          <div key={status.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            borderLeft: `4px solid ${status.isUp ? '#4ade80' : '#f87171'}`
          }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{status.name}</h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Latency: {status.latency}ms
              </div>
            </div>
            
            <div style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              backgroundColor: status.isUp ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
              color: status.isUp ? '#4ade80' : '#f87171'
            }}>
              {status.isUp ? 'OPERATIONAL' : 'DEGRADED / OFFLINE'}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <h3>Note on BDIX Providers</h3>
        <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
          Some providers (like DiscoveryFTP, MyMovieBazar, RoarZone) are strictly BDIX restricted 
          and have been disabled or omitted from active routing because they are unreachable from 
          this environment. They will remain marked offline until connectivity allows them to resolve.
        </p>
      </div>
    </div>
  );
}
