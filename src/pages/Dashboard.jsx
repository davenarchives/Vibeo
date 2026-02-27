/**
 * Dashboard.jsx  ─ Homepage "/"
 * ═══════════════════════════════════════════════════════════════
 * Netflix-style streaming homepage:
 *  • Full-width hero spotlight banner (first 5 trending movies)
 *  • Horizontal carousel rows for each category
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Reusable components ──────────────────────────────────────
// ── Reusable components ──────────────────────────────────────
import Header from '@/components/layout/Header';
import HeroBanner from '@/components/layout/HeroBanner';
import MovieRow from '@/components/layout/MovieRow';
import Footer from '@/components/layout/Footer';

// ── Data sources ──────────────────────────────────────────────
import { useMovies } from '@/hooks/useMovies';
import { useSpotlightMovies } from '@/hooks/useSpotlightMovies';
import { useMoodMatchMovies } from '@/hooks/useMoodMatchMovies';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Live TMDB trending data
    const { movies: trending, loading } = useMovies();

    // Derived slices for different sections
    const topRated = [...trending].sort((a, b) => b.vote_average - a.vote_average).slice(0, 12);
    const actionMix = trending.filter((_, i) => i % 2 === 0).slice(0, 12);
    const dramaMix = trending.filter((_, i) => i % 2 !== 0).slice(0, 12);

    const handleCardClick = (movie) => navigate(`/watch/${movie.id}`);

    // Personalized recommendations
    const { movies: spotlightMovies, loading: spotlightLoading } = useSpotlightMovies();
    const { movies: moodMatches, loading: moodLoading } = useMoodMatchMovies();

    // Effect for auto-scrolling to section
    useEffect(() => {
        if (!loading && location.hash) {
            const id = location.hash.replace('#', '');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    // Offset by 80px to account for the sticky header
                    const y = element.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        }
    }, [location.hash, loading]);

    return (
        <div className="page-wrapper">
            <Header />

            <main>
                <HeroBanner movies={spotlightMovies.length > 0 ? spotlightMovies : trending.slice(0, 5)} />

                <div className="rows-container">
                    {loading ? (
                        <div className="loading-center">
                            <div className="spinner" />
                            <p>Fetching latest from TMDB…</p>
                        </div>
                    ) : (
                        <>
                            <MovieRow
                                id="trending"
                                title="Trending This Week"
                                movies={trending}
                                onCardClick={handleCardClick}
                            />
                            <MovieRow
                                id="top-rated"
                                title="Top Rated"
                                movies={topRated}
                                onCardClick={handleCardClick}
                            />
                            {moodMatches && moodMatches.length > 0 && (
                                <MovieRow
                                    id="mood-match"
                                    title="AI Mood Matches"
                                    movies={moodMatches}
                                    onCardClick={handleCardClick}
                                    showBadge={true}
                                />
                            )}
                            <MovieRow
                                id="action"
                                title="Action & Adventure"
                                movies={actionMix}
                                onCardClick={handleCardClick}
                            />
                            <MovieRow
                                id="drama"
                                title="Drama"
                                movies={dramaMix}
                                onCardClick={handleCardClick}
                            />
                            <MovieRow
                                id="new-release"
                                title="New Releases"
                                movies={[...trending].reverse().slice(0, 12)}
                                onCardClick={handleCardClick}
                            />
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;

