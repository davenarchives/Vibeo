import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboardingMovies } from '@/hooks/useOnboardingMovies';
import Header from '@/components/layout/Header';
import './styles.css';

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
        } else if (selectedMovies.length < 5) {
            setSelectedMovies([...selectedMovies, movie]);
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
        <div className="onboarding-page">
            <Header />

            <main className="onboarding-main">
                <div className="onboarding-header">
                    <h1 className="onboarding-title">
                        Welcome to VibeReel!
                    </h1>
                    <p className="onboarding-subtitle">
                        Select exactly <strong>5 movies</strong> you love to personalize your experience.
                        ({selectedMovies.length}/5 selected)
                    </p>
                </div>

                {loading ? (
                    <div className="onboarding-loading">
                        <div className="onboarding-spinner" />
                    </div>
                ) : (
                    <div className="onboarding-grid">
                        {movies.slice(0, 60).map((movie) => {
                            const isSelected = selectedMovies.some(m => m.id === movie.id);
                            return (
                                <button
                                    key={movie.id}
                                    onClick={() => toggleMovie(movie)}
                                    type="button"
                                    className={`onboarding-movie-card ${isSelected ? 'selected' : ''}`}
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="onboarding-movie-img"
                                    />

                                    {/* Hover Information Overlay */}
                                    <div className="movie-info-overlay">
                                        <h3 className="movie-info-title">
                                            {movie.title}
                                        </h3>
                                        {movie.release_date && (
                                            <span className="movie-info-year">
                                                {new Date(movie.release_date).getFullYear()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Selection Checkmark */}
                                    {isSelected && (
                                        <div className="onboarding-checkmark">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Sticky Continue Button Bottom Bar */}
            <div className="onboarding-bottom-bar">
                <button
                    onClick={handleContinue}
                    disabled={selectedMovies.length !== 5 || saving}
                    className={`onboarding-continue-btn ${selectedMovies.length === 5 ? 'active' : ''} ${saving ? 'saving' : ''}`}
                >
                    {saving ? 'Saving Preferences...' : 'Continue to VibeReel'}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
