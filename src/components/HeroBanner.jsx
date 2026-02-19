/**
 * HeroBanner.jsx — Sliding Spotlight Carousel with Trailer Playback
 * ─────────────────────────────────────────────────────────────
 * Netflix-style hero banner:
 *  • YouTube trailer plays immediately, always muted
 *  • Trailer covers the entire spotlight area (fullscreen)
 *  • Backdrop image only used as fallback if no trailer exists
 *  • Auto-advance pauses while trailer plays
 *  • Trailers fetched from TMDB /movie/{id}/videos endpoint
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieLogo from './MovieLogo';

const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const INTERVAL_MS = 8000;

const HeroBanner = ({ movies = [] }) => {
    const navigate = useNavigate();
    const total = Math.min(movies.length, 5);
    const timerRef = useRef(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [trailerKeys, setTrailerKeys] = useState({});   // { movieId: youtubeKey }
    const [trailerReady, setTrailerReady] = useState(false);

    /* ── Fetch trailers for all hero movies on mount ── */
    useEffect(() => {
        if (!total || !TMDB_API_KEY) return;

        const fetchTrailers = async () => {
            const keys = {};
            await Promise.all(
                movies.slice(0, 5).map(async (movie) => {
                    try {
                        const res = await fetch(
                            `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
                        );
                        if (!res.ok) return;
                        const data = await res.json();
                        const results = data.results || [];

                        // Priority: Official Trailer → Trailer → Teaser → any YouTube
                        const official = results.find(
                            v => v.site === 'YouTube' && v.type === 'Trailer' && v.official
                        );
                        const trailer = results.find(
                            v => v.site === 'YouTube' && v.type === 'Trailer'
                        );
                        const teaser = results.find(
                            v => v.site === 'YouTube' && v.type === 'Teaser'
                        );
                        const any = results.find(v => v.site === 'YouTube');

                        const pick = official || trailer || teaser || any;
                        if (pick) keys[movie.id] = pick.key;
                    } catch (_) { }
                })
            );
            setTrailerKeys(keys);
        };

        fetchTrailers();
    }, [movies, total]);

    /* ── Start/stop auto-advance ── */
    const startAutoAdvance = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (total < 2) return;
        timerRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % total);
        }, INTERVAL_MS);
    }, [total]);

    const stopAutoAdvance = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    /* ── Go to slide ── */
    const goTo = useCallback((idx) => {
        setActiveIndex(idx);
        setTrailerReady(false);
        startAutoAdvance();
    }, [startAutoAdvance]);

    /* ── Auto-advance on mount ── */
    useEffect(() => {
        startAutoAdvance();
        return () => stopAutoAdvance();
    }, [startAutoAdvance, stopAutoAdvance]);

    /* ── When trailer starts playing, pause auto-advance ── */
    useEffect(() => {
        if (trailerReady) {
            stopAutoAdvance();
        }
    }, [trailerReady, stopAutoAdvance]);

    /* ── Reset trailer ready state on slide change ── */
    useEffect(() => {
        setTrailerReady(false);
    }, [activeIndex]);

    /* ── Keyboard accessibility ── */
    const handleKey = (e) => {
        if (e.key === 'ArrowRight') goTo((activeIndex + 1) % total);
        if (e.key === 'ArrowLeft') goTo((activeIndex - 1 + total) % total);
    };

    // Current movie & trailer
    const currentMovie = movies[activeIndex];
    const currentTrailerKey = currentMovie ? trailerKeys[currentMovie.id] : null;

    // YouTube embed URL — always muted, no controls, autoplay, loop
    const ytEmbedUrl = currentTrailerKey
        ? `https://www.youtube.com/embed/${currentTrailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&loop=1&playlist=${currentTrailerKey}&start=5&enablejsapi=1&origin=${window.location.origin}`
        : null;

    // ── Skeleton while TMDB data loads ─────────────────────────
    if (!total) {
        return (
            <div className="hero-skeleton">
                <div className="hero-skeleton-inner" />
            </div>
        );
    }

    return (
        <section
            className="hero"
            aria-label="Featured Movie Spotlight"
            onKeyDown={handleKey}
            tabIndex={-1}
        >
            {/*
        ── SLIDE TRACK ──────────────────────────────────────────
        Backdrop images — only shown as fallback when no trailer.
        When a trailer is ready it covers this entirely.
      */}
            <div
                className="hero-track"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                aria-live="off"
            >
                {movies.slice(0, 5).map((movie, i) => (
                    <div key={movie.id} className="hero-slide" aria-hidden={i !== activeIndex}>
                        {movie.backdrop_path && (
                            <div
                                className="hero-bg"
                                style={{
                                    backgroundImage: `url(${TMDB_BACKDROP_BASE}${movie.backdrop_path})`,
                                }}
                            />
                        )}
                        <div className="hero-grad-left" />
                        <div className="hero-grad-bottom" />
                        <div className="hero-grad-top" />
                    </div>
                ))}
            </div>

            {/*
        ── TRAILER LAYER ─────────────────────────────────────────
        YouTube iframe covers the entire spotlight area.
        Shown immediately — no delay, no backdrop-first.
      */}
            {ytEmbedUrl && (
                <div className={`hero-trailer-wrap ${trailerReady ? 'hero-trailer-wrap--visible' : ''}`}>
                    <iframe
                        key={currentTrailerKey}
                        src={ytEmbedUrl}
                        title={`${currentMovie.title} trailer`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="hero-trailer-iframe"
                        onLoad={() => setTrailerReady(true)}
                    />
                    {/* Gradient overlays on top of the trailer */}
                    <div className="hero-grad-left" />
                    <div className="hero-grad-bottom" />
                    <div className="hero-grad-top" />
                </div>
            )}

            {/*
        ── CONTENT LAYER ─────────────────────────────────────────
      */}
            <div className="hero-content" key={activeIndex}>
                <p className="hero-eyebrow">
                    Spotlight&nbsp;
                    <span className="hero-eyebrow__num">#{activeIndex + 1}</span>
                </p>

                <h1 className="hero-title">
                    <MovieLogo
                        tmdbId={movies[activeIndex].id}
                        title={movies[activeIndex].title}
                        maxHeight="120px"
                    />
                </h1>

                <div className="hero-meta">
                    {movies[activeIndex].release_date && (
                        <span className="hero-meta__year">
                            {movies[activeIndex].release_date.substring(0, 4)}
                        </span>
                    )}
                    <span className="hero-meta__sep">·</span>
                    {movies[activeIndex].vote_average > 0 && (
                        <span className="hero-meta__rating">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                            </svg>
                            {Number(movies[activeIndex].vote_average).toFixed(1)}
                        </span>
                    )}
                    <span className="hero-meta__hd">HD</span>
                </div>

                {movies[activeIndex].overview && (
                    <p className="hero-overview">
                        {movies[activeIndex].overview.length > 180
                            ? movies[activeIndex].overview.substring(0, 180) + '…'
                            : movies[activeIndex].overview}
                    </p>
                )}

                <div className="hero-actions">
                    <button
                        className="hero-btn-primary"
                        onClick={() => navigate(`/watch/${movies[activeIndex].id}`)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                        Watch Now
                    </button>

                    <button
                        className="hero-btn-secondary"
                        onClick={() => navigate(`/watch/${movies[activeIndex].id}`)}
                    >
                        Details
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Left / Right arrow buttons ── */}
            {total > 1 && (
                <>
                    <button
                        className="hero-arrow hero-arrow--left"
                        onClick={() => goTo((activeIndex - 1 + total) % total)}
                        aria-label="Previous spotlight"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        className="hero-arrow hero-arrow--right"
                        onClick={() => goTo((activeIndex + 1) % total)}
                        aria-label="Next spotlight"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </>
            )}

            {/* ── Dot indicators ── */}
            <div className="hero-dots-bar" role="tablist" aria-label="Spotlight slides">
                {Array.from({ length: total }).map((_, i) => (
                    <button
                        key={i}
                        role="tab"
                        aria-selected={i === activeIndex}
                        aria-label={`Spotlight slide ${i + 1}: ${movies[i]?.title}`}
                        className={`hero-dot ${i === activeIndex ? 'active' : ''}`}
                        onClick={() => goTo(i)}
                    />
                ))}
            </div>

        </section>
    );
};

export default HeroBanner;
