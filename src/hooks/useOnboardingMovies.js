import { useQuery } from '@tanstack/react-query';
import { fetchTMDB } from '../api/tmdbClient';

export const useOnboardingMovies = () => {
    const { data: movies = [], isLoading: loading, error } = useQuery({
        queryKey: ['onboarding-movies'],
        queryFn: async () => {
            // Fetch 3 pages of trending and popular movies to ensure plenty of options
            const [page1, page2, page3] = await Promise.all([
                fetchTMDB('/trending/movie/week', { page: 1 }),
                fetchTMDB('/trending/movie/week', { page: 2 }),
                fetchTMDB('/trending/movie/week', { page: 3 })
            ]);

            const allMovies = [
                ...(page1?.results || []),
                ...(page2?.results || []),
                ...(page3?.results || [])
            ];

            // Remove duplicates just in case
            const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

            return uniqueMovies;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    return { movies, loading, error };
};
