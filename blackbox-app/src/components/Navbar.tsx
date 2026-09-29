'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <div className="nav-left">
          <Link href="/" className="logo">BlackBox</Link>
          <div className="nav-links">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link href="/movies" className={`nav-link ${pathname === '/movies' ? 'active' : ''}`}>Movies</Link>
            <Link href="/series" className={`nav-link ${pathname === '/series' ? 'active' : ''}`}>TV Shows</Link>
            <Link href="/live" className={`nav-link ${pathname === '/live' ? 'active' : ''}`}>Live TV</Link>
            <Link href="/list" className={`nav-link ${pathname === '/list' ? 'active' : ''}`}>My List</Link>
          </div>
        </div>
        <div className="nav-right">
          <Link href="/search" className="nav-link">Search</Link>
          <div className="nav-link">Profile</div>
        </div>
      </div>
    </nav>
  );
}
