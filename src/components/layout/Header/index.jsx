import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeSelector from '@/components/common/ThemeSelector';
import './styles.css';

const Header = ({ subtitle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState('');

    const isHome = location.pathname === '/';

    return (
        <header className="topbar" role="banner">
            <div className="topbar__inner">

                {/* ── Logo ── */}
                <button className="topbar__logo" onClick={() => navigate('/')} aria-label="VibeReel Home">
                    <img src="/vibereel.png" alt="VibeReel" className="topbar__logo-img" />
                    <span className="topbar__logo-text">
                        <span className="topbar__logo-vibe">Vibe</span>
                        <span className="topbar__logo-reel">Reel</span>
                    </span>
                </button>

                {/* ── Nav links (desktop) ── */}
                <nav className="topbar__nav" aria-label="Site Navigation">
                    {[
                        { label: 'Home', path: '/' },
                        { label: 'Trending', path: '/' },
                        { label: 'Mood Match', path: '/' },
                    ].map(link => (
                        <button
                            key={link.label}
                            className={`topbar__nav-link ${location.pathname === link.path && link.label === 'Home' ? 'active' : ''}`}
                            onClick={() => navigate(link.path)}
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>

                {/* ── Right side: search + avatar ── */}
                <div className="topbar__right">
                    {/* Search box */}
                    <div className="topbar__search">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search titles…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            aria-label="Search movies"
                        />
                    </div>

                    <ThemeSelector />

                    {/* User avatar pill */}
                    <div className="topbar__avatar" aria-label="User Profile">
                        <span>VR</span>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default Header;
