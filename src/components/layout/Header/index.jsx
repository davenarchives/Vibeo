import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ThemeSelector from '@/components/common/ThemeSelector';
import './styles.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, loginWithGoogle, logout } = useAuth();
    const [search, setSearch] = useState('');

    const isOnboardingPage = location.pathname === '/onboarding';

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
                {!isOnboardingPage && (
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
                )}

                {/* ── Right side: search + avatar ── */}
                <div className="topbar__right">
                    {/* Search box */}
                    {!isOnboardingPage && (
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
                    )}

                    <ThemeSelector />

                    {/* Authentication Section */}
                    {currentUser ? (
                        <button
                            className="topbar__user"
                            onClick={logout}
                            title="Click to Logout"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '0.2rem 0.75rem 0.2rem 0.2rem',
                                borderRadius: '2rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: '#e2e8f0',
                                fontWeight: '500',
                                fontSize: '0.875rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'var(--c-accent-lt)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                        >
                            <img
                                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=random`}
                                alt={currentUser.displayName || 'User Profile'}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span style={{ marginLeft: '8px' }}>Logout</span>
                        </button>
                    ) : (
                        <button
                            className="topbar__login-btn"
                            onClick={loginWithGoogle}
                            style={{
                                background: 'var(--c-accent-lt)',
                                border: 'none',
                                color: '#fff',
                                padding: '0.5rem 1.25rem',
                                borderRadius: '1.5rem',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px var(--c-accent-glow)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 6px 20px var(--c-accent-glow)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'none';
                                e.target.style.boxShadow = '0 4px 15px var(--c-accent-glow)';
                            }}
                        >
                            Login
                        </button>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Header;
