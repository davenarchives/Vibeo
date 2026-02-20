import { useQueries } from '@tanstack/react-query';
import { fetchTMDB } from '../api/tmdbClient';

export const useTrailers = (movies) => {
    const trailerQueries = useQueries({
        queries: (movies || []).map((movie) => ({
            queryKey: ['trailer', movie.id],
            queryFn: async () => {
                const data = await fetchTMDB(`/movie/${movie.id}/videos`);
                const videos = data?.results || [];
                // 1. Official Trailer
                const official = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
                // 2. Any Trailer
                const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
                // 3. Teaser
                const teaser = videos.find(v => v.site === 'YouTube' && v.type === 'Teaser');

                return (official || trailer || teaser)?.key || null;
            },
            staleTime: 1000 * 60 * 30, // 30 mins
            enabled: !!movie.id,
        })),
    });

    const trailerKeys = {};
    const isLoading = trailerQueries.some(q => q.isLoading);

    if (movies && movies.length > 0) {
        trailerQueries.forEach((query, index) => {
            const movie = movies[index];
            if (movie && query.data) {
                trailerKeys[movie.id] = query.data;
            }
        });
    }

    return { trailerKeys, loading: isLoading };
};
