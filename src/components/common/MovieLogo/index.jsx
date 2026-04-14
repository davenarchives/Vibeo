import React, { useState } from 'react';
import useFanartLogo from '../../../hooks/useFanartLogo.js';
import './styles.css';

const MovieLogo = ({ tmdbId, title, type = 'movie', className = '', maxHeight = '90px', style = {} }) => {
    const { logoUrl, loading } = useFanartLogo(tmdbId, type);
    const [imgError, setImgError] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // If no logo found or image failed, just show the text forever
    const showFallback = !logoUrl || imgError;

    return (
        <div className={`movie-logo-container ${className}`} style={{ ...style }}>
            {/* 1. The text title is the 'anchor' that defines the component's size.
                  We keep it in the flow (relative) to prevent container collapse. */}
            <span 
                className={`movie-logo-text ${isReady ? 'movie-logo-text--hidden' : ''}`}
                style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
            >
                {title}
            </span>

            {/* 2. The Logo Image absolute-positions itself over the text. */}
            {logoUrl && !imgError && (
                <img
                    src={logoUrl}
                    alt={`${title} logo`}
                    className={`movie-logo-img ${isReady ? 'movie-logo-img--ready' : ''}`}
                    onLoad={() => setIsReady(true)}
                    onError={() => setImgError(true)}
                    loading="eager"
                    style={{
                        maxHeight: maxHeight || '100%',
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.6))',
                    }}
                />
            )}
        </div>
    );
};

export default MovieLogo;
