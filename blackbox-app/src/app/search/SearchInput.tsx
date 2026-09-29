'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function SearchInput({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (query !== initialQuery) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      debounceRef.current = setTimeout(() => {
        if (query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query)}`);
        } else {
          router.push(`/search`);
        }
      }, 500); // 500ms debounce
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, router, initialQuery]);

  return (
    <div className="search-input-wrapper">
      <input
        type="text"
        placeholder="Movies, TV Shows..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
        autoFocus
      />
    </div>
  );
}
