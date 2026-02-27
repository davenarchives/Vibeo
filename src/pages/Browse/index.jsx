import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MovieCard from '@/components/common/MovieCard';
import { useBrowseMovies } from '@/hooks/useBrowseMovies';
import './styles.css';

const Browse = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse page from URL query string, default to 1
    const queryParams = new URLSearchParams(location.search);
    const initialPage = parseInt(queryParams.get('page')) || 1;
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Sync state if URL changes directly
    useEffect(() => {
        const page = parseInt(queryParams.get('page')) || 1;
        setCurrentPage(page);
    }, [location.search]);

    const { movies, loading, totalPages, title } = useBrowseMovies(categoryId, currentPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            navigate(`/browse/${categoryId}?page=${newPage}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="pagination">
                <button
                    className="pagination-btn arrow"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                {startPage > 1 && (
                    <>
                        <button className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
                        {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                    </>
                )}

                {pages.map(p => (
                    <button
                        key={p}
                        className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageChange(p)}
                    >
                        {p}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                        <button className="pagination-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                    </>
                )}

                <button
                    className="pagination-btn arrow"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        );
    };

    return (
        <div className="page-wrapper">
            <Header />

            <main className="browse-main fade-in-up">
                <div className="browse-header">
                    <h1 className="browse-title">{title}</h1>
                </div>

                {loading ? (
                    <div className="loading-center" style={{ padding: '8rem 0' }}>
                        <div className="spinner" />
                        <p>Loading {title}...</p>
                    </div>
                ) : (
                    <>
                        {movies.length > 0 ? (
                            <div className="browse-grid">
                                {movies.map((movie, index) => (
                                    <div className="browse-card-wrap" key={`${movie.id}-${index}`}>
                                        <MovieCard
                                            movie={movie}
                                            onClick={(m) => navigate(`/watch/${m.id}`)}
                                            animationDelay={`${(index % 20) * 30}ms`}
                                            showMatchBadge={categoryId === 'mood-match'}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="browse-empty">
                                <h2>No movies found</h2>
                            </div>
                        )}

                        {renderPagination()}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Browse;
