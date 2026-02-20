import { useQuery } from '@tanstack/react-query';
import { fetchTMDB } from '../api/tmdbClient';
import { MOOD_MOVIES } from '../data/moodData';

export const useMovieDetail = (id) => {
    // 1. Fetch Movie Details
    const { data: movie, isLoading: loadingMovie, error: movieError } = useQuery({
        queryKey: ['movie', id],
        queryFn: async () => {
            // Check local first
            const local = MOOD_MOVIES.find(m => m.id === Number(id));
            if (local) return local;

            const data = await fetchTMDB(`/movie/${id}`);
            if (!data) throw new Error('Movie not found');
            return data;
        },
        enabled: !!id, // Only run if ID exists
    });

    // 2. Fetch Similar Movies
    const { data: similar = [] } = useQuery({
        queryKey: ['similar', id],
        queryFn: async () => {
            const data = await fetchTMDB(`/movie/${id}/similar`);
            return data?.results?.slice(0, 12) || [];
        },
        enabled: !!id,
    });

    return {
        movie,
        similar,
        loading: loadingMovie,
        error: movieError ? movieError.message : null
    };
};
