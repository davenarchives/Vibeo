import { useState, useEffect } from 'react';
import { fetchTMDB } from '../api/tmdbClient';
import { useAuth } from '../context/AuthContext';

export const useBrowseMovies = (categoryId, page = 1) => {
    const { favoriteMovies } = useAuth();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [title, setTitle] = useState('');

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchCategory = async () => {
            let endpoint = '';
            let params = { page };
            let displayTitle = '';

            switch (categoryId) {
                case 'trending':
                    endpoint = '/trending/movie/week';
                    displayTitle = 'Trending This Week';
                    break;
                case 'top-rated':
                    endpoint = '/movie/top_rated';
                    displayTitle = 'Top Rated';
                    break;
                case 'action':
                    endpoint = '/discover/movie';
                    params.with_genres = '28';
                    displayTitle = 'Action & Adventure';
                    break;
                case 'drama':
                    endpoint = '/discover/movie';
                    params.with_genres = '18';
                    displayTitle = 'Drama';
                    break;
                case 'new-release':
                    endpoint = '/movie/now_playing';
                    displayTitle = 'New Releases';
                    break;
                case 'mood-match':
                    displayTitle = 'AI Mood Matches';
                    endpoint = '/discover/movie';
                    if (favoriteMovies && favoriteMovies.length > 0) {
                        const counts = {};
                        favoriteMovies.forEach(m => (m.genre_ids || []).forEach(g => counts[g] = (counts[g] || 0) + 1));
                        const topG = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 3).join(',');
                        if (topG) params.with_genres = topG;
                    }
                    break;
                default:
                    endpoint = '/trending/movie/week';
                    displayTitle = 'Browse Movies';
            }

            try {
                const data = await fetchTMDB(endpoint, params);
                if (isMounted && data) {
                    setMovies(data.results || []);
                    setTotalPages(Math.min(data.total_pages || 1, 500)); // TMDB max page limit is 500
                    setTitle(displayTitle);
                }
            } catch (error) {
                console.error('Error fetching browse movies:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCategory();

        return () => {
            isMounted = false;
        };
    }, [categoryId, page, favoriteMovies]);

    return { movies, loading, totalPages, title };
};
