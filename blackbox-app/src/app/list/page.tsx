export default function MyListPage() {
  return (
    <div className="page-container container">
      <h1 style={{ marginTop: '2rem', marginBottom: '2rem' }}>My List</h1>
      
      <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Your list is empty</h3>
        <p>Add shows and movies to your list so you can easily find them later.</p>
      </div>
    </div>
  );
}
