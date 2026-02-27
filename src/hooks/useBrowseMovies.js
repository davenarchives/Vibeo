import { useState, useEffect } from 'react';
import { fetchTMDB } from '../api/tmdbClient';
import { MOOD_MOVIES } from '../data/moodData';

export const useBrowseMovies = (categoryId, page = 1) => {
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
                    // Local mock data
                    if (isMounted) {
                        // Mock 2 items per page for mood match if we want to show pagination
                        const mockPerPage = 4;
                        const total = Math.ceil(MOOD_MOVIES.length / mockPerPage);
                        const start = (page - 1) * mockPerPage;
                        setMovies(MOOD_MOVIES.slice(start, start + mockPerPage));
                        setTotalPages(total);
                        setTitle(displayTitle);
                        setLoading(false);
                    }
                    return;
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
    }, [categoryId, page]);

    return { movies, loading, totalPages, title };
};
