import React, { memo } from 'react';

const TrailerPlayer = memo(({ trailerKey, title, onLoad }) => {
    if (!trailerKey) return null;

    const ytEmbedUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&loop=1&playlist=${trailerKey}&start=5&enablejsapi=1&origin=${window.location.origin}`;

    return (
        <div className="hero-trailer-wrap hero-trailer-wrap--visible">
            <iframe
                src={ytEmbedUrl}
                title={`${title} trailer`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="hero-trailer-iframe"
                onLoad={onLoad}
            />
            {/* Gradient overlays on top of the trailer */}
            <div className="hero-grad-left" />
            <div className="hero-grad-bottom" />
            <div className="hero-grad-top" />
        </div>
    );
});

export default TrailerPlayer;
