import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboardingMovies } from '@/hooks/useOnboardingMovies';
import Header from '@/components/layout/Header';

const Onboarding = () => {
    const { currentUser, saveOnboardingData } = useAuth();
    const { movies, loading } = useOnboardingMovies();
    const navigate = useNavigate();
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [saving, setSaving] = useState(false);

    // If not logged in, redirect home
    if (!currentUser) {
        navigate('/');
        return null;
    }

    const toggleMovie = (movie) => {
        const isSelected = selectedMovies.some(m => m.id === movie.id);
        if (isSelected) {
            setSelectedMovies(selectedMovies.filter(m => m.id !== movie.id));
        } else {
            if (selectedMovies.length < 5) {
                setSelectedMovies([...selectedMovies, movie]);
            }
        }
    };

    const handleContinue = async () => {
        if (selectedMovies.length !== 5) return;
        setSaving(true);
        try {
            await saveOnboardingData(selectedMovies);
            navigate('/');
        } catch (error) {
            console.error("Failed to save preferences:", error);
            setSaving(false);
        }
    };

    return (
        <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, var(--c-text), var(--c-accent-lt))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Welcome to VibeReel!
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--c-text2)' }}>
                        Select exactly <strong style={{ color: 'var(--c-accent-lt)' }}>5 movies</strong> you love to personalize your experience.
                        ({selectedMovies.length}/5 selected)
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid var(--c-surface3)', borderTopColor: 'var(--c-accent-lt)', borderRadius: '50%', animation: 'spinRing 1s linear infinite' }} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.5rem', marginBottom: '6rem' }}>
                        {movies.slice(0, 60).map((movie) => {
                            const isSelected = selectedMovies.some(m => m.id === movie.id);
                            return (
                                <div
                                    key={movie.id}
                                    onClick={() => toggleMovie(movie)}
                                    title={movie.title}
                                    style={{
                                        position: 'relative',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        aspectRatio: '2/3',
                                        transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        boxShadow: isSelected ? '0 0 0 4px var(--c-accent-lt)' : '0 4px 15px rgba(0,0,0,0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.querySelector('.movie-info-overlay').style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.querySelector('.movie-info-overlay').style.opacity = '0';
                                    }}
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSelected ? 0.7 : 1, transition: 'all 0.3s ease' }}
                                    />

                                    {/* Hover Information Overlay */}
                                    <div
                                        className="movie-info-overlay"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '2rem 1rem 1rem 1rem',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                                            opacity: isSelected ? 1 : 0,
                                            transition: 'opacity 0.3s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            pointerEvents: 'none'
                                        }}
                                    >
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {movie.title}
                                        </h3>
                                        {movie.release_date && (
                                            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '4px' }}>
                                                {new Date(movie.release_date).getFullYear()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Selection Checkmark */}
                                    {isSelected && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--c-accent-lt)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Sticky Continue Button Bottom Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1.5rem',
                background: 'linear-gradient(to top, var(--c-bg) 60%, transparent)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                pointerEvents: 'none'
            }}>
                <button
                    onClick={handleContinue}
                    disabled={selectedMovies.length !== 5 || saving}
                    style={{
                        pointerEvents: 'auto',
                        background: 'var(--c-accent-lt)',
                        color: '#fff',
                        border: 'none',
                        padding: '1rem 3rem',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        borderRadius: '2rem',
                        cursor: selectedMovies.length === 5 ? 'pointer' : 'not-allowed',
                        opacity: selectedMovies.length === 5 ? (saving ? 0.7 : 1) : 0.4,
                        boxShadow: selectedMovies.length === 5 ? '0 8px 25px var(--c-accent-glow)' : 'none',
                        transition: 'all 0.3s ease',
                        transform: selectedMovies.length === 5 ? 'translateY(0)' : 'translateY(10px)'
                    }}
                >
                    {saving ? 'Saving Preferences...' : 'Continue to VibeReel'}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
