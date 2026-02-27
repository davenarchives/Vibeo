import React from 'react';
import './styles.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <span className="site-footer__logo">Vibeo</span>
                <p>Powered by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a> &amp; <a href="https://videasy.net/" target="_blank" rel="noopener noreferrer">Videasy</a></p>
                <p>© 2026 Vibeo</p>
            </div>
        </footer>
    );
};

export default Footer;
