import React, { memo } from 'react';
import { TMDB_BACKDROP_BASE } from '../../../config/constants';

const HeroSlide = memo(({ movie, isActive }) => {
    return (
        <div className="hero-slide" aria-hidden={!isActive}>
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
    );
});

export default HeroSlide;
