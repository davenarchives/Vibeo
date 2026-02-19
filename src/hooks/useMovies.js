import { useQuery } from '@tanstack/react-query';
import { fetchTMDB } from '../api/tmdbClient';

export const useMovies = () => {
    const { data: movies = [], isLoading: loading, error } = useQuery({
        queryKey: ['trending'],
        queryFn: async () => {
            const data = await fetchTMDB('/trending/movie/week');
            return data?.results || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { movies, loading, error };
};
